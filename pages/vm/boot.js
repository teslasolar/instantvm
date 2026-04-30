// boot.js — boot v86 emulator with selected OS image
var emulator = null;

var IMAGES = {
  'win98': {
    name: 'Windows 98',
    icon: '🪟',
    hda: 'https://copy.sh/v86/images/windows98.img',
    mem: 128,
    vga: 32,
  },
  'linux': {
    name: 'Alpine Linux',
    icon: '🐧',
    bzimage: 'https://copy.sh/v86/images/bzImage',
    rootfs: 'https://copy.sh/v86/images/linux4.iso',
    mem: 128,
  },
  'freedos': {
    name: 'FreeDOS',
    icon: '💾',
    fda: 'https://copy.sh/v86/images/freedos722.img',
    mem: 32,
  },
  'linux-full': {
    name: 'Arch Linux',
    icon: '🐧',
    cdrom: 'https://copy.sh/v86/images/arch-linux.iso',
    mem: 512,
  },
};

async function bootVM(imageId) {
  if (emulator) stopVM();
  var img = IMAGES[imageId];
  if (!img) return;

  document.getElementById('boot-splash').classList.add('hidden');
  document.getElementById('screen-wrap').style.display = '';
  document.getElementById('state').textContent = '● BOOTING ' + img.name + '...';
  document.getElementById('state').style.color = 'var(--wr)';

  var config = {
    wasm_path: 'https://copy.sh/v86/build/v86.wasm',
    screen_container: document.getElementById('screen-wrap'),
    memory_size: (img.mem || 128) * 1024 * 1024,
    vga_memory_size: (img.vga || 8) * 1024 * 1024,
    autostart: true,
  };

  if (img.bzimage) config.bzimage = { url: img.bzimage };
  if (img.rootfs) config.cdrom = { url: img.rootfs };
  if (img.cdrom) config.cdrom = { url: img.cdrom };
  if (img.fda) config.fda = { url: img.fda };
  if (img.hda) config.hda = { url: img.hda, async: true, size: 300 * 1024 * 1024 };

  emulator = new V86(config);

  emulator.add_listener('emulator-ready', function() {
    document.getElementById('state').textContent = '● RUNNING ' + img.name;
    document.getElementById('state').style.color = 'var(--ok)';
  });
}

function stopVM() {
  if (emulator) { emulator.stop(); emulator.destroy(); emulator = null; }
  document.getElementById('screen-wrap').style.display = 'none';
  document.getElementById('state').textContent = '● STOPPED';
  document.getElementById('state').style.color = 'var(--t2)';
}
