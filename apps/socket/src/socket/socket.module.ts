import { Module } from '@nestjs/common';
import { SocketController } from './socket.controller';
import { SocketGateway } from './socket.gateway';

@Module({
  controllers: [SocketController],
  providers: [SocketGateway],
})
export class SocketModule {}
