import { DealEventMap, DealEvents } from '@app/deal-data';
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { SocketGateway } from './socket.gateway';

@Controller()
export class SocketController {
  constructor(private readonly socketGateway: SocketGateway) {}

  @EventPattern(DealEvents.bid_accepted)
  notifyBidAccepted(data: DealEventMap['bid_accepted']) {
    this.socketGateway.notifyEvent('bid_accepted', data);
  }

  @EventPattern(DealEvents.bid_rejected)
  notifyBidRejected(data: DealEventMap['bid_rejected']) {
    this.socketGateway.notifyEvent('bid_rejected', data);
  }

  @EventPattern(DealEvents.bid_close)
  notifyBidClosed(data: DealEventMap['bid_close']) {
    this.socketGateway.notifyEvent('bid_close', data);
  }
}
