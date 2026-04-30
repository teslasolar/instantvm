// emulator.js — boot Windows in the browser via v86 WebAssembly
var emulator = null;

var V86_BASE = 'https://copy.sh/v86';

function bootWindows() {
  if (emulator) stopVM();

  document.getElementById('splash').classList.add('hidden');
  document.getElementById('screen-wrap').style.display = '';
  setStatus('● BOOTING WINDOWS...', 'var(--wr)');

  emulator = new V86({
    wasm_path: V86_BASE + '/build/v86.wasm',
    memory_size: 128 * 1024 * 1024,
    vga_memory_size: 8 * 1024 * 1024,
    screen_container: document.getElementById('screen-wrap'),
    hda: { url: V86_BASE + '/images/windows98.img', async: true, size: 300 * 1024 * 1024 },
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
  document.getElementById('splash').classList.remove('hidden');
  setStatus('● READY', 'var(--ok)');
}

function setStatus(msg, color) {
  var el = document.getElementById('state');
  if (el) { el.textContent = msg; el.style.color = color; }
}
