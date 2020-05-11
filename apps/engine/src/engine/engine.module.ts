import { BID_QUEUE, REDIS_HOST, REDIS_URL } from '@app/const';
import { DealDataModule } from '@app/deal-data';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { EngineProcessor } from './engine.processor';
import { EngineService } from './engine.service';
import { EVENT_SERVICE } from './engine.type';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: BID_QUEUE,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get(REDIS_HOST),
        },
      }),
    }),
    DealDataModule,
  ],
  providers: [
    {
      provide: EVENT_SERVICE,
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>(REDIS_URL);
        return ClientProxyFactory.create({
          transport: Transport.REDIS,
          options: {
            url: redisUrl,
          },
        });
      },
      inject: [ConfigService],
    },
    EngineService,
    EngineProcessor,
  ],
})
export class EngineModule {}
