import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AcceptBidData,
  CreateDealData,
  DealDocument,
  DEAL_SCHEMA_NAME,
} from './deal-data.type';

@Injectable()
export class DealDataService {
  constructor(
    @InjectModel(DEAL_SCHEMA_NAME)
    private readonly dealModel: Model<DealDocument>
  ) {}

  create(createDealDto: CreateDealData) {
    return this.dealModel.create({
      name: createDealDto.name,
      startingPrice: createDealDto.startingPrice,
      startedAt: new Date(createDealDto.startedAt),
      closedAt: new Date(createDealDto.endedAt),
    });
  }

  getOne(id: string) {
    return this.dealModel.findById(id).exec();
  }

  getActiveDeals() {
    const now = new Date();

    return this.dealModel
      .find({
        startedAt: {
          $lt: now,
        },
        closedAt: {
          $gt: now,
        },
      })
      .exec();
  }

  getPendingClosedDeals() {
    const now = new Date();

    return this.dealModel
      .find({
        closedAt: { $lt: now },
        closed: false,
      })
      .exec();
  }

  async updateDealBid(acceptBidDto: AcceptBidData) {
    const deal = await this.getOne(acceptBidDto.dealId);

    if (deal) {
      deal.currentBid = {
        currentPrice: acceptBidDto.price,
        currentDealerId: acceptBidDto.dealerId,
      };
      return deal.save();
    }
  }

  async closeDeal(dealId: string) {
    const deal = await this.getOne(dealId);

    if (deal) {
      deal.closed = true;
      return deal.save();
    }
  }
}
