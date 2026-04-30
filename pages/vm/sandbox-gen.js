// sandbox-gen.js — generate .wsb files that auto-install + run Electron inside the VM
var REPO = 'https://github.com/teslasolar/instantvm';
var NODE_URL = 'https://nodejs.org/dist/v22.15.0/node-v22.15.0-x64.msi';

function makeSetupScript(template) {
  return [
    '@echo off',
    'title InstantVM · ' + template + ' · Setting up...',
    'echo ════════════════════════════════════════',
    'echo  InstantVM · Self-Installing Sandbox',
    'echo ════════════════════════════════════════',
    'echo.',
    '',
    'echo [1/4] Installing Node.js...',
    'powershell -Command "Invoke-WebRequest -Uri \'' + NODE_URL + '\' -OutFile C:\\node.msi"',
    'msiexec /i C:\\node.msi /qn /norestart',
    'set PATH=%PATH%;C:\\Program Files\\nodejs',
    'echo.',
    '',
    'echo [2/4] Cloning InstantVM...',
    'powershell -Command "Invoke-WebRequest -Uri \'' + REPO + '/archive/refs/heads/master.zip\' -OutFile C:\\instantvm.zip"',
    'powershell -Command "Expand-Archive C:\\instantvm.zip -DestinationPath C:\\"',
    'cd C:\\instantvm-master',
    'echo.',
    '',
    'echo [3/4] Installing dependencies...',
    'call npm install --production 2>nul',
    'echo.',
    '',
    'echo [4/4] Launching Electron...',
    'call npx electron . --template=' + template,
    'echo.',
    'echo VM session ended.',
    'pause',
  ].join('\r\n');
}

function makeWSB(template, memory) {
  var script = makeSetupScript(template);
  var b64 = btoa(unescape(encodeURIComponent(script)));
  var decodeLine = 'powershell -Command "[System.IO.File]::WriteAllBytes(\'C:\\\\setup.cmd\', [Convert]::FromBase64String(\'' + b64 + '\'))"';

  return [
    '<Configuration>',
    '  <MemoryInMB>' + (memory || 4096) + '</MemoryInMB>',
    '  <vGPU>Enable</vGPU>',
    '  <Networking>Enable</Networking>',
    '  <LogonCommand>',
    '    <Command>cmd /c ' + decodeLine + ' ^&amp; C:\\setup.cmd</Command>',
    '  </LogonCommand>',
    '</Configuration>',
  ].join('\r\n');
}

function downloadWSB(template, memory) {
  var xml = makeWSB(template, memory || 4096);
  var blob = new Blob([xml], { type: 'application/xml' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'instantvm-' + template + '.wsb';
  a.click();
  URL.revokeObjectURL(url);
}
