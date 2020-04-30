import { DealDataService } from '@app/deal-data';
import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { v4 as uuid } from 'uuid';
import { AcceptBidDto, CreateDealDto, PostBidDto } from './deal.dto';
import { DealService } from './deal.service';

@Controller('deal')
export class DealController {
  constructor(
    private readonly dealService: DealDataService,
    private readonly helperService: DealService
  ) {}

  @Get()
  getActiveDeals() {
    return this.dealService.getActiveDeals();
  }

  @Get(':id')
  async getDeal(@Param('id') id: string) {
    const deal = await this.dealService.getOne(id);
    if (!deal) {
      throw new NotFoundException();
    }
    return deal;
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
