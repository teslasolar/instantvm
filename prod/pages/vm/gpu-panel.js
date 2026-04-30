// gpu-panel.js — render GPU status + bench UI in taskbar/overlay
async function renderGPUPanel() {
  var ok = await initGPU();
  var bar = document.getElementById('gpu-bar');
  if (!bar) return;

  if (!ok) {
    bar.innerHTML = '<span style="color:var(--t2)">GPU: ' + (gpu.info.error || 'unavailable') + '</span>';
    return;
  }

  bar.innerHTML = '<span style="color:var(--ok)">● GPU</span>'
    + '<span style="color:var(--t2)">' + (gpu.info.desc || gpu.info.vendor || 'WebGPU') + '</span>'
    + '<span class="btn" onclick="runBench()" id="bench-btn" style="font-size:6px">⚡ Bench</span>'
    + '<span id="bench-result" style="color:var(--ign);font-size:7px"></span>';
}

async function runBench() {
  var btn = document.getElementById('bench-btn');
  var res = document.getElementById('bench-result');
  if (btn) btn.textContent = '⏳...';

  var sizes = [1024, 16384, 65536];
  var results = [];
  for (var s of sizes) {
    var r = await gpuBench(s);
    results.push(r);
  }

  if (res) {
    res.innerHTML = results.map(function(r) {
      return r.size + ': ' + r.ms + 'ms (' + (r.ops/1000).toFixed(0) + 'K ops/s)';
    }).join(' · ');
  }
  if (btn) btn.textContent = '⚡ Bench';
}
