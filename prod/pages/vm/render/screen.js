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
  if (!VM.emulator) return;
  var scr = document.getElementById('vm-screen');
  if (!scr) return;

  // Find v86's native output size
  var canvas = scr.querySelector('canvas');
  var isRealCanvas = canvas && canvas.width > 320 && canvas.style.display !== 'none';
  var nw, nh;
  if (isRealCanvas) {
    nw = canvas.width;
    nh = canvas.height;
  } else {
    nw = 720;
    nh = 400;
  }

  // Scale the whole screen container via CSS
  var parent = scr.parentElement;
  var pw = parent.clientWidth;
  var ph = parent.clientHeight;
  var sx = pw / nw;
  var sy = ph / nh;

  scr.style.cssText = 'display:block;width:' + nw + 'px;height:' + nh + 'px;'
    + 'transform-origin:0 0;transform:scale(' + sx + ',' + sy + ');'
    + 'background:#000;overflow:hidden;position:absolute;top:0;left:0';

  if (canvas) {
    try { VM.emulator.screen_set_scale(sx, sy); } catch(e) {}
  }
}

window.addEventListener('resize', function() { if (VM.emulator) setTimeout(fitScreen, 100); });
