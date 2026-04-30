// autoboot.js — type commands into the VM after boot
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function autoType(text, delay) {
  if (!emulator) return;
  emulator.keyboard_send_text(text);
  await sleep(delay || 500);
}

async function sendEnter() {
  if (!emulator) return;
  emulator.keyboard_send_scancodes([0x1c, 0x1c | 0x80]);
  await sleep(300);
}

async function autoBoot(id) {
  launch(id);

  if (id === 'dsl') {
    await sleep(5000);
    await sendEnter();
    setStatus('● DSL booting to desktop...', 'var(--wr)');

    await sleep(45000);
    setStatus('● Installing tools...', 'var(--wr)');

    await autoType('xterm -e "sh /cdrom/boot/autorun.sh" &\n', 1000);
  }

  if (id === 'linux') {
    await sleep(15000);
    setStatus('● Running setup...', 'var(--wr)');
    await autoType('echo "InstantVM ready"\n', 500);
  }
}

async function typeInVM(text) {
  if (!emulator) return;
  emulator.keyboard_send_text(text + '\n');
}
