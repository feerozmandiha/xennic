#!/usr/bin/env node
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

async function generateOpenAPI() {
  console.log('📝 Generating OpenAPI specification...');
  
<<<<<<< HEAD
  process.env.SKIP_INFRA_CONNECT = 'true';

  try {
    const { ApiModule } = await import(resolve(process.cwd(), 'dist/api.module.js'));
    const app = await NestFactory.create(ApiModule, { logger: false, abortOnError: false });
    await app.enableShutdownHooks();
=======
  try {
    const { ApiModule } = await import(resolve(process.cwd(), 'dist/api.module.js'));
    const app = await NestFactory.create(ApiModule, { logger: false });
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a

    const config = new DocumentBuilder()
      .setTitle('Xennic Platform API')
      .setDescription('Xennic Engineering Platform API Documentation')
      .setVersion('1.0.0')
      .setContact('Xennic Team', 'https://xennic.com', 'support@xennic.com')
      .setLicense('Proprietary', 'https://xennic.com/terms')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'JWT', description: 'Enter JWT token', in: 'header' }, 'JWT-auth')
      .addTag('health', 'Health check endpoints')
      .addTag('workspaces', 'Workspace management (multi-tenant isolation)')
      .addTag('auth', 'Authentication and user management')
      .addTag('users', 'User profile management')
      .addTag('roles', 'Role management and assignment')
      .addTag('permissions', 'Permission management')
      .addTag('projects', 'Project management')
      .addTag('engineering', 'Engineering calculations')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    const outputDir = resolve(process.cwd(), '..', '..', 'packages', 'openapi', 'v1');
    mkdirSync(outputDir, { recursive: true });
    const outputPath = join(outputDir, 'openapi.json');
    writeFileSync(outputPath, JSON.stringify(document, null, 2));

    const endpointCount = Object.keys(document.paths).filter(
      (path) => path !== '/api/v1'
    ).length;
    console.log(`✅ OpenAPI specification saved to: ${outputPath}`);
    console.log(`📊 Total endpoints: ${endpointCount}`);
    await app.close();
  } catch (error) {
    console.error('❌ Failed to generate OpenAPI specification:', error);
    throw error;
  }
}

generateOpenAPI();