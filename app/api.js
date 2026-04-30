// api.js — local HTTP API so the Pages frontend can control the Electron backend
const http = require('http');
const vm = require('./vm');

const PORT = 8430;
let server = null;

function start() {
  server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Content-Type', 'application/json');
    if (req.method === 'OPTIONS') { res.end(); return; }

    const url = req.url.split('?')[0];

    if (url === '/status') {
      return json(res, vm.status());
    }
    if (url === '/templates') {
      return json(res, vm.list());
    }
    if (url.startsWith('/launch/')) {
      const tpl = url.replace('/launch/', '');
      return json(res, vm.launchTemplate(tpl));
    }
    if (url === '/kill') {
      return json(res, { ok: vm.kill() });
    }
    json(res, { error: 'not found', endpoints: ['/status', '/templates', '/launch/:id', '/kill'] }, 404);
  });

  server.listen(PORT, '127.0.0.1', () => {});
  return PORT;
}

function stop() { if (server) server.close(); }

function json(res, data, code) {
  res.statusCode = code || 200;
  res.end(JSON.stringify(data));
}

module.exports = { start, stop, PORT };
