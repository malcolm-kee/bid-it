import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DealModule } from './deal/deal.module';
import { UserModule } from './user/user.module';

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
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('USERS_DB_URL'),
      }),
      inject: [ConfigService],
      connectionName: 'users',
    }),
    DealModule,
    UserModule,
  ],
  providers: [Logger],
})
export class AppModule {}
