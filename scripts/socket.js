const url = require('url');
const WebSocket = require('ws');

const wss = new WebSocket.Server({
  port: 8080,
});

const bidClients = new Map();

function keepAlive() {
  this.isAlive = true;
}
function registerClient(bidId, client) {
  const currentClients = bidClients.get(bidId);

  client.isAlive = true;
  client.on('pong', keepAlive);

  if (currentClients) {
    currentClients.push(client);
  } else {
    bidClients.set(bidId, [client]);
  }
}

wss.on('connection', (ws, req) => {
  const { query } = url.parse(req.url, true);

  if (query && query.bidId) {
    registerClient(query.bidId, ws);
  }

  ws.on('message', message => {
    console.log(`Received: ${message}`);
  });
});

function noop() {}
const intervalId = setInterval(() => {
  bidClients.forEach((clients, key) => {
    clients.forEach(client => {
      if (!client.isAlive) {
        clients.splice(clients.indexOf(client), 1);
        client.terminate();
      } else {
        client.isAlive = false;
        client.ping(noop);

        client.send(`Now is ${new Date().toLocaleString()} for [${key}]`);
      }
    });
  });
}, 1000);

wss.on('close', () => {
  clearInterval(intervalId);
});
