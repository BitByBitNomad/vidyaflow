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

  // Security Headers via Helmet (configured for cross-origin API consumption)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Dynamic CORS Configuration (supports Vercel, localhost, and custom frontend URLs)
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile, server-to-server)
      if (!origin) return callback(null, true);

      // If FRONTEND_URL is empty, wildcard, or matches directly
      if (!frontendUrl || frontendUrl === '*' || origin === frontendUrl) {
        return callback(null, true);
      }

      // Allow any Vercel deployment (*.vercel.app)
      try {
        const hostname = new URL(origin).hostname;
        if (hostname.endsWith('.vercel.app')) {
          return callback(null, true);
        }
      } catch {
        // Fallback if URL parsing fails
      }

      // Allow localhost and local IP development
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Check comma-separated origins
      const allowedOrigins = frontendUrl.split(',').map((u) => u.trim());
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Dynamic origin reflection ensures credentials: true works seamlessly
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 204,
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
