// apps.js — hybrid: backend (local Electron) for real VMs, browser (v86) as fallback
var APPS = {
  'win-sandbox':  { name:'Windows Sandbox', icon:'🪟', type:'native', template:'ignition-designer' },
  'dev-sandbox':  { name:'Dev Sandbox',     icon:'🛠️', type:'native', template:'dev-sandbox' },
  'plc-sim':      { name:'PLC Sim',         icon:'📐', type:'native', template:'plc-sim' },
  'clean-browse': { name:'Clean Browser',   icon:'🌐', type:'native', template:'clean-browser' },
  'vm-win98':     { name:'Windows 98',      icon:'💾', type:'vm', image:'win98' },
  'vm-alpine':    { name:'Alpine Linux',    icon:'🐧', type:'vm', image:'linux' },
  'gitcontrol':   { name:'GitControl',      icon:'🎛️', type:'web', url:'https://teslasolar.github.io/GITCONTROL/pages/' },
  'gitscada':     { name:'GitSCADA',        icon:'🏭', type:'web', url:'https://teslasolar.github.io/GITSCADA/pages/' },
  'githmi':       { name:'GitHMI',          icon:'🖥️', type:'web', url:'https://teslasolar.github.io/GITHMI/pages/' },
  'gittag':       { name:'GitTAG',          icon:'🏷️', type:'web', url:'https://teslasolar.github.io/GITTAG/pages/' },
  'gitplc':       { name:'GitPLC',          icon:'📐', type:'web', url:'https://teslasolar.github.io/GITPLC/pages/' },
};

var activeApp = null;

async function launchApp(id) {
  var app = APPS[id];
  if (!app) return;
  activeApp = id;
  document.getElementById('boot-splash').classList.add('hidden');

  if (app.type === 'native') {
    if (!backendOnline) { setStatus('● START ELECTRON APP FIRST', 'var(--er)'); return; }
    setStatus('● LAUNCHING ' + app.name + '...', 'var(--wr)');
    var r = await backendLaunch(app.template);
    setStatus(r.ok ? '● ' + app.name + ' RUNNING' : '● ' + (r.error||'FAIL'), r.ok ? 'var(--ok)' : 'var(--er)');
  } else if (app.type === 'vm') {
    document.getElementById('app-frame').style.display = 'none';
    document.getElementById('screen-wrap').style.display = '';
    bootVM(app.image);
  } else {
    if (emulator) stopVM();
    document.getElementById('screen-wrap').style.display = 'none';
    var f = document.getElementById('app-frame');
    f.src = app.url; f.style.display = '';
  }
  renderTaskbar();
}

function closeApp() {
  if (emulator) stopVM();
  if (backendOnline && activeApp && APPS[activeApp]?.type === 'native') backendKill();
  activeApp = null;
  document.getElementById('app-frame').style.display = 'none';
  document.getElementById('app-frame').src = '';
  document.getElementById('screen-wrap').style.display = 'none';
  document.getElementById('boot-splash').classList.remove('hidden');
  setStatus('● READY', 'var(--ok)');
  renderTaskbar();
}

function setStatus(msg, color) {
  var el = document.getElementById('state');
  if (el) { el.textContent = msg; el.style.color = color; }
}
