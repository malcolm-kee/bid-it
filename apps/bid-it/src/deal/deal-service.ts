import { DealDataService } from '@app/deal-data';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Interval } from '@nestjs/schedule';
import { BID_QUEUE } from './deal.type';

@Injectable()
export class DealService {
  constructor(
    private readonly dealService: DealDataService,
    @Inject(BID_QUEUE) private readonly client: ClientProxy
  ) {}

  @Interval(1000)
  async closeDealAndAnnounce() {
    const deals = await this.dealService.getPendingClosedDeals();

    for (const deal of deals) {
      await this.dealService.closeDeal(deal.id);
      this.client.emit('bid_closed', deal.toJSON());
      Logger.log(`closed deal`);
      Logger.log(deal);
    }
  }
}
