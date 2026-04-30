// boot.js — boot v86 emulator with selected OS image
var emulator = null;

var IMAGES = {
  'linux': {
    name: 'Alpine Linux',
    icon: '🐧',
    bzimage: 'https://i.copy.sh/v86/alpine-bzImage',
    rootfs: 'https://i.copy.sh/v86/alpine-rootfs.bin',
    mem: 128,
  },
  'freedos': {
    name: 'FreeDOS',
    icon: '💾',
    fda: 'https://i.copy.sh/v86/freedos722.img',
    mem: 32,
  },
  'linux-full': {
    name: 'Arch Linux',
    icon: '🐧',
    bzimage: 'https://i.copy.sh/v86/arch-linux-bzImage',
    rootfs: 'https://i.copy.sh/v86/arch-linux-rootfs.bin',
    mem: 512,
  },
};

async function bootVM(imageId) {
  var img = IMAGES[imageId];
  if (!img) return;

  document.getElementById('boot-splash').classList.add('hidden');
  document.getElementById('screen-wrap').style.display = '';
  document.getElementById('state').textContent = '● BOOTING ' + img.name + '...';
  document.getElementById('state').style.color = 'var(--wr)';

  var config = {
    wasm_path: 'https://copy.sh/v86/build/v86.wasm',
    screen_container: document.getElementById('screen-wrap'),
    memory_size: img.mem * 1024 * 1024,
    vga_memory_size: 8 * 1024 * 1024,
    autostart: true,
  };

  if (img.bzimage) {
    config.bzimage = { url: img.bzimage };
    config.initrd = { url: img.rootfs };
  }
  if (img.fda) config.fda = { url: img.fda };

  emulator = new V86(config);

  emulator.add_listener('emulator-ready', function() {
    document.getElementById('state').textContent = '● RUNNING ' + img.name;
    document.getElementById('state').style.color = 'var(--ok)';
  });
}

function stopVM() {
  if (emulator) { emulator.stop(); emulator.destroy(); emulator = null; }
  document.getElementById('state').textContent = '● STOPPED';
  document.getElementById('state').style.color = 'var(--t2)';
  document.getElementById('boot-splash').classList.remove('hidden');
}
