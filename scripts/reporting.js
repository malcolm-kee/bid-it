/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
const mongoose = require('mongoose');
const redis = require('redis');

const reportingDbUrl = process.env.REPORTING_DB_URL;

const AcceptedBidSchema = new mongoose.Schema(
  {
    type: String,
    data: {
      bidId: String,
      dealId: String,
      dealerId: String,
      price: Number,
    },
  },
  { timestamps: true }
);

const AcceptedBidData = mongoose.model('bid', AcceptedBidSchema, 'bids');
const redisClient = redis.createClient(process.env.REDIS_URL);

redisClient
  .on('connect', () => console.log('redis client connected'))
  .on('error', err => {
    console.error('error on redis client');
    console.error(err);
  });

redisClient.on('message', (channel, message) => {
  const data = JSON.parse(message);

  if (data) {
    AcceptedBidData.create({ type: channel, data });
  }
});

redisClient.subscribe(['bid_accepted', 'bid_rejected'], err => {
  if (err) {
    console.error(err);
  }
});

function gracefulShutdown() {
  console.log(`Process ${process.pid} is shutting down...`);

  Promise.allSettled([
    new Promise(fulfill => {
      redisClient.quit(() => {
        fulfill();
      });
    }),
    new Promise(fulfill => {
      mongoose.disconnect(() => fulfill());
    }),
  ]).finally(() => process.exit(0));
}

process.on('SIGTERM', gracefulShutdown);

process.on('SIGINT', gracefulShutdown);

(function startup() {
  mongoose
    .connect(reportingDbUrl)
    .then(() => {
      console.log(`Reporting service connected to DB`);
    })
    .catch(err => {
      console.error(`Error connecting to reporting DB`);
      console.log(err);
      gracefulShutdown();
    });
})();

/**
// MongoDB Aggregate Report
use report

 db.bids.aggregate(
     [
         { $match: {} },
         { $group: { _id: { $dateToString: { format: "%H:%M:%S", date: "$createdAt" } }, count: { $sum: 1 } } },
         { $sort: { _id: 1 } }
     ]
 )
 */
