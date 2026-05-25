import './load-env';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

type ExpressMiddlewareFactory = (options: Record<string, unknown>) => unknown;
type ExpressStaticMiddlewareFactory = (
  root: string,
  options?: Record<string, unknown>,
) => unknown;

const { json, urlencoded, static: serveStatic } = require('express') as {
  json: ExpressMiddlewareFactory;
  urlencoded: ExpressMiddlewareFactory;
  static: ExpressStaticMiddlewareFactory;
};
const requestBodyLimit = process.env.REQUEST_BODY_LIMIT ?? '1mb';
const uploadsRoot = resolve(process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads'));

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  mkdirSync(uploadsRoot, { recursive: true });
  app.use(json({ limit: requestBodyLimit }));
  app.use(urlencoded({ extended: true, limit: requestBodyLimit }));
  app.use('/uploads', serveStatic(uploadsRoot));
  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:8000').split(',').map((origin) => origin.trim()),
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
