import { DealDataService } from '@app/deal-data';
import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import { AcceptBidDto, CreateDealDto, PostBidDto } from './deal.dto';
import { DealService } from './deal.service';
import { EVENT_SERVICE } from './deal.type';

@Controller('deal')
export class DealController {
  constructor(
    private readonly dealService: DealDataService,
    private readonly helperService: DealService,
    @Inject(EVENT_SERVICE) private readonly client: ClientProxy
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

  @EventPattern('bid_accepted')
  async updateDealBid(data: AcceptBidDto) {
    Logger.log(`Detected new accepted bid`);
    const deal = await this.dealService.getOne(data.dealId);

    if (!deal) {
      Logger.error(`Deal not found for accepted deal. ${JSON.stringify(data)}`);
    } else {
      await this.dealService.updateDealBid(data);
    }
  }
}
