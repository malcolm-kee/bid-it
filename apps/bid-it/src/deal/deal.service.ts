import { BID_QUEUE } from '@app/const';
import { DealDataService, DealEvents, PlaceBidData } from '@app/deal-data';
import { InjectQueue } from '@nestjs/bull';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Interval } from '@nestjs/schedule';
import { Queue } from 'bull';
import { EVENT_SERVICE } from './deal.type';

@Injectable()
export class DealService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly dealDataService: DealDataService,
    @Inject(EVENT_SERVICE) private readonly client: ClientProxy,
    @InjectQueue(BID_QUEUE) private readonly bidQueue: Queue
  ) {}

  onModuleInit() {
    return this.client.connect();
  }

  onModuleDestroy() {
    return this.client.close();
  }

  @Interval(1000)
  async closeDealAndAnnounce() {
    const deals = await this.dealDataService.getPendingClosedDeals();

    for (const deal of deals) {
      await this.dealDataService.closeDeal(deal.id);
      await this.client
        .emit(DealEvents.bidClose, {
          dealId: deal.id,
          details: deal.toJSON(),
        })
        .toPromise();
      Logger.log(`closed deal`);
      Logger.log(deal);
    }
  }

  placeBid(placeBidData: PlaceBidData) {
    return this.bidQueue.add(placeBidData);
  }
}
