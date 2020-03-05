import * as mongoose from 'mongoose';
import { Deal } from './deal.type';

export const DealSchema = new mongoose.Schema<Deal>(
  {
    name: String,
    startingPrice: Number,
    startedAt: Date,
    closedAt: Date,
    currentBid: {
      currentPrice: {
        type: Number,
      },
      currentDealerId: String,
    },
  },
  { timestamps: true }
);
