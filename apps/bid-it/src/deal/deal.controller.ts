import { DealDataService } from '@app/deal-data';
import {
  Body,
  Controller,
  Get,
  // Inject,
  Logger,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import {
  // ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import { AcceptBidDto, CreateDealDto, PostBidDto } from './deal.dto';
// import { BID_QUEUE } from './deal.type';
import { DealService } from './deal.service';

@Controller('deal')
export class DealController {
  constructor(
    private readonly dealService: DealDataService,
    private readonly helperService: DealService // @Inject(BID_QUEUE) private readonly client: ClientProxy
  ) {}

  @Get()
  getActiveDeals() {
    return this.dealService.getActiveDeals();
  }

  @Get(':id')
  async getDeal(@Param('id') id: string, @Res() response: Response) {
    const deal = await this.dealService.getOne(id);
    if (!deal) {
      return response.status(404).json({
        message: 'Not Found',
      });
    }
    return response.status(200).json(deal);
  }

  @Post()
  createDeal(@Body() createDealDto: CreateDealDto) {
    return this.dealService.create(createDealDto);
  }

  @Put()
  async postBid(@Body() assignDealBidDto: PostBidDto) {
    const bidId = uuid();

    await this.helperService.placeBid({
      bidId,
      dealId: assignDealBidDto.dealId,
      dealerId: assignDealBidDto.dealerId,
      price: assignDealBidDto.price,
    });

    return {
      message: 'Posted',
      bidId,
    };
  }

  @MessagePattern('bid_accepted')
  async updateDealBid(
    @Payload() data: AcceptBidDto,
    @Ctx() context: RmqContext
  ) {
    Logger.log(`Detected new accepted bid`);
    const deal = await this.dealService.getOne(data.dealId);

    if (!deal) {
      Logger.error(`Deal not found for accepted deal. ${JSON.stringify(data)}`);
    } else {
      await this.dealService.updateDealBid(data);
    }

    const channel = context.getChannelRef();
    const message = context.getMesssage();

    channel.ack(message);
  }
}
