import { DealDataModule } from '@app/deal-data';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { DealController } from './deal.controller';
import { DealService } from './deal.service';
import { BID_QUEUE, EVENT_SERVICE } from './deal.type';

@Module({
  imports: [
    BullModule.registerQueue({
      name: BID_QUEUE,
      redis: {
        host: process.env.REDIS_HOST,
      },
    }),
    DealDataModule,
  ],
  controllers: [DealController],
  providers: [
    {
      provide: EVENT_SERVICE,
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        return ClientProxyFactory.create({
          transport: Transport.REDIS,
          options: {
            url: redisUrl,
          },
        });
      },
      inject: [ConfigService],
    },
    DealService,
  ],
})
export class DealModule {}
