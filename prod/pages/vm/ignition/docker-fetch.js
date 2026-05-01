// docker-fetch.js — pull Docker manifest + layers from registry
var REGISTRY = 'https://registry-1.docker.io/v2';
var AUTH_URL = 'https://auth.docker.io/token?service=registry.docker.io&scope=repository:';

async function getToken(image) {
  var r = await fetch(AUTH_URL + image + ':pull');
  return (await r.json()).token;
}

async function getManifest(image, tag, token) {
  var idxR = await fetch(REGISTRY + '/' + image + '/manifests/' + tag, {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.oci.image.index.v1+json,application/vnd.docker.distribution.manifest.list.v2+json' }
  });
  var idx = await idxR.json();
  var amd64 = (idx.manifests || []).find(function(m) { return m.platform && m.platform.architecture === 'amd64'; });
  if (!amd64) return null;
  var manR = await fetch(REGISTRY + '/' + image + '/manifests/' + amd64.digest, {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.oci.image.manifest.v1+json' }
  });
  return manR.json();
}

async function fetchLayer(image, token, digest, onProgress) {
  var r = await fetch(REGISTRY + '/' + image + '/blobs/' + digest, { headers: { Authorization: 'Bearer ' + token } });
  var reader = r.body.getReader();
  var chunks = [];
  var loaded = 0;
  while (true) {
    var result = await reader.read();
    if (result.done) break;
    chunks.push(result.value);
    loaded += result.value.length;
    if (onProgress) onProgress(loaded);
  }
  return new Blob(chunks);
}
