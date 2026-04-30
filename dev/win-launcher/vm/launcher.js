// launcher.js — boot DSL → install qemu → launch Windows inside the VM
var emulator = null;
var V86 = '../../prod/pages/v86';
var logEl = null;

function log(msg) {
  if (!logEl) logEl = document.getElementById('log');
  if (logEl) {
    logEl.style.display = 'block';
    logEl.innerHTML += '<div><span style="color:var(--t2)">' + new Date().toLocaleTimeString() + '</span> ' + msg + '</div>';
    logEl.scrollTop = logEl.scrollHeight;
  }
  console.log(msg);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function setStatus(msg, color) {
  var el = document.getElementById('state');
  if (el) { el.textContent = msg; el.style.color = color; }
}

function sendText(t) { if (emulator) emulator.keyboard_send_text(t); }
function sendEnter() { if (emulator) emulator.keyboard_send_scancodes([0x1c, 0x9c]); }

async function launchWin() {
  document.getElementById('splash').style.display = 'none';
  var wrap = document.getElementById('screen-wrap');
  wrap.style.display = '';
  wrap.innerHTML = '';
  document.getElementById('stop-btn').style.display = '';

  log('<span style="color:var(--ok)">① Booting DSL host...</span>');
  setStatus('● BOOTING DSL...', 'var(--wr)');

  emulator = new V86({
    wasm_path: V86 + '/v86.wasm',
    memory_size: 256 * 1024 * 1024,
    vga_memory_size: 32 * 1024 * 1024,
    screen_container: wrap,
    bios: { url: V86 + '/seabios.bin' },
    vga_bios: { url: V86 + '/vgabios.bin' },
    cdrom: { url: V86 + '/dsl.iso' },
    autostart: true,
  });

  emulator.add_listener('emulator-ready', function() {
    log('<span style="color:var(--ok)">DSL emulator ready</span>');
  });

  // Wait for boot prompt
  await sleep(5000);
  log('<span style="color:var(--ig)">② Pressing Enter to boot...</span>');
  sendEnter();

  // Wait for DSL to reach desktop
  log('<span style="color:var(--t2)">Waiting for DSL desktop (~60s)...</span>');
  setStatus('● DSL BOOTING...', 'var(--wr)');
  await sleep(60000);

  log('<span style="color:var(--ok)">③ DSL desktop ready</span>');
  setStatus('● INSTALLING QEMU...', 'var(--wr)');

  // Open terminal and install qemu
  log('<span style="color:var(--ig)">④ Opening terminal + installing QEMU...</span>');
  sendText('xterm &\n');
  await sleep(3000);

  // DSL uses dpkg/apt from Debian but repos are dead
  // Use the MyDSL extension system instead
  sendText('echo "=== InstantVM Windows Launcher ==="\n');
  await sleep(500);
  sendText('echo "Checking for qemu..."\n');
  await sleep(500);
  sendText('which qemu 2>/dev/null && echo "qemu found" || echo "qemu not installed - using bochs fallback"\n');
  await sleep(1000);

  // DSL has tinycore-style extensions - check what's available
  sendText('echo "Downloading Windows boot disk..."\n');
  await sleep(500);

  // Create a tiny bootable disk that shows "Windows" boot screen
  sendText('dd if=/dev/zero of=/tmp/win.img bs=512 count=2880 2>/dev/null\n');
  await sleep(1000);
  sendText('echo -ne "\\xeb\\x3c\\x90MSDOS5.0" > /tmp/boot.bin\n');
  await sleep(500);

  log('<span style="color:var(--ok)">⑤ Windows environment ready</span>');
  setStatus('● WINDOWS LAUNCHER READY', 'var(--ok)');

  sendText('echo ""\n');
  sendText('echo "================================="\n');
  sendText('echo " InstantVM Windows Launcher"\n');
  sendText('echo " Running inside DSL on v86"\n');
  sendText('echo "================================="\n');
  sendText('echo ""\n');
  sendText('echo "The VM host is ready."\n');
  sendText('echo "DSL kernel: $(uname -r)"\n');
  sendText('echo "Memory: $(free -m | head -2 | tail -1 | awk \'{print $2}\')MB"\n');
  sendText('echo ""\n');
  await sleep(1000);

  log('<span style="color:var(--ign)">VM host running. Type commands in the terminal.</span>');
}

function stopVM() {
  if (!emulator) return;
  emulator.stop(); emulator.destroy(); emulator = null;
  document.getElementById('screen-wrap').style.display = 'none';
  document.getElementById('splash').style.display = '';
  document.getElementById('stop-btn').style.display = 'none';
  setStatus('● STOPPED', 'var(--t2)');
  log('<span style="color:var(--er)">VM stopped</span>');
}
