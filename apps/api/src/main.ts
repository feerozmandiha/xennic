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
<<<<<<< HEAD
import { getConfig } from './config/config.module.js';

async function bootstrap() {
  const env = getConfig();

=======

async function bootstrap() {
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
  const app = await NestFactory.create<NestFastifyApplication>(
    ApiModule,
    new FastifyAdapter({ logger: true }),
  );

  // ── Register @fastify/multipart for file uploads ──────────────────────────
  await app.register(
    (await import('@fastify/multipart')).default,
    {
      limits: {
<<<<<<< HEAD
        fileSize: 100 * 1024 * 1024,
=======
        fileSize: 100 * 1024 * 1024, // 100 MB
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
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

<<<<<<< HEAD
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
=======
  // ── Global prefix ──────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ═════════════════════════════════════════════════════════════════════════════
  // SEC-001A: CORS HARDENING
  // ═════════════════════════════════════════════════════════════════════════════
  //
  // ❌ قبل (ناامن):
  //   app.enableCors();
  //
  // ✅ بعد (امن):
  //   فقط origins مجاز از طریق متغیر محیطی CORS_ORIGINS
  //
  // ═════════════════════════════════════════════════════════════════════════════

  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
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
<<<<<<< HEAD
    maxAge: 86400,
  });

  // ── Swagger ────────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Xennic Platform API')
    .setDescription('Xennic Engineering Platform API')
=======
    maxAge: 86400, // 24 hours
  });

  // ── Swagger Configuration ─────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Xennic Platform API')
    .setDescription(
      `## 🔌 Xennic Engineering Platform API Documentation\n\n` +
      `### 🏗️ Architecture\n` +
      `- **DDD (Domain-Driven Design)** with Clean Architecture\n` +
      `- **Multi-Tenant** SaaS Platform for Electrical Engineering\n` +
      `- **Workspace Isolation** at all layers\n\n` +
      `### 🔐 Authentication\n` +
      `- JWT Bearer Token required for protected endpoints\n` +
      `- Use format: \`Authorization: Bearer <token>\`\n\n` +
      `### 📊 Response Format\n` +
      `- Success: \`{ "success": true, "data": {...}, "meta": {...} }\`\n` +
      `- Error: \`{ "success": false, "error": { "code": "...", "message": "..." } }\`\n\n` +
      `### 🧪 Engineering Modules\n` +
      `- Basic, Cable, Transformer, Protection, Power Quality\n` +
      `- Plan-based access control (Free/Pro/Enterprise)`,
    )
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
    .setVersion('1.0.0')
    .setContact('Xennic Team', 'https://xennic.com', 'support@xennic.com')
    .setLicense('Proprietary', 'https://xennic.com/terms')
    .addBearerAuth(
<<<<<<< HEAD
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
=======
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('health',         'Health check endpoints')
    .addTag('workspaces',     'Workspace management (multi-tenant isolation)')
    .addTag('auth',           'Authentication and user management')
    .addTag('users',          'User profile management')
    .addTag('roles',          'Role management and assignment')
    .addTag('permissions',    'Permission management')
    .addTag('projects',       'Project management')
    .addTag('engineering',    'Engineering calculations')
    .addTag('subscriptions',  'Subscription and plan management')
    .addTag('storage',        'File storage (MinIO)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a

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

<<<<<<< HEAD
  await app.listen(env.PORT, env.HOST);

  console.log(`🚀 API running on: http://${env.HOST}:${env.PORT}/api/v1`);
  console.log(`🔒 CORS Origins: ${corsOrigins.join(', ')}`);
  console.log(`📚 Swagger UI: http://${env.HOST}:${env.PORT}/api/docs`);
=======
  console.log(
    `📚 Swagger UI: http://${process.env.HOST ?? '0.0.0.0'}:${process.env.PORT ?? 3000}/api/docs`,
  );

  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? '0.0.0.0';

  await app.listen(port, host);

  console.log(`🚀 API running on: http://${host}:${port}/api/v1`);
  console.log(`🔒 CORS Origins: ${corsOrigins.join(', ')}`);
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
}

bootstrap();
