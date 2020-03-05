import { Body, Controller, Get, Param, Post, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { PostBidDto, CreateDealDto } from './deal.dto';
import { DealService } from './deal.service';
import { v4 as uuid } from 'uuid';

@Controller('deal')
export class DealController {
  constructor(private readonly dealService: DealService) {}

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
    const payload = {
      bidId,
      dealId: assignDealBidDto.dealId,
      dealerId: assignDealBidDto.dealerId,
      price: assignDealBidDto.price,
    };

    // TODO: post message to queue
    console.log(payload);

    return {
      message: 'Posted',
      bidId,
    };
  }
}
