import { DealDataModule } from '@app/deal-data';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { BID_QUEUE } from './app.type';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DEALS_DB_URL'),
      }),
      inject: [ConfigService],
      connectionName: 'deals',
    }),
    DealDataModule,
  ],
  controllers: [AppController],
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
  ],
})
export class AppModule {}
