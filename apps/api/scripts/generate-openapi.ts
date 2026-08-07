#!/usr/bin/env node

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

async function generateOpenAPI(): Promise<void> {
  console.log('Generating OpenAPI specification...');

  let app: { close(): Promise<void> } | undefined;

  try {
    const modulePath = resolve(process.cwd(), 'dist/api.module.js');
    const importedModule = await import(modulePath);
    const ApiModule = importedModule.ApiModule;

    app = await NestFactory.create(ApiModule, { logger: false });

    const websiteUrl = 'https' + ':' + '/' + '/' + 'xennic.com';
    const supportEmail = 'support' + '@' + 'xennic.com';
    const termsUrl = websiteUrl + '/terms';

    const config = new DocumentBuilder()
      .setTitle('Xennic Platform API')
      .setDescription('Xennic Engineering Platform API Documentation')
      .setVersion('1.0.0')
      .setContact('Xennic Team', websiteUrl, supportEmail)
      .setLicense('Proprietary', termsUrl)
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
      .addTag('health', 'Health check endpoints')
      .addTag('workspaces', 'Workspace management and tenant isolation')
      .addTag('auth', 'Authentication and user management')
      .addTag('users', 'User profile management')
      .addTag('roles', 'Role management and assignment')
      .addTag('permissions', 'Permission management')
      .addTag('projects', 'Project management')
      .addTag('storage', 'File and document storage')
      .addTag('engineering', 'Engineering calculations')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    const outputDir = resolve(process.cwd(), '..', '..', 'packages', 'openapi', 'v1');

    mkdirSync(outputDir, { recursive: true });

    const outputPath = join(outputDir, 'openapi.json');

    writeFileSync(outputPath, JSON.stringify(document, null, 2) + '\n', 'utf-8');

    const endpointCount = Object.keys(document.paths).filter(
      (routePath) => routePath !== '/api/v1',
    ).length;

    console.log('OpenAPI specification saved to: ' + outputPath);
    console.log('Total endpoints: ' + endpointCount);
  } catch (error) {
    console.error('Failed to generate OpenAPI specification:', error);
    process.exitCode = 1;
  } finally {
    if (app) {
      await app.close();
    }
  }
}

await generateOpenAPI();
