import { DealEventMap } from '@app/deal-data';
import { Injectable, Inject } from '@nestjs/common';
import { DealDataService, PlaceBidData } from '@app/deal-data';
import { EVENT_SERVICE } from './engine.type';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class EngineService {
  constructor(
    private readonly dealDataService: DealDataService,
    @Inject(EVENT_SERVICE) private readonly client: ClientProxy
  ) {}

  async checkIfBidSuccess(bid: PlaceBidData) {
    const deal = await this.dealDataService.getOne(bid.dealId);

    const now = new Date();

    if (
      deal &&
      deal.startedAt < now &&
      deal.closedAt > now &&
      bid.price >
        ((deal.currentBid && deal.currentBid.currentPrice) ||
          deal.startingPrice)
    ) {
      return true;
    }
    return false;
  }

  announceBidResult<Type extends keyof DealEventMap>(
    type: Type,
    data: DealEventMap[Type]
  ) {
    return this.client.emit(type, data).toPromise();
  }
}
