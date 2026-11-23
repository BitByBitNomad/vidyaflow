import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security Headers via Helmet
  app.use(helmet());

  // CORS Configuration
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global Prefix
  app.setGlobalPrefix('api');

  // Global Exception Filter for Consistent API Responses
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Validation Pipe with DTO whitelisting & automatic type conversion
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get<number>('PORT') || 4000;
  await app.listen(port);
  logger.log(`VidyaFlow Backend API (Engineered by BitByBitNomad) is running on http://localhost:${port}/api`);
}

bootstrap();
