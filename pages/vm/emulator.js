// emulator.js — boot OS in browser via v86 WebAssembly
var emulator = null;
var V86_BASE = 'v86';

function bootVM(image) {
  if (emulator) stopVM();

  document.getElementById('splash').style.display = 'none';
  var wrap = document.getElementById('screen-wrap');
  wrap.style.display = '';
  wrap.innerHTML = '<div id="boot-loader" style="color:#42e898;font-size:12px;font-family:monospace;padding:20px">Loading v86 WASM + BIOS + disk image...</div>';
  setStatus('● LOADING...', 'var(--wr)');

  var config = {
    wasm_path: V86_BASE + '/v86.wasm',
    memory_size: 32 * 1024 * 1024,
    vga_memory_size: 8 * 1024 * 1024,
    screen_container: wrap,
    bios: { url: V86_BASE + '/seabios.bin' },
    vga_bios: { url: V86_BASE + '/vgabios.bin' },
    autostart: true,
  };

  if (image === 'freedos') config.fda = { url: V86_BASE + '/freedos.img' };
  else config.fda = { url: V86_BASE + '/windows101.img' };

  try {
    emulator = new V86(config);
  } catch (e) {
    wrap.innerHTML = '<div style="color:#ff4466;padding:20px">v86 failed: ' + e.message + '</div>';
    setStatus('● ERROR', 'var(--er)');
    return;
  }

  emulator.add_listener('emulator-ready', function() {
    var loader = document.getElementById('boot-loader');
    if (loader) loader.remove();
    setStatus('● RUNNING', 'var(--ok)');
  });

  emulator.add_listener('serial0-output-byte', function(byte) {
    var loader = document.getElementById('boot-loader');
    if (loader) { loader.remove(); setStatus('● BOOTING...', 'var(--wr)'); }
  });
}

function bootWindows() { bootVM('windows'); }

function stopVM() {
  if (!emulator) return;
  emulator.stop();
  emulator.destroy();
  emulator = null;
  document.getElementById('screen-wrap').style.display = 'none';
  document.getElementById('splash').style.display = '';
  setStatus('● READY', 'var(--ok)');
}

function setStatus(msg, color) {
  var el = document.getElementById('state');
  if (el) { el.textContent = msg; el.style.color = color; }
}
