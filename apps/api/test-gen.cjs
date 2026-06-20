require('reflect-metadata');
const { Test } = require('@nestjs/testing');
const { Module, Global } = require('@nestjs/common');
const { join } = require('path');

const MOCK = {};
const MOCK_GUARD = { canActivate: () => true };

const distDir = join(__dirname, 'dist');

async function main() {
  const { ApiModule } = require(join(distDir, 'api.module.js'));
  const WorkspaceGuard = require(join(distDir, 'modules/rbac/infrastructure/guards/workspace.guard.js')).WorkspaceGuard;
  const PermissionsGuard = require(join(distDir, 'modules/rbac/infrastructure/guards/permissions.guard.js')).PermissionsGuard;
  const JwtAuthGuard = require(join(distDir, 'modules/auth/infrastructure/guards/jwt-auth.guard.js')).JwtAuthGuard;

  class GenModule {}
  Module({ imports: [ApiModule], providers: [{ provide: WorkspaceGuard, useValue: MOCK_GUARD }] })(GenModule);
  Global()(GenModule);

  console.log('1: creating builder...');
  const builder = Test.createTestingModule({ imports: [GenModule] });
  builder.overrideProvider('IApiKeyRepository').useValue(MOCK);
  
  console.log('2: patching compile...');
  builder.compile = async function() {
    console.log('2a: in patched compile');
    this.applyLogger();
    console.log('2b: after applyLogger');
    console.log('2c: this.container:', typeof this.container, !!this.container);
    
    const { DependenciesScanner } = require('@nestjs/core/scanner');
    const { NoopGraphInspector } = require('@nestjs/core/inspector/noop-graph-inspector');
    
    const scanner = new DependenciesScanner(
      this.container,
      this.metadataScanner,
      NoopGraphInspector,
      this.applicationConfig,
    );
    console.log('2d: scanner created, calling scan...');
    
    await scanner.scan(this.module, {
      overrides: this.getModuleOverloads(),
    });
    console.log('2e: scan done');
    
    this.applyOverloadsMap();
    console.log('2f: overloads applied');
    
    console.log('2g: root module:', this.getRootModule()?.metatype?.name);
    
    const { TestingModule } = require('@nestjs/testing');
    scanner.applyApplicationProviders();
    const root = this.getRootModule();
    const tm = new TestingModule(this.container, NoopGraphInspector, root, this.applicationConfig);
    console.log('2h: TestingModule created');
    return tm;
  };
  
  console.log('3: calling compile...');
  const fixture = await builder.compile();
  console.log('4: compiled successfully');
  console.log('5: modules:', fixture.container.getModules().size);
}

main().catch(e => {
  console.error('ERROR:', e.message);
  console.error('STACK:', e.stack?.split('\n').slice(0, 5).join('\n'));
});
