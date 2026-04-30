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

  // Text-mode: override v86's inline font, scale to fit
  var divs = scr.querySelectorAll(':scope > div');
  for (var i = 0; i < divs.length; i++) {
    var d = divs[i];
    if (!d.children.length) continue;
    // Calculate font size so 80 chars fill the width
    var fontSize = Math.floor(sw / 80 * 0.95);
    d.style.cssText = 'position:absolute;top:0;left:0;width:' + sw + 'px;height:' + sh + 'px;overflow:hidden';
    var spans = d.querySelectorAll('span');
    for (var j = 0; j < spans.length; j++) {
      spans[j].style.fontSize = fontSize + 'px';
      spans[j].style.lineHeight = '1.15';
    }
  }
}

window.addEventListener('resize', function() { if (VM.emulator) setTimeout(fitScreen, 100); });
