import { DealDataService, DealEventMap, PlaceBidData } from '@app/deal-data';
import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EVENT_SERVICE } from './engine.type';

@Injectable()
export class EngineService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly dealDataService: DealDataService,
    @Inject(EVENT_SERVICE) private readonly client: ClientProxy
  ) {}

  onModuleInit() {
    return this.client.connect();
  }

  onModuleDestroy() {
    return this.client.close();
  }

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
