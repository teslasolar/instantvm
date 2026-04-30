// taskbar.js — bottom taskbar with app launcher + running indicator
function renderTaskbar() {
  var tb = document.getElementById('taskbar');
  if (!tb) return;
  tb.innerHTML = Object.entries(APPS).map(function(e) {
    var id = e[0], app = e[1];
    var active = activeApp === id;
    var cls = active ? 'tb-btn active' : 'tb-btn';
    return '<span class="'+cls+'" onclick="launchApp(\''+id+'\')" title="'+app.name+'">'+app.icon+'</span>';
  }).join('')
    + '<span style="flex:1"></span>'
    + (activeApp ? '<span class="tb-btn close" onclick="closeApp()">✕</span>' : '')
    + '<span class="tb-clock" id="tb-clock"></span>';
}

function tickClock() {
  var el = document.getElementById('tb-clock');
  if (el) el.textContent = new Date().toLocaleTimeString();
}
setInterval(tickClock, 1000);
