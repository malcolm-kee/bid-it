import { PlaceBidData } from '@app/deal-data';
import { Document } from 'mongoose';

export type BidResult = 'bid_accepted' | 'bid_rejected';

export type AcceptedBid = {
  type: BidResult;
  data: PlaceBidData;
};

export type AcceptedBidDocument = AcceptedBid & Document;
