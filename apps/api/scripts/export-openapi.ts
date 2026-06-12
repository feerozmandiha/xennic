import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

// برای ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

async function exportOpenAPI() {
  console.log('🚀 Generating OpenAPI specification...');
  
  try {
    // Import module dynamically
    const { ApiModule } = await import('../src/api.module.js');
    
    // Create application with minimal logging
    const app = await NestFactory.create(ApiModule, { 
      logger: false 
    });

    // Swagger configuration
    const config = new DocumentBuilder()
      .setTitle('Xennic Platform API')
      .setDescription('Xennic Engineering Platform API Documentation')
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
      .addTag('health', 'Health check endpoints')
      .addTag('workspaces', 'Workspace management (multi-tenant isolation)')
      .addTag('auth', 'Authentication and user management')
      .addTag('users', 'User profile management')
      .addTag('roles', 'Role management')
      .addTag('permissions', 'Permission management')
      .addTag('projects', 'Project management')
      .addTag('engineering', 'Engineering calculations')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // مسیر خروجی - استفاده از مسیر مطلق
    const outputDir = resolve(process.cwd(), '..', '..', 'packages', 'openapi', 'v1');
    mkdirSync(outputDir, { recursive: true });

    const outputPath = join(outputDir, 'openapi.json');
    writeFileSync(outputPath, JSON.stringify(document, null, 2));

    console.log(`✅ OpenAPI specification exported to: ${outputPath}`);
    console.log(`📊 Total endpoints: ${Object.keys(document.paths).length}`);

    await app.close();
  } catch (error) {
    console.error('❌ Failed to export OpenAPI specification:', error);
    throw error;
  }
}

exportOpenAPI();