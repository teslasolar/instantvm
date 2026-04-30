// panel.js — GPU status in taskbar
async function renderGPUPanel() {
  var ok = await initGPU();
  var el = document.getElementById('gpu-bar');
  if (!el) return;
  if (!ok) { el.innerHTML = '<span style="color:var(--t2)">GPU: ' + (GPU.info.error||'n/a') + '</span>'; return; }
  el.innerHTML = '<span style="color:var(--ok)">● GPU</span>'
    + '<span style="color:var(--t2)">' + (GPU.info.desc||GPU.info.vendor||'WebGPU') + '</span>'
    + '<span class="btn" onclick="runBench()" id="bench-btn">⚡ Bench</span>'
    + '<span id="bench-out" style="color:var(--gd)"></span>';
}

async function runBench() {
  var btn = document.getElementById('bench-btn');
  if (btn) btn.textContent = '⏳';
  var r = await gpuBench(65536);
  if (btn) btn.textContent = '⚡ Bench';
  var out = document.getElementById('bench-out');
  if (out && r) out.textContent = r.size+': '+r.ms+'ms ('+Math.round(r.ops/1000)+'K/s)';
}
