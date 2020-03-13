/* eslint-disable @typescript-eslint/no-var-requires */
const fetch = require('node-fetch');
const WebSocket = require('ws');
const { v4 } = require('uuid');

const port = process.env.PORT || 3000;
const restBaseUrl = `http://localhost:${port}`;
const wsBaseUrl = `ws://localhost:8080`;

const INCREMENTS = [100, 300, 500];
const TOTAL_BIDS = 20;

function getActiveDeals() {
  return fetch(`${restBaseUrl}/deal`).then(res => res.json());
}

function fetchJson(url, options) {
  return fetch(`${restBaseUrl}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  }).then(res => {
    if (res.ok) {
      return res.json();
    }
    throw new Error('Fetch fail');
  });
}

function getFakeUser() {
  const pid = process.pid;
  const loginDetails = {
    name: `Malcolm ${pid}`,
    email: `m.${v4()}@gmail.com`,
  };

  return fetchJson('/register', {
    method: 'POST',
    body: JSON.stringify(loginDetails),
  });
}

function placeBid(data) {
  return fetchJson('/deal', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

const getRandomItem = array => array[Math.floor(Math.random() * array.length)];

function listenSocket(dealId, onNewPrice) {
  return new Promise((fulfill, reject) => {
    const ws = new WebSocket(`${wsBaseUrl}?dealId=${dealId}`);
    ws.on('open', () => {
      fulfill(function cleanup() {
        ws.close();
      });
    });
    ws.on('message', msgData => {
      const data = JSON.parse(msgData);
      if (data.type === 'bid_accepted') {
        onNewPrice(data.payload.price);
      }
    });
    ws.on('error', reject);
  });
}

async function placeRandomBid(user, deal) {
  let currentPrice = deal.currentBid
    ? deal.currentBid.currentPrice
    : deal.startingPrice;

  const cleanupWs = await listenSocket(deal._id, newPrice => {
    currentPrice = newPrice;
  });

  for (let i = 0; i < TOTAL_BIDS; i++) {
    currentPrice = currentPrice + getRandomItem(INCREMENTS);
    try {
      await placeBid({
        dealId: deal._id,
        dealerId: user._id,
        price: currentPrice,
      });
    } catch (err) {
      console.error(err);
    }
  }

  cleanupWs();
}

(async function main() {
  try {
    const [user, activeDeals] = await Promise.all([
      getFakeUser(),
      getActiveDeals(),
    ]);

    await placeRandomBid(user, getRandomItem(activeDeals));
  } catch (mainError) {
    console.error(mainError);
  }
})();
