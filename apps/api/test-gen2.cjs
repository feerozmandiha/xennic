require('reflect-metadata');
const { Test } = require('@nestjs/testing');
const { Module, Global } = require('@nestjs/common');

const MOCK = {};
const MOCK_GUARD = { canActivate: () => true };

const dist = './dist';

async function main() {
  console.log('Loading modules...');
  const { ApiModule } = require(dist + '/api.module.js');
  console.log('ApiModule loaded');

  const WorkspaceGuard = require(dist + '/modules/rbac/infrastructure/guards/workspace.guard.js').WorkspaceGuard;
  console.log('Guards loaded');

  class GenModule {}
  Module({ imports: [ApiModule], providers: [{ provide: WorkspaceGuard, useValue: MOCK_GUARD }] })(GenModule);
  Global()(GenModule);

  console.log('Creating builder...');
  const builder = Test.createTestingModule({ imports: [GenModule] });
  builder.overrideProvider('IApiKeyRepository').useValue(MOCK);
  builder.overrideProvider('IAiRepository').useValue(MOCK);
  builder.overrideProvider('IAuditLogRepository').useValue(MOCK);
  builder.overrideProvider('IBillingRepository').useValue(MOCK);
  builder.overrideProvider('ICalculationRepository').useValue(MOCK);
  builder.overrideProvider('IEmailProvider').useValue(MOCK);
  builder.overrideProvider('IEmailRepository').useValue(MOCK);
  builder.overrideProvider('IFeatureFlagRepository').useValue(MOCK);
  builder.overrideProvider('IKnowledgeRepository').useValue(MOCK);
  builder.overrideProvider('IMarketplaceRepository').useValue(MOCK);
  builder.overrideProvider('INotificationRepository').useValue(MOCK);
  builder.overrideProvider('IPermissionRepository').useValue(MOCK);
  builder.overrideProvider('IProjectRepository').useValue(MOCK);
  builder.overrideProvider('IRefreshTokenRepository').useValue(MOCK);
  builder.overrideProvider('IRoleRepository').useValue(MOCK);
  builder.overrideProvider('ISessionRepository').useValue(MOCK);
  builder.overrideProvider('IStandardRepository').useValue(MOCK);
  builder.overrideProvider('IStorageRepository').useValue(MOCK);
  builder.overrideProvider('ISubscriptionRepository').useValue(MOCK);
  builder.overrideProvider('IUserRepository').useValue(MOCK);
  builder.overrideProvider('IWebhookRepository').useValue(MOCK);
  builder.overrideProvider('IWorkspaceMemberRepository').useValue(MOCK);
  builder.overrideProvider('IWorkspaceRepository').useValue(MOCK);
  builder.overrideProvider('IWorkspaceSettingsRepository').useValue(MOCK);
  builder.overrideProvider('ISearchRepository').useValue(MOCK);
  builder.overrideProvider('ZARINPAL_GATEWAY').useValue(MOCK);
  builder.overrideProvider(WorkspaceGuard).useValue(MOCK_GUARD);
  console.log('All overrides applied');

  builder.compile = async function () {
    console.log('In patched compile');
    this.applyLogger();
    console.log('applyLogger done');

    const { DependenciesScanner } = require('@nestjs/core/scanner');
    const { NoopGraphInspector } = require('@nestjs/core/inspector/noop-graph-inspector');

    const scanner = new DependenciesScanner(
      this.container, this.metadataScanner, NoopGraphInspector, this.applicationConfig,
    );

    await scanner.scan(this.module, { overrides: this.getModuleOverloads() });
    console.log('scan done');

    this.applyOverloadsMap();
    console.log('overloads applied');

    const { TestingModule } = require('@nestjs/testing');
    scanner.applyApplicationProviders();
    const root = this.getRootModule();
    console.log('root module:', root.metatype?.name);

    return new TestingModule(this.container, NoopGraphInspector, root, this.applicationConfig);
  };

  console.log('Calling compile...');
  const fixture = await builder.compile();
  console.log('Compile succeeded, modules:', fixture.container.getModules().size);
}

main().catch(e => {
  console.error('ERROR:', e.message);
  console.error('STACK:', e.stack?.split('\n').slice(0, 5).join('\n'));
});
