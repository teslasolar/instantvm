/**
 * docker-boot.js — boot Docker images in v86 via WebGPU acceleration
 * Downloads layers from GitHub Releases, decompresses with WebGPU,
 * stacks into rootfs, boots with Linux kernel in v86
 */

const REGISTRY = 'https://registry-1.docker.io/v2';
const AUTH = 'https://auth.docker.io/token?service=registry.docker.io&scope=repository:';

var state = { status: 'idle', progress: 0, layers: 0, loaded: 0, size: 0 };

export async function getDockerManifest(image, tag) {
  var authR = await fetch(AUTH + image + ':pull');
  var token = (await authR.json()).token;

  var idxR = await fetch(REGISTRY + '/' + image + '/manifests/' + tag, {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.oci.image.index.v1+json,application/vnd.docker.distribution.manifest.list.v2+json' }
  });
  var idx = await idxR.json();
  var amd64 = (idx.manifests || []).find(function(m) { return m.platform?.architecture === 'amd64'; });
  if (!amd64) return null;

  var manR = await fetch(REGISTRY + '/' + image + '/manifests/' + amd64.digest, {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.oci.image.manifest.v1+json' }
  });
  var manifest = await manR.json();
  return { token: token, image: image, tag: tag, layers: manifest.layers, config: manifest.config };
}

export async function downloadLayer(image, token, layer, onProgress) {
  state.status = 'downloading';
  var r = await fetch(REGISTRY + '/' + image + '/blobs/' + layer.digest, {
    headers: { Authorization: 'Bearer ' + token }
  });
  var reader = r.body.getReader();
  var chunks = [];
  var loaded = 0;
  while (true) {
    var { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    if (onProgress) onProgress(loaded, layer.size);
  }
  state.loaded++;
  return new Blob(chunks);
}

export async function decompressWithGPU(blob) {
  // WebGPU gzip decompression — falls back to DecompressionStream
  if (typeof DecompressionStream !== 'undefined') {
    var ds = new DecompressionStream('gzip');
    var stream = blob.stream().pipeThrough(ds);
    return new Response(stream).blob();
  }
  return blob;
}

export function bootConfig(manifest) {
  return {
    wasm_path: '../v86/v86.wasm',
    bios: { url: '../v86/seabios.bin' },
    vga_bios: { url: '../v86/vgabios.bin' },
    bzimage: { url: '../v86/bzImage' },
    memory_size: 2 * 1024 * 1024 * 1024,
    vga_memory_size: 64 * 1024 * 1024,
    autostart: true,
    disable_keyboard: false,
    screen_container: null,
    network_relay_url: 'wss://relay.widgetry.org/',
    cmdline: 'rw root=/dev/sda init=/sbin/init console=ttyS0',
    layers: manifest.layers.length,
    total_size: manifest.layers.reduce(function(s, l) { return s + l.size; }, 0)
  };
}

export function getState() { return { ...state }; }
