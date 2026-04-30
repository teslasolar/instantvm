// screen.js — show/hide/fit the VM display to the viewport
function showScreen() {
  document.getElementById('launcher').style.display = 'none';
  var scr = document.getElementById('vm-screen');
  scr.style.display = 'block';
  scr.innerHTML = '';
  document.getElementById('stop-btn').style.display = '';
}

function hideScreen() {
  document.getElementById('vm-screen').style.display = 'none';
  document.getElementById('launcher').style.display = '';
  document.getElementById('stop-btn').style.display = 'none';
}

function fitScreen() {
  var scr = document.getElementById('vm-screen');
  if (!scr || !VM.emulator) return;
  var sw = scr.clientWidth;
  var sh = scr.clientHeight;
  if (!sw || !sh) return;

  // Graphical canvas
  var canvas = scr.querySelector('canvas');
  if (canvas && canvas.width > 10) {
    var sx = sw / canvas.width;
    var sy = sh / canvas.height;
    canvas.style.cssText = 'display:block;transform-origin:0 0;image-rendering:pixelated;'
      + 'transform:scale(' + sx + ',' + sy + ')';
    try { VM.emulator.screen_set_scale(sx, sy); } catch(e) {}
    return;
  }

  // Text-mode: v86 creates a div with span rows (80 cols, ~25 rows)
  var divs = scr.querySelectorAll(':scope > div');
  for (var i = 0; i < divs.length; i++) {
    var d = divs[i];
    if (!d.children.length) continue;
    // Reset transform to measure natural size
    d.style.transform = 'none';
    d.style.position = 'absolute';
    d.style.top = '0';
    d.style.left = '0';
    var dw = d.offsetWidth || d.scrollWidth;
    var dh = d.offsetHeight || d.scrollHeight;
    if (dw < 50) continue;
    d.style.transformOrigin = '0 0';
    d.style.transform = 'scale(' + (sw / dw) + ',' + (sh / dh) + ')';
  }
}

window.addEventListener('resize', function() { if (VM.emulator) setTimeout(fitScreen, 100); });
