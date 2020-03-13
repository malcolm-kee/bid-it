/* eslint-disable @typescript-eslint/no-var-requires */
const fetch = require('node-fetch');
const { v4: uuid } = require('uuid');
const WebSocket = require('ws');

const port = process.env.PORT || 3000;
const restBaseUrl = `http://localhost:${port}`;
const wsBaseUrl = `ws://localhost:8080`;
const INCREMENTS = [100, 300, 500];
const TASK_DELAYS = [500, 800, 1000];
const TOTAL_BIDS = 20;

function getActiveDeals() {
  return fetch(`${restBaseUrl}/deal`).then(res => res.json());
}

function placeBid(data) {
  const formData = Object.assign(
    {},
    {
      dealerId: uuid(),
    },
    data
  );

  return fetch(`${restBaseUrl}/deal`, {
    method: 'PUT',
    body: JSON.stringify(formData),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(res => res.json());
}

const getRandomItem = array => array[Math.floor(Math.random() * array.length)];
const wait = delayInMs =>
  new Promise(fulfill => setTimeout(fulfill, delayInMs));

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

async function placeRandomBid(deal) {
  let currentPrice = deal.currentBid
    ? deal.currentBid.currentPrice
    : deal.startingPrice;

  const cleanupWs = await listenSocket(deal._id, newPrice => {
    currentPrice = newPrice;
  });

  const delays = [];
  for (let index = 0; index < TOTAL_BIDS; index++) {
    delays.push(getRandomItem(TASK_DELAYS));
  }

  try {
    for (const delay of delays) {
      await wait(delay);
      currentPrice = currentPrice + getRandomItem(INCREMENTS);

      await placeBid({
        dealId: deal._id,
        price: currentPrice,
      });
    }

    cleanupWs();
  } catch (err) {
    console.error(err);
  }
}

async function getRandomDeal() {
  try {
    const activeDeals = await getActiveDeals();

    return getRandomItem(activeDeals);
  } catch (err) {
    console.error(err);
  }
}

async function main() {
  const deal = await getRandomDeal();

  await placeRandomBid(deal);
}

main();
