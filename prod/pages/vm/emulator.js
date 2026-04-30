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
  var ww = wrap.clientWidth;
  var wh = wrap.clientHeight;

  // Graphical canvas
  var canvas = wrap.querySelector('canvas');
  if (canvas) {
    var cw = canvas.width || 640;
    var ch = canvas.height || 480;
    canvas.style.width = ww + 'px';
    canvas.style.height = wh + 'px';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    try { emulator.screen_set_scale(ww / cw, wh / ch); } catch(e) {}
  }

  // Text-mode div (DOS/BIOS output)
  var divs = wrap.querySelectorAll(':scope > div');
  for (var i = 0; i < divs.length; i++) {
    var d = divs[i];
    if (d.id === 'boot-loader') continue;
    var sw = d.scrollWidth || 720;
    var sh = d.scrollHeight || 400;
    if (sw < 100) continue;
    d.style.position = 'absolute';
    d.style.top = '0';
    d.style.left = '0';
    d.style.transformOrigin = '0 0';
    d.style.transform = 'scale(' + (ww/sw) + ',' + (wh/sh) + ')';
  }
}

window.addEventListener('resize', function() { if (emulator) setTimeout(fixScale, 100); });

function setStatus(msg, color) {
  var el = document.getElementById('state');
  if (el) { el.textContent = msg; el.style.color = color; }
}
