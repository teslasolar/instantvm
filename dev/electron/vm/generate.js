// generate.js — generate .wsb config from template
const fs = require('fs');
const path = require('path');
const os = require('os');

function generateWSB(template, overrides) {
  const cfg = { ...template, ...overrides };
  const folders = (cfg.folders || []).map(f =>
    `  <MappedFolder>\n    <HostFolder>${f.host}</HostFolder>\n    <SandboxFolder>${f.sandbox}</SandboxFolder>\n    <ReadOnly>${f.readOnly ? 'true' : 'false'}</ReadOnly>\n  </MappedFolder>`
  ).join('\n');

  const xml = `<Configuration>
<MappedFolders>
${folders}
</MappedFolders>
${cfg.setup ? `<LogonCommand>\n  <Command>${cfg.setup}</Command>\n</LogonCommand>` : ''}
<MemoryInMB>${cfg.memory || 4096}</MemoryInMB>
<vGPU>${cfg.vgpu ? 'Enable' : 'Disable'}</vGPU>
<Networking>Enable</Networking>
</Configuration>`;

  return xml;
}

function writeWSB(template, overrides) {
  const xml = generateWSB(template, overrides);
  const name = (template.name || 'vm').replace(/\s+/g, '-').toLowerCase();
  const wsbPath = path.join(os.tmpdir(), 'instantvm-' + name + '.wsb');
  fs.writeFileSync(wsbPath, xml, 'utf8');
  return wsbPath;
}

module.exports = { generateWSB, writeWSB };
