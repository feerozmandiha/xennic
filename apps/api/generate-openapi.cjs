/**
 * Xennic OpenAPI Generator
 *
 * Generates the canonical OpenAPI specification at:
 *   packages/openapi/v1/openapi.json
 *
 * Bypasses NestJS instantiation to avoid dependency resolution issues.
 * Uses Test.createTestingModule with a patched compile() that scans
 * the module graph but skips the createInstancesOfDependencies step.
 * Controller instances are lazily initialized with their prototypes
 * for SwaggerScanner metadata reading.
 */

require('reflect-metadata');

const { readFileSync, existsSync, writeFileSync, mkdirSync } = require('fs');
const { resolve, join } = require('path');

// Load env
const envPath = resolve(__dirname, '..', '..', '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx > 0) {
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

const { Test } = require('@nestjs/testing');
const { Module, Global, Logger } = require('@nestjs/common');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');

const MOCK = {};
const MOCK_GUARD = { canActivate: () => true };

async function generateOpenAPI() {
  const logger = new Logger('OpenAPI');

  const { ApiModule } = require('./dist/api.module.js');
  const WorkspaceGuard = require('./dist/modules/rbac/infrastructure/guards/workspace.guard.js').WorkspaceGuard;
  const PermissionsGuard = require('./dist/modules/rbac/infrastructure/guards/permissions.guard.js').PermissionsGuard;
  const JwtAuthGuard = require('./dist/modules/auth/infrastructure/guards/jwt-auth.guard.js').JwtAuthGuard;

  // Global wrapper module that provides mock guards to all child modules
  class GenModule {}
  Module({
    imports: [ApiModule],
    providers: [
      { provide: WorkspaceGuard, useValue: MOCK_GUARD },
      { provide: PermissionsGuard, useValue: MOCK_GUARD },
      { provide: JwtAuthGuard, useValue: MOCK_GUARD },
    ],
  })(GenModule);
  Global()(GenModule);

  logger.log('Building module graph...');

  const builder = Test.createTestingModule({ imports: [GenModule] })
    .overrideProvider('IApiKeyRepository').useValue(MOCK)
    .overrideProvider('IAiRepository').useValue(MOCK)
    .overrideProvider('IAuditLogRepository').useValue(MOCK)
    .overrideProvider('IBillingRepository').useValue(MOCK)
    .overrideProvider('ICalculationRepository').useValue(MOCK)
    .overrideProvider('IEmailProvider').useValue(MOCK)
    .overrideProvider('IEmailRepository').useValue(MOCK)
    .overrideProvider('IFeatureFlagRepository').useValue(MOCK)
    .overrideProvider('IKnowledgeRepository').useValue(MOCK)
    .overrideProvider('IMarketplaceRepository').useValue(MOCK)
    .overrideProvider('INotificationRepository').useValue(MOCK)
    .overrideProvider('IPermissionRepository').useValue(MOCK)
    .overrideProvider('IProjectRepository').useValue(MOCK)
    .overrideProvider('IRefreshTokenRepository').useValue(MOCK)
    .overrideProvider('IRoleRepository').useValue(MOCK)
    .overrideProvider('ISessionRepository').useValue(MOCK)
    .overrideProvider('IStandardRepository').useValue(MOCK)
    .overrideProvider('IStorageRepository').useValue(MOCK)
    .overrideProvider('ISubscriptionRepository').useValue(MOCK)
    .overrideProvider('IUserRepository').useValue(MOCK)
    .overrideProvider('IWebhookRepository').useValue(MOCK)
    .overrideProvider('IWorkspaceMemberRepository').useValue(MOCK)
    .overrideProvider('IWorkspaceRepository').useValue(MOCK)
    .overrideProvider('IWorkspaceSettingsRepository').useValue(MOCK)
    .overrideProvider('ISearchRepository').useValue(MOCK)
    .overrideProvider('ZARINPAL_GATEWAY').useValue(MOCK)
    .overrideProvider(WorkspaceGuard).useValue(MOCK_GUARD)
    .overrideProvider(PermissionsGuard).useValue(MOCK_GUARD)
    .overrideProvider(JwtAuthGuard).useValue(MOCK_GUARD);

  // Patch compile() to skip instantiation
  builder.compile = async function () {
    const { DependenciesScanner } = require('@nestjs/core/scanner');
    const { NoopGraphInspector } = require('@nestjs/core/inspector/noop-graph-inspector');
    const scanner = new DependenciesScanner(
      this.container, this.metadataScanner, NoopGraphInspector, this.applicationConfig,
    );
    await scanner.scan(this.module, { overrides: this.getModuleOverloads() });
    this.applyOverloadsMap();
    const { TestingModule } = require('@nestjs/testing');
    scanner.applyApplicationProviders();
    const root = this.getRootModule();
    return new TestingModule(this.container, NoopGraphInspector, root, this.applicationConfig);
  };

  const moduleFixture = await builder.compile();
  logger.log('Module graph scanned');

  // Initialize controller prototypes for SwaggerScanner
  const modules = moduleFixture.container.getModules();
  for (const [, mod] of modules) {
    if (mod.controllers) {
      for (const [, wrapper] of mod.controllers) {
        if (!wrapper.instance && wrapper.metatype) {
          wrapper.instance = Object.create(wrapper.metatype.prototype);
        }
      }
    }
  }

  const mockApp = {
    container: moduleFixture.container,
    config: moduleFixture.applicationConfig,
    getHttpAdapter: () => ({ getType: () => 'fastify' }),
  };

  const config = new DocumentBuilder()
    .setTitle('Xennic Platform API')
    .setDescription('Xennic Engineering Platform API Documentation')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .build();

  logger.log('Generating OpenAPI document...');

  const document = SwaggerModule.createDocument(mockApp, config);

  const outputDir = resolve(__dirname, '..', '..', 'packages', 'openapi', 'v1');
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, 'openapi.json');
  writeFileSync(outputPath, JSON.stringify(document, null, 2));

  const endpoints = Object.keys(document.paths).length;
  const schemas = Object.keys(document.components?.schemas || {}).length;

  logger.log(`Saved to: ${outputPath}`);
  logger.log(`${endpoints} endpoints, ${schemas} schemas`);

  // Restore default logger after generation
  Logger.overrideLogger(null);
}

generateOpenAPI().catch((error) => {
  console.error('Failed:', error.message || error);
  process.exit(1);
});
