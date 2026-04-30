// backend.js — connect to local Electron backend API
var BACKEND = 'http://127.0.0.1:8430';
var backendOnline = false;

async function checkBackend() {
  try {
    var r = await fetch(BACKEND + '/status', { signal: AbortSignal.timeout(2000) });
    var data = await r.json();
    backendOnline = true;
    return data;
  } catch {
    backendOnline = false;
    return null;
  }
}

async function backendLaunch(templateId) {
  try {
    var r = await fetch(BACKEND + '/launch/' + templateId);
    return await r.json();
  } catch(e) { return { ok: false, error: e.message }; }
}

async function backendKill() {
  try {
    var r = await fetch(BACKEND + '/kill');
    return await r.json();
  } catch(e) { return { ok: false, error: e.message }; }
}

async function backendTemplates() {
  try {
    var r = await fetch(BACKEND + '/templates');
    return await r.json();
  } catch { return []; }
}
