import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();

// TODO: use RabbitMQ microservices
// TODO: @EventPattern('place_bid')
// emit 'bid_accepted', 'bid_rejected'
// TODO: add timeout dynamically
// refers https://docs.nestjs.com/techniques/task-scheduling#dynamic-timeouts

// TODO: create websocket service as another app in this monorepo
