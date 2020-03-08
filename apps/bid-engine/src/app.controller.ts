import { DealDataService } from '@app/deal-data';
import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { BID_QUEUE, PlaceBidData } from './app.type';

@Controller()
export class AppController {
  constructor(
    private readonly dealService: DealDataService,
    @Inject(BID_QUEUE) private readonly client: ClientProxy
  ) {}

  @EventPattern('place_bid')
  async processPlacedBid(data: PlaceBidData) {
    const now = new Date();
    const deal = await this.dealService.getOne(data.dealId);

    if (
      deal &&
      deal.startedAt < now &&
      deal.closedAt > now &&
      (!deal.currentBid || deal.currentBid.currentPrice < data.price)
    ) {
      this.client.emit('bid_accepted', data);
    } else {
      if (!deal) {
        Logger.log(`Invalid bid: ${JSON.stringify(data)}`);
      }
      this.client.emit('bid_rejected', data);
    }
  }
}
