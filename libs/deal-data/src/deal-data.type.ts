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

export interface DealDocument extends Document, DealData {}

export const DEAL_SCHEMA_NAME = 'Deal';

export const dealConnectionName = 'deals';

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

export interface PlaceBidData {
  readonly bidId: string;
  readonly dealId: string;
  readonly dealerId: string;
  readonly price: number;
}

export const DealEvents = {
  bidClose: 'bid_close',
  bidAccepted: 'bid_accepted',
  bidRejected: 'bid_rejected',
};

export type DealEventMap = {
  bid_close: {
    dealId: string;
    details: DealData;
  };
  bid_accepted: PlaceBidData;
  bid_rejected: PlaceBidData;
};
