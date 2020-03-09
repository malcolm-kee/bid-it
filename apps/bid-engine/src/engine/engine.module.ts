import { DealDataModule } from '@app/deal-data';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { EngineController } from './engine.controller';
import { BID_QUEUE } from './engine.type';

@Module({
  imports: [
    BullModule.registerQueue({
      name: BID_QUEUE,
    }),
    DealDataModule,
  ],
  controllers: [EngineController],
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
            prefetchCount: 1,
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
export class EngineModule {}
