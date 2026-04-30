// emulator.js — boot OS in browser via v86 WebAssembly
var emulator = null;
var V86_BASE = 'v86';

function bootVM(image) {
  if (emulator) stopVM();

  document.getElementById('splash').style.display = 'none';
  var wrap = document.getElementById('screen-wrap');
  wrap.style.display = '';
  wrap.innerHTML = '';
  setStatus('● BOOTING...', 'var(--wr)');

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

  emulator = new V86(config);
  emulator.add_listener('emulator-ready', function() {
    setStatus('● RUNNING', 'var(--ok)');
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
