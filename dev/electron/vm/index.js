const templates = require('./templates');
const { writeWSB } = require('./generate');
const launcher = require('./launcher');

function launchTemplate(name, overrides) {
  const tpl = templates[name];
  if (!tpl) return { ok: false, error: 'unknown template: ' + name, available: Object.keys(templates) };
  const wsb = writeWSB(tpl, overrides);
  return launcher.launch(wsb, () => {});
}

function list() {
  return Object.entries(templates).map(([id, t]) => ({
    id, name: t.name, icon: t.icon, desc: t.desc, memory: t.memory,
  }));
}

module.exports = { launchTemplate, list, ...launcher, templates };
