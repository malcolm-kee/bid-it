import { DealDataService } from '@app/deal-data';
import { Controller, Inject, Logger } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { BID_QUEUE, PlaceBidData } from './engine.type';

@Controller()
export class EngineController {
  constructor(
    private readonly dealService: DealDataService,
    @Inject(BID_QUEUE) private readonly client: ClientProxy
  ) {}

  async processBid(data: PlaceBidData) {
    const now = new Date();
    const deal = await this.dealService.getOne(data.dealId);

    console.log({ data });

    Logger.log(`Detected new bid is placed`);

    // TODO: Not working. Is it because we can't use a queue to publish too when we're the consumer?
    // Apparently it's not so based on RabbitMQ docs

    try {
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
    } catch (e) {
      console.error(e);
    }
  }

  @MessagePattern('place_bid')
  consumeBid(@Payload() data: PlaceBidData, @Ctx() context: RmqContext) {
    this.processBid(data);

    const channel = context.getChannelRef();
    const message = context.getMesssage();

    channel.ack(message);
  }
}
