// launcher.js — render the OS picker grid from config
function renderLauncher() {
  var el = document.getElementById('launcher');
  var cards = VM.images.map(function(img) {
    return '<div class="card" onclick="launch(\'' + img.id + '\')">'
      + '<div class="ico">' + img.icon + '</div>'
      + '<div class="name">' + img.name + '</div>'
      + '<div class="sub" style="color:var(--ok)">' + (img.boot === 'gui' ? 'Desktop' : 'Terminal') + '</div>'
      + '<div class="sub">' + img.size + ' · ' + img.mem + 'MB</div>'
      + '</div>';
  }).join('');

  el.innerHTML = '<div style="font-size:42px;margin-bottom:6px">⚡</div>'
    + '<h1 style="font-size:20px;font-weight:700;color:var(--wh)">InstantVM</h1>'
    + '<p style="color:var(--t2);font-size:9px;margin-top:4px">Real x86 VMs in your browser</p>'
    + '<div class="grid">' + cards + '</div>'
    + '<p style="color:var(--t2);font-size:6px;margin-top:12px">v86 WebAssembly · No install · Close tab = destroyed</p>';
}
