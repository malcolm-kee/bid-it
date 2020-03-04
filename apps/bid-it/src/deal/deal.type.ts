import { Document } from 'mongoose';

export type DealData = {
  name: string;
  startingPrice: number;
  startedAt: Date;
  closedAt: Date;
  currentBid?: {
    currentPrice: number;
    currentDealerId: string;
  };
};

export interface Deal extends Document, DealData {}

export const DEAL_SCHEMA_NAME = 'Order';
