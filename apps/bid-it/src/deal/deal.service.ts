import { DealDataService, PlaceBidData } from '@app/deal-data';
import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Interval } from '@nestjs/schedule';
import { Queue } from 'bull';
import { BID_QUEUE, EVENT_SERVICE } from './deal.type';

@Injectable()
export class DealService {
  constructor(
    private readonly dealService: DealDataService,
    @Inject(EVENT_SERVICE) private readonly client: ClientProxy,
    @InjectQueue(BID_QUEUE) private readonly bidQueue: Queue
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

  placeBid(placeBidData: PlaceBidData) {
    return this.bidQueue.add(placeBidData);
  }
}
