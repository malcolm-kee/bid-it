import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DealDataSchema } from './deal-data.schema';
import { DealDataService } from './deal-data.service';
import { dealConnectionName, DEAL_SCHEMA_NAME } from './deal-data.type';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: DEAL_SCHEMA_NAME,
          schema: DealDataSchema,
        },
      ],
      dealConnectionName
    ),
  ],
  providers: [DealDataService],
  exports: [DealDataService],
})
export class DealDataModule {}
