import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Deal, DEAL_SCHEMA_NAME } from './deal.type';

@Injectable()
export class DealService {
  constructor(
    @InjectModel(DEAL_SCHEMA_NAME) private readonly dealModel: Model<Deal>
  ) {}

  getOne(id: string): Promise<Deal> {
    return this.dealModel.findById(id).exec();
  }
}
