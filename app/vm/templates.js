// templates.js — built-in VM templates
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

module.exports = {
  'ignition-designer': {
    name: 'Ignition Designer',
    icon: '🔥',
    memory: 4096,
    vgpu: true,
    folders: [
      { host: path.join(ROOT, '..', 'ignition', 'modules', 'electron', 'sandbox'), sandbox: 'C:\\Sandbox' },
    ],
    setup: 'C:\\Sandbox\\vm\\setup.cmd',
    desc: 'Ignition Designer with cached JRE + gateway connect',
  },
  'dev-sandbox': {
    name: 'Dev Sandbox',
    icon: '🛠️',
    memory: 4096,
    vgpu: false,
    folders: [
      { host: path.join(ROOT, '..'), sandbox: 'C:\\Projects', readOnly: true },
    ],
    setup: null,
    desc: 'Clean environment with mapped project folder',
  },
  'plc-sim': {
    name: 'PLC Simulator',
    icon: '📐',
    memory: 2048,
    vgpu: false,
    folders: [
      { host: path.join(ROOT, '..', 'controls', 'PLC'), sandbox: 'C:\\PLC', readOnly: true },
    ],
    setup: null,
    desc: 'GitPLC mounted read-only for simulation',
  },
  'clean-browser': {
    name: 'Clean Browser',
    icon: '🌐',
    memory: 2048,
    vgpu: true,
    folders: [],
    setup: null,
    desc: 'Isolated browser — no host access',
  },
};
