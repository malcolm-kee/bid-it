import type { PlaceBidData } from '@app/deal-data';
import { config } from 'dotenv';
import redis from 'redis';
import url from 'url';
import WebSocket from 'ws';

type WebSocketWithHeartBeat = WebSocket & {
  isAlive: boolean
}

config();

const bidClients = new Map<string, WebSocketWithHeartBeat[]>();
const redisClient = redis.createClient(process.env.REDIS_URL as string);

redisClient
  .on('connect', () => console.log('redis client connected'))
  .on('error', err => {
    console.error('error on redis client');
    console.error(err);
  });

redisClient.on('message', (channel, message) => {
  const data: PlaceBidData | null = message && JSON.parse(message);

  if (data) {
    const clients = bidClients.get(data.dealId);
    if (clients) {
      const dataToClient = JSON.stringify({
        type: channel,
        payload: data,
      });
      clients.forEach(client => {
        client.send(dataToClient);
      });
    }
  }
});

redisClient.subscribe(['bid_accepted', 'bid_rejected', 'bid_closed'], err => {
  if (err) {
    console.error(err);
  }
});

const wss = new WebSocket.Server({
  port: 8080,
});

function keepAlive() {
  this.isAlive = true;
}
function registerClient(dealId: string, client: WebSocketWithHeartBeat) {
  const currentClients = bidClients.get(dealId);

  client.isAlive = true;
  client.on('pong', keepAlive);

  if (currentClients) {
    currentClients.push(client);
  } else {
    bidClients.set(dealId, [client]);
  }
}

wss.on('connection', (ws: WebSocketWithHeartBeat, req) => {
  if (req.url) {
    const { query } = url.parse(req.url, true);

    if (query && query.dealId) {
      registerClient(query.dealId as string, ws);
    }

    ws.on('message', message => {
      console.log(`Received: ${message}`);
    });
  }
});

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() { }
const intervalId = setInterval(() => {
  bidClients.forEach((clients, key) => {
    clients.forEach(client => {
      if (!client.isAlive) {
        if (clients.length === 1) {
          bidClients.delete(key);
        } else {
          clients.splice(clients.indexOf(client), 1);
        }
        client.terminate();
      } else {
        client.isAlive = false;
        client.ping(noop);
      }
    });
  });
}, 1000);

wss.on('close', () => {
  clearInterval(intervalId);
});

function gracefulShutdown() {
  console.log(`Process ${process.pid} is shutting down...`);

  Promise.all([
    new Promise(fulfill => {
      redisClient.quit(() => {
        fulfill();
      });
    }),
    new Promise(fulfill => {
      wss.close(() => fulfill());
    }),
  ]).finally(() => process.exit(0));
}

process.on('SIGTERM', gracefulShutdown);

process.on('SIGINT', gracefulShutdown);
