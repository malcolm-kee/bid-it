import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: console,
  });

  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      url: app.get(ConfigService).get('REDIS_URL'),
    },
  });

  await app.startAllMicroservicesAsync();

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const options = new DocumentBuilder()
    .setTitle('Bid Service')
    .setDescription('Bid service API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  const port = app.get(ConfigService).get('PORT') || 3000;

  await app.listen(port, () =>
    console.log(`Bid It Rest API started at port ${port}`)
  );
}

bootstrap();
