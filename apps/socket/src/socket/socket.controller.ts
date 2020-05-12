import { DealEventMap, DealEvents } from '@app/deal-data';
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { SocketGateway } from './socket.gateway';

@Controller()
export class SocketController {
  constructor(private readonly socketGateway: SocketGateway) {}

  @EventPattern(DealEvents.bidAccepted)
  notifyBidAccepted(data: DealEventMap['bid_accepted']) {
    this.socketGateway.notifyEvent('bid_accepted', data);
  }

  @EventPattern(DealEvents.bidRejected)
  notifyBidRejected(data: DealEventMap['bid_rejected']) {
    this.socketGateway.notifyEvent('bid_rejected', data);
  }

  @EventPattern(DealEvents.bidClose)
  notifyBidClosed(data: DealEventMap['bid_close']) {
    this.socketGateway.notifyEvent('bid_close', data);
  }
}
