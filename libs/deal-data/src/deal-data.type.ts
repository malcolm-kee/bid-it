import { Document } from 'mongoose';

export type DealData = {
  name: string;
  startingPrice: number;
  startedAt: Date;
  closedAt: Date;
  closed: boolean;
  currentBid?: {
    currentPrice: number;
    currentDealerId: string;
  };
};

export interface Deal extends Document, DealData {}

export const DEAL_SCHEMA_NAME = 'Deal';

export interface CreateDealData {
  readonly name: string;
  readonly startingPrice: number;
  readonly startedAt: string;
  readonly endedAt: string;
}

export interface AcceptBidData {
  readonly bidId: string;
  readonly dealId: string;
  readonly dealerId: string;
  readonly price: number;
}
