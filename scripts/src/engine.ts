import type { DealDocument, PlaceBidData } from '@app/deal-data';
import Queue from 'bull';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import redis from 'redis';

config();

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

const DealData = mongoose.model<DealDocument>('deal', DealDataSchema, 'deals');
const bidQueue = new Queue<PlaceBidData>('BID_QUEUE', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});
const redisClient = redis.createClient(process.env.REDIS_URL as string);

redisClient
  .on('connect', () => {
    console.log('redis client connected');
  })
  .on('error', err => {
    console.error('error on redis');
    console.error(err);
  });

function publishEvent(key: string, value) {
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

  Promise.all([
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

function startup() {
  mongoose
    .connect(process.env.DEALS_DB_URL as string)
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
