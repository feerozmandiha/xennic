import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { ApiModule } from './api.module.js';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter.js';
import { getConfig } from './config/config.module.js';

async function bootstrap() {
  const env = getConfig();

  const app = await NestFactory.create<NestFastifyApplication>(
    ApiModule,
    new FastifyAdapter({ logger: true }),
  );

  // ── Register @fastify/multipart for file uploads ──────────────────────────
  await app.register(
    (await import('@fastify/multipart')).default,
    {
      limits: {
        fileSize: 100 * 1024 * 1024,
        files: 1,
      },
    },
  );

  // ── Global Validation Pipe ─────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  // ── Global Exception Filter ────────────────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  // ── Security Headers (Helmet) ──────────────────────────────────────────────
  await app.register((await import('@fastify/helmet')).default, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  });

  // ── Compression ────────────────────────────────────────────────────────────
  await app.register((await import('@fastify/compress')).default, {
    global: true,
    threshold: 1024,
  });

  // ── Global prefix ──────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1', { exclude: ['metrics'] });

  // ── CORS ───────────────────────────────────────────────────────────────────
  const corsOrigins = env.CORS_ORIGINS
    ? env.CORS_ORIGINS.split(',').map((o: string) => o.trim()).filter(Boolean)
    : ['http://localhost:3001', 'http://localhost:3000'];

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Request-ID',
      'X-Workspace-ID',
    ],
    credentials: true,
    maxAge: 86400,
  });

  // ── Swagger ────────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Xennic Platform API')
    .setDescription('Xennic Engineering Platform API')
    .setVersion('1.0.0')
    .setContact('Xennic Team', 'https://xennic.com', 'support@xennic.com')
    .setLicense('Proprietary', 'https://xennic.com/terms')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'JWT', in: 'header' },
      'JWT-auth',
    )
    .addTag('health', 'Health check endpoints')
    .addTag('workspaces', 'Workspace management (multi-tenant isolation)')
    .addTag('auth', 'Authentication and user management')
    .addTag('users', 'User profile management')
    .addTag('roles', 'Role management and assignment')
    .addTag('permissions', 'Permission management')
    .addTag('projects', 'Project management')
    .addTag('engineering', 'Engineering calculations')
    .addTag('subscriptions', 'Subscription and plan management')
    .addTag('storage', 'File storage (MinIO)')
    .addTag('security', 'Enterprise security (encryption, audit, signed URLs)')
    .addTag('cache', 'Enterprise cache (semantic, embedding, query, ontology)')
    .addTag('background', 'Enterprise background jobs, cron, worker pool')
    .addTag('config', 'Enterprise workspace config, feature flags')
    .addTag('backup', 'Enterprise backup, snapshot, DR')
    .addTag('performance', 'Enterprise batch processing, streaming, query optimization')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Xennic API Documentation',
  });

  await app.listen(env.PORT, env.HOST);

  console.log(`🚀 API running on: http://${env.HOST}:${env.PORT}/api/v1`);
  console.log(`🔒 CORS Origins: ${corsOrigins.join(', ')}`);
  console.log(`📚 Swagger UI: http://${env.HOST}:${env.PORT}/api/docs`);
}

bootstrap();
