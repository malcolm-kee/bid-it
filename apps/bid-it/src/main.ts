import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: console,
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [app.get(ConfigService).get<string>('BID_QUEUE_URL') as string],
      queue: 'bid_queue',
      noAck: false,
      queueOptions: {
        durable: false,
      },
    },
  });

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const options = new DocumentBuilder()
    .setTitle('Bid Service')
    .setDescription('Bid service API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
