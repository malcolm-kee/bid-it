import { Module } from '@nestjs/common';
import { SocketModule } from './socket/socket.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SocketModule,
  ],
})
export class AppModule {}
