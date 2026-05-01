// boot.js — config-driven v86 boot
var VM = { emulator:null, image:null, manifest:null, images:[] };

async function loadConfig() {
  VM.manifest = await (await fetch('config/manifest.json')).json();
  VM.images = await (await fetch('config/images.json')).json();
}

function bootVM(id) {
  if (VM.emulator) stopVM();
  VM.image = VM.images.find(function(i){ return i.id === id; });
  if (!VM.image) return;
  if (VM.image.media === 'docker') { window.location.href = VM.image.file; return; }

  var m = VM.manifest;
  var img = VM.image;
  showScreen();
  setStatus('● LOADING ' + img.name + '...', 'var(--wr)');

  var config = {
    wasm_path: m.v86.wasm,
    memory_size: (img.mem || m.defaults.memory_mb) * 1024 * 1024,
    vga_memory_size: (img.vga || m.defaults.vga_mb) * 1024 * 1024,
    screen_container: document.getElementById('vm-screen'),
    bios: { url: m.v86.bios },
    vga_bios: { url: m.v86.vga_bios },
    autostart: m.defaults.autostart,
  };

  if (img.media === 'fda') config.fda = { url: 'v86/' + img.file };
  if (img.media === 'cdrom') config.cdrom = { url: 'v86/' + img.file };

  try { VM.emulator = new V86(config); }
  catch (e) { setStatus('● ERROR: ' + e.message, 'var(--er)'); return; }

  VM.emulator.add_listener('emulator-ready', function() {
    setStatus('● ' + img.name, 'var(--ok)');
    fitScreen();
  });
  VM.emulator.add_listener('screen-set-size-graphical', function() {
    setTimeout(fitScreen, 200);
  });

  // Refit periodically during boot (text mode has no size event)
  var fitCount = 0;
  var fitTimer = setInterval(function() {
    fitScreen();
    if (++fitCount > 30) clearInterval(fitTimer);
  }, 1000);
}

function stopVM() {
  if (!VM.emulator) return;
  VM.emulator.stop(); VM.emulator.destroy();
  VM.emulator = null; VM.image = null;
  hideScreen();
  setStatus('● READY', 'var(--ok)');
}
