import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EngineModule } from './engine/engine.module';

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
    EngineModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
