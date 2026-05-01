// launcher.js — render OS picker with flex cards + fullscreen/scale
function renderLauncher() {
  var el = document.getElementById('launcher');
  var cards = VM.images.map(function(img) {
    var isDocker = img.media === 'docker';
    var onclick = isDocker ? 'window.location.href=\'' + img.file + '\'' : 'launch(\'' + img.id + '\')';
    var badge = isDocker ? '<div style="background:var(--ok);color:#000;font-size:7px;padding:1px 5px;border-radius:3px;margin-top:3px;font-weight:700;display:inline-block">WebGPU</div>' : '';
    var mode = img.boot === 'gui' ? '<span style="color:var(--ok)">Desktop</span>' : '<span style="color:var(--ac)">Terminal</span>';
    return '<div class="card" onclick="' + onclick + '">'
      + '<div class="ico">' + img.icon + '</div>'
      + '<div class="name">' + img.name + '</div>'
      + badge
      + '<div class="sub">' + mode + '</div>'
      + '<div class="sub">' + img.size + ' · ' + img.mem + 'MB</div>'
      + '</div>';
  }).join('');

  el.innerHTML = '<div style="font-size:42px;margin-bottom:6px">⚡</div>'
    + '<h1 style="font-size:20px;font-weight:700;color:var(--wh)">InstantVM</h1>'
    + '<p style="color:var(--t2);font-size:9px;margin-top:4px">Real x86 VMs in your browser · WebGPU accelerated</p>'
    + '<div class="grid">' + cards + '</div>'
    + '<div style="display:flex;gap:6px;margin-top:12px;justify-content:center">'
    + '<button class="btn" onclick="goFullscreen()">⛶ Fullscreen</button>'
    + '<button class="btn" onclick="scaleVM(1)">1:1</button>'
    + '<button class="btn" onclick="scaleVM(0)">Fit</button>'
    + '</div>'
    + '<p id="state" style="color:var(--t2);font-size:6px;margin-top:8px">v86 WebAssembly · No install · Close tab = destroyed</p>';
}

function goFullscreen() {
  var el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}

function scaleVM(mode) {
  var canvas = document.querySelector('#vm-screen canvas');
  if (!canvas) return;
  if (mode === 1) {
    canvas.style.transform = 'scale(1)';
    canvas.style.transformOrigin = '0 0';
  } else {
    var sx = window.innerWidth / canvas.width;
    var sy = (window.innerHeight - 40) / canvas.height;
    var s = Math.min(sx, sy);
    canvas.style.transform = 'scale(' + s + ')';
    canvas.style.transformOrigin = '0 0';
  }
}

window.addEventListener('resize', function() { if (VM && VM.emulator) scaleVM(0); });
