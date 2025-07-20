import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(cookieParser());

  const port = process.env.PORT ?? 3000;

  Logger.log(`Application listening on port ${port}`, 'Bootstrap');

  await app.listen(port);
}
bootstrap();
