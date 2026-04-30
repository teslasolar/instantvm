// apps.js — Windows Sandbox VMs via local Electron backend
var APPS = {
  'ignition':  { name:'Ignition Designer', icon:'🔥', template:'ignition-designer' },
  'dev':       { name:'Dev Sandbox',       icon:'🛠️', template:'dev-sandbox' },
  'plc':       { name:'PLC Sim',           icon:'📐', template:'plc-sim' },
  'browser':   { name:'Clean Browser',     icon:'🌐', template:'clean-browser' },
};

var activeApp = null;

async function launchApp(id) {
  var app = APPS[id];
  if (!app) return;
  if (!backendOnline) { setStatus('● START ELECTRON APP FIRST', 'var(--er)'); return; }
  activeApp = id;
  setStatus('● LAUNCHING ' + app.name + '...', 'var(--wr)');
  document.getElementById('splash').classList.add('hidden');
  document.getElementById('running').classList.remove('hidden');
  document.getElementById('running-name').textContent = app.icon + ' ' + app.name;
  var r = await backendLaunch(app.template);
  setStatus(r.ok ? '● ' + app.name + ' RUNNING' : '● ' + (r.error||'FAIL'), r.ok ? 'var(--ok)' : 'var(--er)');
  renderTaskbar();
}

async function closeApp() {
  if (backendOnline) await backendKill();
  activeApp = null;
  document.getElementById('running').classList.add('hidden');
  document.getElementById('splash').classList.remove('hidden');
  setStatus('● READY', 'var(--ok)');
  renderTaskbar();
}

function setStatus(msg, color) {
  var el = document.getElementById('state');
  if (el) { el.textContent = msg; el.style.color = color; }
}
