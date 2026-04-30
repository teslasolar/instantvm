// emulator.js — boot Windows in browser via v86 WebAssembly
var emulator = null;
var V86_BASE = 'v86';

function bootWindows() {
  if (emulator) stopVM();

  var splash = document.getElementById('splash');
  var wrap = document.getElementById('screen-wrap');
  splash.style.display = 'none';
  wrap.style.display = 'flex';
  wrap.style.alignItems = 'center';
  wrap.style.justifyContent = 'center';
  wrap.style.background = '#000';
  setStatus('● BOOTING WINDOWS...', 'var(--wr)');

  emulator = new V86({
    wasm_path: V86_BASE + '/v86.wasm',
    memory_size: 32 * 1024 * 1024,
    vga_memory_size: 2 * 1024 * 1024,
    screen_container: document.getElementById('screen-wrap'),
    fda: { url: V86_BASE + '/windows101.img' },
    autostart: true,
  });

  emulator.add_listener('emulator-ready', function() {
    setStatus('● WINDOWS RUNNING', 'var(--ok)');
  });
}

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
