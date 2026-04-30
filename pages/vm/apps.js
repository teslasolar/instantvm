// apps.js — download .wsb → Windows Sandbox boots → installs + runs Electron
var APPS = {
  'ignition':  { name:'Ignition Designer', icon:'🔥', template:'ignition-designer', mem:4096 },
  'dev':       { name:'Dev Sandbox',       icon:'🛠️', template:'dev-sandbox',       mem:4096 },
  'plc':       { name:'PLC Sim',           icon:'📐', template:'plc-sim',           mem:2048 },
  'browser':   { name:'Clean Browser',     icon:'🌐', template:'clean-browser',     mem:2048 },
};

function launchApp(id) {
  var app = APPS[id];
  if (!app) return;
  setStatus('● GENERATING ' + app.name + '.wsb ...', 'var(--wr)');
  downloadWSB(app.template, app.mem);
  setStatus('● DOWNLOADED — open the .wsb file to boot the VM', 'var(--ok)');
  document.getElementById('splash').classList.add('hidden');
  document.getElementById('running').classList.remove('hidden');
  document.getElementById('running-name').textContent = app.icon + ' ' + app.name;
}

function setStatus(msg, color) {
  var el = document.getElementById('state');
  if (el) { el.textContent = msg; el.style.color = color; }
}
