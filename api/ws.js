export const config = {
  runtime: 'edge',
};

// In-memory channel map (per edge instance, ephemeral)
const channels = new Map(); // channel => Set<WebSocket>

function subscribe(channel, ws) {
  if (!channels.has(channel)) channels.set(channel, new Set());
  channels.get(channel).add(ws);
}

function unsubscribeAll(ws) {
  for (const subs of channels.values()) subs.delete(ws);
}

function broadcast(channel, data) {
  const subs = channels.get(channel);
  if (!subs) return;
  for (const client of subs) {
    try { client.send(JSON.stringify(data)); } catch {}
  }
}

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const { searchParams } = new URL(req.url);
  const channel = searchParams.get('channel') || 'default';

  const { 0: client, 1: server } = new WebSocketPair();

  server.accept();
  subscribe(channel, server);

  // Send welcome
  try {
    server.send(JSON.stringify({ type: 'welcome', channel, ts: Date.now() }));
  } catch {}

  server.addEventListener('message', (event) => {
    try {
      const msg = typeof event.data === 'string' ? JSON.parse(event.data) : {};
      if (msg.type === 'broadcast' && msg.payload) {
        broadcast(channel, { type: 'message', channel, payload: msg.payload, ts: Date.now() });
      } else if (msg.type === 'ping') {
        server.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
      }
    } catch (e) {
      try { server.send(JSON.stringify({ type: 'error', error: e.message })); } catch {}
    }
  });

  server.addEventListener('close', () => {
    unsubscribeAll(server);
  });

  // Keep alive pings from server side (optional)
  const interval = setInterval(() => {
    try { server.send(JSON.stringify({ type: 'heartbeat', ts: Date.now() })); } catch {}
  }, 30000);

  server.addEventListener('close', () => clearInterval(interval));

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}
