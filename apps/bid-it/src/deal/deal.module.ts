import { Module } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { DealController } from './deal.controller';
import { DealSchema } from './deal.schema';
import { DealService } from './deal.service';
import { DEAL_SCHEMA_NAME, BID_QUEUE } from './deal.type';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory } from '@nestjs/microservices';

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
  providers: [
    DealService,
    {
      provide: BID_QUEUE,
      useFactory: (configService: ConfigService) => {
        const BID_QUEUE_URL = configService.get<string>(
          'BID_QUEUE_URL'
        ) as string;
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [BID_QUEUE_URL],
            queue: 'bid_queue',
            noAck: false,
            queueOptions: {
              durable: false,
            },
          },
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class DealModule {}
