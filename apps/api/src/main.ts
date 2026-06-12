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

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    ApiModule,
    new FastifyAdapter({ logger: true }),
  );

  // ── Register @fastify/multipart for file uploads ──────────────────────────
  await app.register(
    (await import('@fastify/multipart')).default,
    {
      limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB
        files: 1,
      },
    },
  );

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    })
  );

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Enable CORS
  app.enableCors();

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
      `- Plan-based access control (Free/Pro/Enterprise)`
    )
    .setVersion('1.0.0')
    .setContact('Xennic Team', 'https://xennic.com', 'support@xennic.com')
    .setLicense('Proprietary', 'https://xennic.com/terms')
    .addBearerAuth(
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

  console.log(`📚 Swagger UI: http://${process.env.HOST ?? '0.0.0.0'}:${process.env.PORT ?? 3000}/api/docs`);

  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? '0.0.0.0';

  await app.listen(port, host);

  console.log(`🚀 API running on: http://${host}:${port}/api/v1`);
}

bootstrap();
