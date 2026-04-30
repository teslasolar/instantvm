// emulator.js — multi-OS boot via v86 WebAssembly
var emulator = null;
var V86_BASE = 'v86';

var IMAGES = {
  dsl:        { name:'Damn Small Linux', mem:256, vga:32, cdrom:'dsl.iso' },
  linux:      { name:'Buildroot Linux',  mem:128, vga:8,  cdrom:'linux4.iso' },
  freedos:    { name:'FreeDOS',          mem:32,  vga:8,  fda:'freedos.img' },
  windows101: { name:'Windows 1.01',     mem:32,  vga:8,  fda:'windows101.img' },
};

function bootVM(id) {
  if (emulator) stopVM();
  var img = IMAGES[id];
  if (!img) return;

  document.getElementById('splash').style.display = 'none';
  var wrap = document.getElementById('screen-wrap');
  wrap.style.display = '';
  wrap.innerHTML = '<div id="boot-loader" style="color:#42e898;font-size:12px;font-family:monospace;padding:20px">Loading ' + img.name + '...</div>';
  setStatus('● LOADING ' + img.name + '...', 'var(--wr)');

  var config = {
    wasm_path: V86_BASE + '/v86.wasm',
    memory_size: img.mem * 1024 * 1024,
    vga_memory_size: img.vga * 1024 * 1024,
    screen_container: wrap,
    bios: { url: V86_BASE + '/seabios.bin' },
    vga_bios: { url: V86_BASE + '/vgabios.bin' },
    autostart: true,
  };

  if (img.fda) config.fda = { url: V86_BASE + '/' + img.fda };
  if (img.cdrom) config.cdrom = { url: V86_BASE + '/' + img.cdrom };

  try { emulator = new V86(config); }
  catch (e) { wrap.innerHTML = '<div style="color:#ff4466;padding:20px">v86 error: ' + e.message + '</div>'; return; }

  emulator.add_listener('emulator-ready', function() {
    var l = document.getElementById('boot-loader');
    if (l) l.remove();
    setStatus('● ' + img.name + ' RUNNING', 'var(--ok)');
    setTimeout(fixScale, 500);
  });

  emulator.add_listener('serial0-output-byte', function() {
    var l = document.getElementById('boot-loader');
    if (l) { l.remove(); setStatus('● BOOTING ' + img.name + '...', 'var(--wr)'); }
  });

  emulator.add_listener('screen-set-size-graphical', function() {
    setTimeout(fixScale, 200);
  });
}

function stopVM() {
  if (!emulator) return;
  emulator.stop(); emulator.destroy(); emulator = null;
  document.getElementById('screen-wrap').style.display = 'none';
  document.getElementById('splash').style.display = '';
  setStatus('● READY', 'var(--ok)');
}

function fixScale() {
  var wrap = document.getElementById('screen-wrap');
  if (!wrap || !emulator) return;
  var rect = wrap.getBoundingClientRect();
  var ww = rect.width;
  var wh = rect.height;

  // Graphical canvas — use CSS transform for pixel-perfect scaling
  var canvas = wrap.querySelector('canvas');
  if (canvas && canvas.width > 0) {
    var cw = canvas.width;
    var ch = canvas.height;
    var sx = ww / cw;
    var sy = wh / ch;
    canvas.style.cssText = 'position:absolute;top:0;left:0;transform-origin:0 0;'
      + 'transform:scale(' + sx + ',' + sy + ');image-rendering:pixelated;';
    try { emulator.screen_set_scale(sx, sy); } catch(e) {}
  }

  // Text-mode div (DOS/BIOS output)
  var divs = wrap.querySelectorAll(':scope > div');
  for (var i = 0; i < divs.length; i++) {
    var d = divs[i];
    if (d.id === 'boot-loader') continue;
    if (!d.children.length) continue;
    d.style.cssText = 'position:absolute;top:0;left:0;transform-origin:0 0;'
      + 'transform:scale(' + (ww / (d.scrollWidth || 720)) + ',' + (wh / (d.scrollHeight || 400)) + ')';
  }
}

window.addEventListener('resize', function() { if (emulator) setTimeout(fixScale, 100); });

function setStatus(msg, color) {
  var el = document.getElementById('state');
  if (el) { el.textContent = msg; el.style.color = color; }
}
