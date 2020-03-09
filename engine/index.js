/* eslint-disable @typescript-eslint/no-var-requires */
const Queue = require('bull');
const mongoose = require('mongoose');

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
const BidQueue = new Queue('BID_QUEUE');

function listenForBid() {
  BidQueue.process(async job => {
    console.log(`processing new job...`);
    const { bidId, dealId, dealerId, price } = job.data;
    const deal = await DealData.findById(dealId).exec();
    console.log({ deal, data: job.data, time: new Date() });

    await new Promise(fulfill => setTimeout(fulfill, 2000));
  });
}

function startup() {
  mongoose.connect('mongodb://localhost:27017/deal').then(() => {
    console.log('Connected to DB');
    listenForBid();
  });
}

process.on('SIGTERM', () => {
  console.log(`Process ${process.pid} received a SIGTERM signal`);
  mongoose.disconnect().then(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log(`Process ${process.pid} has been interrupted`);
  mongoose.disconnect().then(() => {
    process.exit(0);
  });
});

startup();
