import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDealDto } from './deal.dto';
import { Deal, DEAL_SCHEMA_NAME } from './deal.type';

@Injectable()
export class DealService {
  constructor(
    @InjectModel(DEAL_SCHEMA_NAME) private readonly dealModel: Model<Deal>
  ) {}

  create(createDealDto: CreateDealDto) {
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
}
