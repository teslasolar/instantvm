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

  // Text-mode: reset v86 overrides, measure natural size, then CSS scale to fill
  var divs = scr.querySelectorAll(':scope > div');
  for (var i = 0; i < divs.length; i++) {
    var d = divs[i];
    if (!d.children.length) continue;
    d.removeAttribute('style');
    void d.offsetWidth;
    var nw = d.offsetWidth || 720;
    var nh = d.offsetHeight || 380;
    d.style.cssText = 'position:absolute;top:0;left:0;transform-origin:0 0;'
      + 'transform:scale(' + (sw/nw) + ',' + (sh/nh) + ')';
  }
}

window.addEventListener('resize', function() { if (VM.emulator) setTimeout(fitScreen, 100); });
