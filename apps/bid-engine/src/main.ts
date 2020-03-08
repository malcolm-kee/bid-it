import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.BID_QUEUE_URL as string],
      queue: 'bid_queue',
      noAck: false,
      queueOptions: {
        durable: true,
      },
    },
    logger: console,
  });
  await app.listen(() => console.log(`bid engine started`));
}
bootstrap();

// TODO: create websocket service as another app in this monorepo
