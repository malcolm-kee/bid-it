/* eslint-disable @typescript-eslint/no-var-requires */
const { format, sub, add } = require('date-fns');
const fetch = require('node-fetch');

const port = process.env.PORT || 3000;
const restBaseUrl = `http://localhost:${port}`;
const now = new Date();
const dateFormat = "yyyy-MM-dd'T'HH:mm:ss";
const yesterday = format(
  sub(now, {
    days: 1,
  }),
  dateFormat
);
const twoHoursLater = format(
  add(now, {
    hours: 2,
  }),
  dateFormat
);

const deals = [
  {
    name: 'Toyota Suzuki 2000',
    startingPrice: 1000,
    startedAt: yesterday,
    endedAt: twoHoursLater,
  },
  {
    name: 'Mercedes Benz 2010',
    startingPrice: 10000,
    startedAt: yesterday,
    endedAt: twoHoursLater,
  },
];

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
    res.text().then(console.error);

    throw new Error('Fetch fail');
  });
}

(async function setup() {
  for (const deal of deals) {
    try {
      await fetchJson('/deal', {
        method: 'POST',
        body: JSON.stringify(deal),
      });
    } catch (err) {
      console.error(err);
    }
  }
})();
