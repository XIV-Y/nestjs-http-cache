import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as compression from 'compression';

import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.use(compression());

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET',
    credentials: true,
    exposedHeaders: ['ETag', 'Cache-Control'],
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3001);
}

bootstrap();
