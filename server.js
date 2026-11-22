// Lemonade Kingdom: Zombie Nights — game + multiplayer matchmaking server
// Serves index.html and pairs 1 attacker with 1 defender over WebSockets.
const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');
const PORT = process.env.PORT || 3000, ROOT = __dirname;
const TYPES = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json', '.js': 'text/javascript', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]); if (p === '/' || p === '') p = '/index.html';
  if (p === '/health') { res.writeHead(200); return res.end('ok'); }
  const f = path.join(ROOT, path.normalize(p).replace(/^(\.\.[\/\\])+/, ''));
  if (!f.startsWith(ROOT) || !['index.html', 'favicon.svg', 'manifest.webmanifest', 'sw.js', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'].includes(path.basename(f))) { res.writeHead(404); return res.end('Not found'); }
  fs.readFile(f, (err, data) => { if (err) { res.writeHead(404); return res.end('Not found'); } res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache', ...(path.basename(f) === 'sw.js' ? { 'Service-Worker-Allowed': '/' } : {}) }); res.end(data); });
});
const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 512 * 1024 });
const queue = { attack: [], defend: [] }; let nextId = 1;
const send = (ws, o) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); };
const counts = () => ({ t: 'counts', a: queue.attack.length, d: queue.defend.length, online: wss.clients.size });
const broadcastCounts = () => { const c = counts(); wss.clients.forEach(ws => send(ws, c)); };
const unqueue = ws => { for (const r of ['attack', 'defend']) { const i = queue[r].indexOf(ws); if (i >= 0) queue[r].splice(i, 1); } };
const leaveRoom = (ws, notify) => { const o = ws.partner; ws.partner = null; if (o && o.partner === ws) { o.partner = null; if (notify) send(o, { t: 'oppleft' }); } };
function tryMatch() {
  while (queue.attack.length && queue.defend.length) {
    const a = queue.attack.shift(), d = queue.defend.shift();
    if (a.readyState !== 1) { queue.defend.unshift(d); continue; } if (d.readyState !== 1) { queue.attack.unshift(a); continue; }
    a.partner = d; d.partner = a;
    send(a, { t: 'match', role: 'attack', opp: d.name }); send(d, { t: 'match', role: 'defend', opp: a.name });
    console.log(`match: ${a.name} (attack) vs ${d.name} (defend)`);
  }
  broadcastCounts();
}
wss.on('connection', ws => {
  ws.id = nextId++; ws.name = 'Player'; ws.alive = true; ws.partner = null;
  ws.on('pong', () => ws.alive = true);
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch (e) { return; } ws.alive = true;
    if (m.t === 'hello') { ws.name = String(m.name || 'Player').slice(0, 16); send(ws, counts()); }
    else if (m.t === 'queue') { if (m.name) ws.name = String(m.name).slice(0, 16); leaveRoom(ws, true); unqueue(ws); const r = m.role === 'defend' ? 'defend' : 'attack'; queue[r].push(ws); send(ws, { t: 'queued', role: r }); tryMatch(); }
    else if (m.t === 'leave') { unqueue(ws); leaveRoom(ws, true); broadcastCounts(); }
    else if (m.t === 'done') { leaveRoom(ws, false); }
    else if (m.t === 'm') { if (ws.partner) send(ws.partner, { t: 'm', m: m.m }); }
  });
  ws.on('close', () => { unqueue(ws); leaveRoom(ws, true); broadcastCounts(); });
  broadcastCounts();
});
setInterval(() => wss.clients.forEach(ws => { if (!ws.alive) return ws.terminate(); ws.alive = false; try { ws.ping(); } catch (e) { } }), 30000);
server.listen(PORT, () => console.log('Lemonade Kingdom server on port ' + PORT));
