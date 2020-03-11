/* eslint-disable @typescript-eslint/no-var-requires */
const Queue = require('bull');
const mongoose = require('mongoose');
const redis = require('redis');

const DealDataSchema = new mongoose.Schema(
  {
    name: String,
    startingPrice: Number,
    startedAt: Date,
    closedAt: Date,
    closed: {
      type: Boolean,
      default: false,
    },
    currentBid: {
      currentPrice: {
        type: Number,
      },
      currentDealerId: String,
    },
  },
  { timestamps: true }
);

const DealData = mongoose.model('deal', DealDataSchema, 'deals');
const bidQueue = new Queue('BID_QUEUE');
const redisClient = redis.createClient();

redisClient
  .on('connect', () => {
    console.log('redis client connected');
  })
  .on('error', err => {
    console.error('error on redis');
    console.error(err);
  });

function publishEvent(key, value) {
  return new Promise((fulfill, reject) => {
    redisClient.publish(key, JSON.stringify(value), err => {
      if (err) {
        return reject(err);
      } else {
        fulfill();
      }
    });
  });
}

function listenForBid() {
  bidQueue.process(async ({ data }) => {
    const deal = await DealData.findById(data.dealId).exec();
    const now = new Date();

    if (
      deal &&
      deal.startedAt < now &&
      deal.closedAt > now &&
      data.price >
        ((deal.currentBid && deal.currentBid.currentPrice) ||
          deal.startingPrice)
    ) {
      await publishEvent('bid_accepted', data);
    } else {
      if (!deal) {
        console.log(`Invalid bid: ${JSON.stringify(data)}`);
      }
      await publishEvent('bid_rejected', data);
    }
  });
}

function gracefulShutdown() {
  console.log(`Process ${process.pid} is shutting down...`);
  mongoose.disconnect().then(() => {
    redisClient.quit(() => {
      process.exit(0);
    });
  });
}

function startup() {
  mongoose
    .connect('mongodb://localhost:27017/deal')
    .then(() => {
      console.log('Connected to DB');
      listenForBid();
    })
    .catch(err => {
      console.error('Error connecting to DB');
      console.log(err);
      gracefulShutdown();
    });
}

process.on('SIGTERM', gracefulShutdown);

process.on('SIGINT', gracefulShutdown);

startup();
