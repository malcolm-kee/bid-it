import * as mongoose from 'mongoose';
import { DealDocument } from './deal-data.type';

export const DealDataSchema = new mongoose.Schema<DealDocument>(
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
