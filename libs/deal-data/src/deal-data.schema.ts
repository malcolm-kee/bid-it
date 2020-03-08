import * as mongoose from 'mongoose';
import { Deal } from './deal-data.type';

export const DealDataSchema = new mongoose.Schema<Deal>(
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
