import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DealController } from './deal.controller';
import { DealSchema } from './deal.schema';
import { DealService } from './deal.service';
import { DEAL_SCHEMA_NAME } from './deal.type';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: DEAL_SCHEMA_NAME,
          schema: DealSchema,
        },
      ],
      'deals'
    ),
  ],
  controllers: [DealController],
  providers: [DealService],
})
export class DealModule {}
