import { Module } from '@nestjs/common';
import { SocketController } from './socket.controller';
import { SocketGateway } from './socket.gateway';

@Module({
  controllers: [SocketController],
  providers: [
    SocketGateway,
    // {
    //   provide: EVENT_SERVICE,
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => {
    //     const redisUrl = configService.get<string>(REDIS_URL);
    //     return ClientProxyFactory.create({
    //       transport: Transport.REDIS,
    //       options: {
    //         url: redisUrl,
    //       },
    //     });
    //   },
    // },
  ],
})
export class SocketModule {}
