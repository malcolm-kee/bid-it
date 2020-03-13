/* eslint-disable @typescript-eslint/no-var-requires */
const mongodb = require('mongodb');

const dbHost = process.env.DB_HOST || 'localhost';

mongodb.MongoClient.connect(`mongodb://${dbHost}:27017`).then(client => {
  const bidsCollection = client.db('report').collection('bids');
  const dealCollection = client.db('deal').collection('deals');

  bidsCollection
    .find({ type: 'bid_accepted' })
    .toArray()
    .then(successfulBids => {
      const dealerSet = new Set();
      successfulBids.forEach(bid => {
        dealerSet.add(bid.data.dealerId);
      });
      console.group(`===Dealers place at least one bid===`);
      console.log(`Total Count: ${dealerSet.size}`);
      console.groupEnd();
    })
    .then(() =>
      bidsCollection
        .aggregate([
          { $match: {} },
          {
            $group: {
              _id: {
                $dateToString: { format: '%H:%M:%S', date: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray()
    )
    .then(result => {
      console.group(`===Performance===`);
      console.table(
        result.map(record => ({
          time: record._id,
          count: record.count,
        }))
      );
      console.groupEnd();
    })
    .then(() => dealCollection.find({}).toArray())
    .then(deals => {
      console.group(`===Deals===`);
      console.table(
        deals.map(deal => ({
          id: deal._id,
          name: deal.name,
          finalPrice: deal.currentBid ? deal.currentBid.currentPrice : null,
        }))
      );
      console.groupEnd();
    })
    .then(() => client.close());
});
