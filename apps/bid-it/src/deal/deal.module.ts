import { DealDataModule } from '@app/deal-data';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { DealService } from './deal-service';
import { DealController } from './deal.controller';
import { BID_QUEUE } from './deal.type';

@Module({
  imports: [DealDataModule],
  controllers: [DealController],
  providers: [
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
    DealService,
  ],
})
export class DealModule {}
