import { DEALS_DB_URL } from '@app/const';
import { dealConnectionName } from '@app/deal-data';
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
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(DEALS_DB_URL),
      }),
      inject: [ConfigService],
      connectionName: dealConnectionName,
    }),
    EngineModule,
  ],
})
export class AppModule {}
