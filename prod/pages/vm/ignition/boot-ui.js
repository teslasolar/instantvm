// boot-ui.js — Ignition boot UI logic
function log(msg) { var el = document.getElementById('log'); el.textContent = msg + '\n' + el.textContent; }
function setStatus(s) { document.getElementById('s-status').textContent = s; }
function setProgress(n, total) {
  document.getElementById('s-bar').style.width = (n / total * 100) + '%';
  document.getElementById('s-progress').textContent = n + ' / ' + total + ' layers';
}

async function checkGPU() {
  if (navigator.gpu) {
    var adapter = await navigator.gpu.requestAdapter();
    if (adapter) {
      var info = await adapter.requestAdapterInfo();
      document.getElementById('s-gpu').textContent = info.vendor || 'Available';
      document.getElementById('s-gpu').style.color = 'var(--green)';
      log('WebGPU: ' + JSON.stringify(info));
    } else {
      document.getElementById('s-gpu').textContent = 'No adapter';
      document.getElementById('s-gpu').style.color = 'var(--orange)';
    }
  } else {
    document.getElementById('s-gpu').textContent = 'Not supported';
    document.getElementById('s-gpu').style.color = 'var(--orange)';
    log('WebGPU not available — using CPU fallback');
  }
}
checkGPU();
