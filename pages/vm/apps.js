// apps.js — VMs + web apps
var APPS = {
  'vm-win98':    { name:'Windows 98',   icon:'🪟', type:'vm', image:'win98' },
  'vm-alpine':   { name:'Alpine Linux', icon:'🐧', type:'vm', image:'linux' },
  'vm-arch':     { name:'Arch Linux',   icon:'🐧', type:'vm', image:'linux-full' },
  'vm-freedos':  { name:'FreeDOS',      icon:'💾', type:'vm', image:'freedos' },
  'gitcontrol':  { name:'GitControl',   icon:'🎛️', type:'web', url:'https://teslasolar.github.io/GITCONTROL/pages/' },
  'gitscada':    { name:'GitSCADA',     icon:'🏭', type:'web', url:'https://teslasolar.github.io/GITSCADA/pages/' },
  'githmi':      { name:'GitHMI',       icon:'🖥️', type:'web', url:'https://teslasolar.github.io/GITHMI/pages/' },
  'gittag':      { name:'GitTAG',       icon:'🏷️', type:'web', url:'https://teslasolar.github.io/GITTAG/pages/' },
  'gitplc':      { name:'GitPLC',       icon:'📐', type:'web', url:'https://teslasolar.github.io/GITPLC/pages/' },
};

var activeApp = null;

function launchApp(id) {
  var app = APPS[id];
  if (!app) return;
  activeApp = id;

  if (app.type === 'vm') {
    document.getElementById('app-frame').style.display = 'none';
    document.getElementById('screen-wrap').style.display = '';
    bootVM(app.image);
  } else {
    if (emulator) stopVM();
    document.getElementById('screen-wrap').style.display = 'none';
    var frame = document.getElementById('app-frame');
    frame.src = app.url;
    frame.style.display = '';
  }

  document.getElementById('boot-splash').classList.add('hidden');
  renderTaskbar();
}

function closeApp() {
  if (emulator) stopVM();
  activeApp = null;
  document.getElementById('app-frame').style.display = 'none';
  document.getElementById('app-frame').src = '';
  document.getElementById('screen-wrap').style.display = 'none';
  document.getElementById('boot-splash').classList.remove('hidden');
  renderTaskbar();
}
