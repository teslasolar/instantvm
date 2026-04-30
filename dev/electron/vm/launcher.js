// launcher.js — launch + monitor Windows Sandbox process
const { exec } = require('child_process');
const fs = require('fs');

const SANDBOX_EXE = 'C:\\Windows\\System32\\WindowsSandbox.exe';
let sandboxProc = null;

function isAvailable() {
  return fs.existsSync(SANDBOX_EXE);
}

function launch(wsbPath, onExit) {
  if (!isAvailable()) return { ok: false, error: 'Windows Sandbox not installed' };
  if (!fs.existsSync(wsbPath)) return { ok: false, error: 'WSB file not found: ' + wsbPath };

  sandboxProc = exec(`start "" "${wsbPath}"`, (err) => {
    sandboxProc = null;
    onExit?.(err ? 1 : 0);
  });

  return { ok: true, wsb: wsbPath, pid: sandboxProc.pid };
}

function kill() {
  if (!sandboxProc) return false;
  exec('taskkill /F /IM WindowsSandbox.exe', () => {});
  exec('taskkill /F /IM WindowsSandboxClient.exe', () => {});
  sandboxProc = null;
  return true;
}

function status() {
  return { running: sandboxProc !== null, available: isAvailable() };
}

module.exports = { isAvailable, launch, kill, status };
