// bar.js — taskbar renderer
function renderBar() {
  document.getElementById('bar').innerHTML =
    '<span id="state" style="color:var(--ok)">● READY</span>'
    + '<span style="color:var(--b)">│</span>'
    + '<span id="gpu-bar" style="display:flex;gap:4px;align-items:center"></span>'
    + '<span style="flex:1"></span>'
    + '<span class="btn" onclick="stopVM()" style="display:none" id="stop-btn">■ Stop</span>'
    + '<span style="color:var(--t2);margin-left:4px">InstantVM</span>'
    + '<span id="clock" style="color:var(--t2);margin-left:4px"></span>';
}

function setStatus(msg, color) {
  var el = document.getElementById('state');
  if (el) { el.textContent = msg; el.style.color = color; }
}

setInterval(function() {
  var el = document.getElementById('clock');
  if (el) el.textContent = new Date().toLocaleTimeString();
}, 1000);
