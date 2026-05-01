// sandbox-bridge.js — read/write between running Windows Sandbox and GitHub Issues
var BRIDGE = {
  repo: 'teslasolar/instantvm',
  label: 'sandbox-state',
  pollMs: 10000,
  timer: null,
  states: {},
};

async function bridgeRead() {
  try {
    var url = 'https://api.github.com/repos/' + BRIDGE.repo + '/issues?labels=' + BRIDGE.label + '&per_page=20&state=open';
    var r = await fetch(url);
    var issues = await r.json();
    if (!Array.isArray(issues)) return {};
    BRIDGE.states = {};
    issues.forEach(function(iss) {
      var m = iss.body && iss.body.match(/```json\s*([\s\S]*?)```/);
      if (m) { try { BRIDGE.states[iss.title] = JSON.parse(m[1]); } catch {} }
    });
    return BRIDGE.states;
  } catch { return {}; }
}

async function bridgeWrite(key, data, token) {
  if (!token) return { ok:false, error:'no token' };
  var body = '```json\n' + JSON.stringify(data, null, 2) + '\n```';
  var existing = Object.entries(BRIDGE.states).find(function(e) { return e[0] === key; });
  try {
    if (existing && existing[1]._issue) {
      await fetch('https://api.github.com/repos/' + BRIDGE.repo + '/issues/' + existing[1]._issue, {
        method: 'PATCH',
        headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body })
      });
    } else {
      await fetch('https://api.github.com/repos/' + BRIDGE.repo + '/issues', {
        method: 'POST',
        headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: key, body: body, labels: [BRIDGE.label] })
      });
    }
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
}

function bridgeStartPoll(onUpdate) {
  BRIDGE.timer = setInterval(async function() {
    await bridgeRead();
    if (onUpdate) onUpdate(BRIDGE.states);
  }, BRIDGE.pollMs);
}

function bridgeStopPoll() {
  if (BRIDGE.timer) { clearInterval(BRIDGE.timer); BRIDGE.timer = null; }
}
