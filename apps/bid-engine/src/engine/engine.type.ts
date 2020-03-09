export const BID_QUEUE = 'BID_QUEUE';

export interface PlaceBidData {
  readonly bidId: string;
  readonly dealId: string;
  readonly dealerId: string;
  readonly price: number;
}
