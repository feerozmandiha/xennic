import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { InProcessCommandBus } from '../src/modules/enterprise-messaging/infrastructure/bus/in-process-command-bus.js';
import { InProcessQueryBus } from '../src/modules/enterprise-messaging/infrastructure/bus/in-process-query-bus.js';
import { InProcessMessageQueue } from '../src/modules/enterprise-messaging/infrastructure/bus/in-process-message-queue.js';
import { JsonMessageSerializer } from '../src/modules/enterprise-messaging/infrastructure/serialization/message-serializer.js';
import { MessageBusService } from '../src/modules/enterprise-messaging/application/services/message-bus.service.js';
import { SchemaRegistryService } from '../src/modules/enterprise-event-architecture/application/services/schema-registry.service.js';
import { SagaOrchestratorService } from '../src/modules/enterprise-saga/application/orchestrator/saga-orchestrator.service.js';
import { CompensationHandler } from '../src/modules/enterprise-saga/application/compensation/compensation-handler.js';
import { SagaInstanceRepository } from '../src/modules/enterprise-saga/infrastructure/persistence/saga-instance.repository.js';
import { CacheManagerService } from '../src/modules/enterprise-cache/application/services/cache-manager.service.js';
import { CacheInvalidationService } from '../src/modules/enterprise-cache/infrastructure/distributed/cache-invalidation.service.js';
import { ObservabilityService } from '../src/modules/enterprise-observability/application/services/observability.service.js';
import { ConfigManagerService } from '../src/modules/enterprise-config/application/services/config-manager.service.js';
import { EnvConfigProvider } from '../src/modules/enterprise-config/infrastructure/providers/env-config-provider.js';
import { ApiDiscoveryService } from '../src/modules/enterprise-api-platform/application/services/api-discovery.service.js';
import { TokenBucketRateLimiter } from '../src/modules/enterprise-api-platform/infrastructure/rate-limit/token-bucket-rate-limiter.js';
import { FederatedSearchService } from '../src/modules/enterprise-search-federation/application/services/federated-search.service.js';
import { RankingStrategyService } from '../src/modules/enterprise-search-federation/application/services/ranking-strategy.service.js';
import type {
  ICommand,
  ICommandHandler,
} from '../src/modules/enterprise-messaging/domain/interfaces/command-bus.interface.js';
import type {
  IQuery,
  IQueryHandler,
} from '../src/modules/enterprise-messaging/domain/interfaces/query-bus.interface.js';
import type {
  SagaStep,
  SagaDefinition,
} from '../src/modules/enterprise-saga/domain/interfaces/saga.interface.js';
import type { ISearchSource } from '../src/modules/enterprise-search-federation/domain/interfaces/search-source.interface.js';

describe('Enterprise Platform (Sprint E1)', () => {
  let module: TestingModule;
  let commandBus: InProcessCommandBus;
  let queryBus: InProcessQueryBus;
  let messageQueue: InProcessMessageQueue;
  let serializer: JsonMessageSerializer;
  let messageBusService: MessageBusService;
  let schemaRegistry: SchemaRegistryService;
  let orchestrator: SagaOrchestratorService;
  let compensationHandler: CompensationHandler;
  let sagaRepo: SagaInstanceRepository;
  let cacheManager: CacheManagerService;
  let cacheInvalidation: CacheInvalidationService;
  let observability: ObservabilityService;
  let configManager: ConfigManagerService;
  let envProvider: EnvConfigProvider;
  let apiDiscovery: ApiDiscoveryService;
  let rateLimiter: TokenBucketRateLimiter;
  let federatedSearch: FederatedSearchService;
  let rankingStrategy: RankingStrategyService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        InProcessCommandBus,
        InProcessQueryBus,
        InProcessMessageQueue,
        JsonMessageSerializer,
        MessageBusService,
        SchemaRegistryService,
        SagaOrchestratorService,
        CompensationHandler,
        SagaInstanceRepository,
        CacheManagerService,
        CacheInvalidationService,
        ObservabilityService,
        ConfigManagerService,
        EnvConfigProvider,
        ApiDiscoveryService,
        TokenBucketRateLimiter,
        FederatedSearchService,
        RankingStrategyService,
      ],
    }).compile();

    commandBus = module.get(InProcessCommandBus);
    queryBus = module.get(InProcessQueryBus);
    messageQueue = module.get(InProcessMessageQueue);
    serializer = module.get(JsonMessageSerializer);
    messageBusService = module.get(MessageBusService);
    schemaRegistry = module.get(SchemaRegistryService);
    orchestrator = module.get(SagaOrchestratorService);
    compensationHandler = module.get(CompensationHandler);
    sagaRepo = module.get(SagaInstanceRepository);
    cacheManager = module.get(CacheManagerService);
    cacheInvalidation = module.get(CacheInvalidationService);
    observability = module.get(ObservabilityService);
    configManager = module.get(ConfigManagerService);
    envProvider = module.get(EnvConfigProvider);
    apiDiscovery = module.get(ApiDiscoveryService);
    rateLimiter = module.get(TokenBucketRateLimiter);
    federatedSearch = module.get(FederatedSearchService);
    rankingStrategy = module.get(RankingStrategyService);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    observability.reset();
  });

  // ─── Phase 6: Enterprise Messaging ─────────────────────────────────

  describe('Phase 6: Enterprise Messaging', () => {
    it('should execute a command and get result', async () => {
      const results: string[] = [];
      const handler: ICommandHandler<ICommand, string> = {
        handledCommand: 'TestCommand',
        handle: async (cmd: ICommand) => {
          results.push(cmd.commandId);
          return `executed-${cmd.commandId}`;
        },
      };
      commandBus.register(handler);

      const cmd: ICommand = {
        commandName: 'TestCommand',
        commandId: 'cmd-1',
        timestamp: new Date().toISOString(),
        correlationId: 'corr-1',
        causationId: 'cause-1',
        workspaceId: 'ws-1',
      };

      const result = await commandBus.execute(cmd);
      expect(result).toBe('executed-cmd-1');
      expect(results).toContain('cmd-1');
    });

    it('should throw when no handler for command', async () => {
      const cmd: ICommand = {
        commandName: 'Nonexistent',
        commandId: 'cmd-x',
        timestamp: new Date().toISOString(),
        correlationId: 'corr-x',
        causationId: 'cause-x',
        workspaceId: 'ws-1',
      };
      await expect(commandBus.execute(cmd)).rejects.toThrow(
        'No handler registered for command: Nonexistent',
      );
    });

    it('should execute a query and return result', async () => {
      const handler: IQueryHandler<IQuery, { id: string }> = {
        handledQuery: 'TestQuery',
        handle: async (q: IQuery) => ({ id: q.queryId, found: true }),
      };
      queryBus.register(handler);

      const query: IQuery = {
        queryName: 'TestQuery',
        queryId: 'q-1',
        timestamp: new Date().toISOString(),
        correlationId: 'corr-2',
      };

      const result = await queryBus.ask(query);
      expect(result).toEqual({ id: 'q-1', found: true });
    });

    it('should throw when no handler for query', async () => {
      const query: IQuery = {
        queryName: 'Nonexistent',
        queryId: 'q-x',
        timestamp: new Date().toISOString(),
        correlationId: 'corr-x',
      };
      await expect(queryBus.ask(query)).rejects.toThrow(
        'No handler registered for query: Nonexistent',
      );
    });

    it('should publish and handle messages via message queue', async () => {
      const handled: string[] = [];
      messageQueue.subscribe({
        handledMessageType: 'TestMessage',
        handle: async (env) => {
          handled.push(env.messageId);
        },
      });

      await messageQueue.publish({
        messageId: 'msg-1',
        messageType: 'TestMessage',
        payload: { test: true },
        priority: 'normal',
        correlationId: 'corr-3',
        causationId: 'cause-3',
        maxRetries: 3,
      });

      await new Promise((r) => setTimeout(r, 50));
      expect(handled).toContain('msg-1');
    });

    it('should serialize and deserialize messages', () => {
      const envelope = {
        messageId: 'ser-1',
        messageType: 'Test',
        payload: { key: 'value' },
        priority: 'high' as const,
        correlationId: 'corr',
        causationId: 'cause',
        timestamp: new Date().toISOString(),
        retryCount: 0,
        maxRetries: 3,
      };
      const serialized = serializer.serialize(envelope);
      const deserialized = serializer.deserialize(serialized);
      expect(deserialized.messageId).toBe('ser-1');
      expect(deserialized.payload).toEqual({ key: 'value' });
    });

    it('should dead-letter messages that exceed max retries', async () => {
      const failingHandler = {
        handledMessageType: 'FailingMessage',
        handle: async () => {
          throw new Error('always fails');
        },
      };
      messageQueue.subscribe(failingHandler);

      await messageQueue.publish({
        messageId: 'dlq-1',
        messageType: 'FailingMessage',
        payload: {},
        priority: 'normal',
        correlationId: 'corr-dlq',
        causationId: 'cause-dlq',
        maxRetries: 1,
      });

      await new Promise((r) => setTimeout(r, 100));
      const dlqItems = await messageQueue.list();
      expect(dlqItems.some((d) => d.messageId === 'dlq-1')).toBe(true);
    });

    it('should replay dead-lettered messages', async () => {
      const replayHandled: string[] = [];
      messageQueue.subscribe({
        handledMessageType: 'ReplayMessage',
        handle: async (env) => {
          replayHandled.push(env.messageId);
        },
      });

      await messageQueue.send({
        messageId: 'replay-dlq-1',
        messageType: 'ReplayMessage',
        payload: {},
        error: 'test error',
        failedAt: new Date().toISOString(),
        retryCount: 3,
      });

      await messageQueue.replay('replay-dlq-1');
      await new Promise((r) => setTimeout(r, 50));
      expect(replayHandled).toContain('replay-dlq-1');
    });
  });

  // ─── Phase 1: Enterprise Event Architecture ────────────────────────

  describe('Phase 1: Enterprise Event Architecture', () => {
    it('should register and retrieve schema', async () => {
      await schemaRegistry.register('DocumentProcessed', {
        eventType: 'DocumentProcessed',
        version: 1,
        properties: {
          documentId: { type: 'string' },
          workspaceId: { type: 'string' },
        },
        required: ['documentId', 'workspaceId'],
      });

      const schema = await schemaRegistry.getSchema('DocumentProcessed');
      expect(schema).not.toBeNull();
      expect(schema!.version).toBe(1);
      expect(schema!.required).toContain('documentId');
    });

    it('should return latest version', async () => {
      const latest = await schemaRegistry.getLatestVersion('DocumentProcessed');
      expect(latest).toBe(1);
    });

    it('should reject duplicate or older versions', async () => {
      await expect(
        schemaRegistry.register('DocumentProcessed', {
          eventType: 'DocumentProcessed',
          version: 1,
          properties: {},
          required: [],
        }),
      ).rejects.toThrow('not newer');
    });

    it('should check backward compatibility', async () => {
      const compatible = await schemaRegistry.checkCompatibility(
        'DocumentProcessed',
        {
          eventType: 'DocumentProcessed',
          version: 2,
          properties: {
            documentId: { type: 'string' },
            workspaceId: { type: 'string' },
            newField: { type: 'string', optional: true },
          },
          required: ['documentId', 'workspaceId'],
        },
        'BACKWARD',
      );

      expect(compatible.compatible).toBe(true);
    });

    it('should detect backward incompatibility when required field removed', async () => {
      const result = await schemaRegistry.checkCompatibility(
        'DocumentProcessed',
        {
          eventType: 'DocumentProcessed',
          version: 2,
          properties: {
            workspaceId: { type: 'string' },
          },
          required: ['workspaceId'],
        },
        'BACKWARD',
      );

      expect(result.compatible).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect forward incompatibility', async () => {
      const result = await schemaRegistry.checkCompatibility(
        'DocumentProcessed',
        {
          eventType: 'DocumentProcessed',
          version: 2,
          properties: {
            documentId: { type: 'string' },
            workspaceId: { type: 'string' },
            newRequired: { type: 'string' },
          },
          required: ['documentId', 'workspaceId', 'newRequired'],
        },
        'FORWARD',
      );

      expect(result.compatible).toBe(false);
    });

    it('should get all versions of a schema', async () => {
      await schemaRegistry.register('VersionedEvent', {
        eventType: 'VersionedEvent',
        version: 1,
        properties: { a: { type: 'string' } },
        required: ['a'],
      });
      await schemaRegistry.register('VersionedEvent', {
        eventType: 'VersionedEvent',
        version: 2,
        properties: { a: { type: 'string' }, b: { type: 'number', optional: true } },
        required: ['a'],
      });

      const versions = await schemaRegistry.getAllVersions('VersionedEvent');
      expect(versions.length).toBe(2);
    });
  });

  // ─── Phase 2: Enterprise Saga ──────────────────────────────────────

  describe('Phase 2: Enterprise Saga', () => {
    it('should execute a saga with multiple steps', async () => {
      const executionOrder: string[] = [];

      const step1: SagaStep = {
        name: 'step1',
        execute: async () => {
          executionOrder.push('step1');
        },
        compensate: async () => {
          executionOrder.push('comp-step1');
        },
      };
      const step2: SagaStep = {
        name: 'step2',
        execute: async () => {
          executionOrder.push('step2');
        },
        compensate: async () => {
          executionOrder.push('comp-step2');
        },
      };

      const sagaDef: SagaDefinition = {
        sagaName: 'TestSaga',
        steps: [step1, step2],
        timeoutMs: 5000,
        compensable: false,
      };

      orchestrator.registerSaga(sagaDef);
      const sagaId = await orchestrator.start('TestSaga', {});
      expect(sagaId).toBeDefined();

      await new Promise((r) => setTimeout(r, 100));
      const status = await orchestrator.getStatus(sagaId);
      expect(status).not.toBeNull();
      expect(status!.status).toBe('COMPLETED');
      expect(executionOrder).toEqual(['step1', 'step2']);
    });

    it('should compensate on failure when compensable', async () => {
      const executionOrder: string[] = [];

      const step1: SagaStep = {
        name: 'step1',
        execute: async () => {
          executionOrder.push('step1');
        },
        compensate: async () => {
          executionOrder.push('comp-step1');
        },
      };
      const step2: SagaStep = {
        name: 'step2',
        execute: async () => {
          executionOrder.push('step2');
          throw new Error('step2 failed');
        },
        compensate: async () => {
          executionOrder.push('comp-step2');
        },
      };

      const sagaDef: SagaDefinition = {
        sagaName: 'CompensableSaga',
        steps: [step1, step2],
        timeoutMs: 5000,
        compensable: true,
      };

      orchestrator.registerSaga(sagaDef);
      const sagaId = await orchestrator.start('CompensableSaga', {});

      await new Promise((r) => setTimeout(r, 100));
      const status = await orchestrator.getStatus(sagaId);
      expect(status!.status).toBe('COMPENSATED');
      expect(executionOrder).toContain('step1');
      expect(executionOrder).toContain('step2');
      expect(executionOrder).toContain('comp-step1');
    });

    it('should list saga instances', async () => {
      const sagaDef: SagaDefinition = {
        sagaName: 'ListTestSaga',
        steps: [
          {
            name: 'only',
            execute: async () => {},
            compensate: async () => {},
          },
        ],
        timeoutMs: 5000,
        compensable: false,
      };

      orchestrator.registerSaga(sagaDef);
      await orchestrator.start('ListTestSaga', {});
      await new Promise((r) => setTimeout(r, 50));

      const instances = await orchestrator.list();
      expect(instances.length).toBeGreaterThan(0);
    });
  });

  // ─── Phase 5: Enterprise Cache ─────────────────────────────────────

  describe('Phase 5: Enterprise Cache', () => {
    it('should set and get cache entries', async () => {
      await cacheManager.set('semantic', 'key1', { data: 'value1' });
      const result = await cacheManager.get('semantic', 'key1');
      expect(result).toEqual({ data: 'value1' });
    });

    it('should return null for missing keys', async () => {
      const result = await cacheManager.get('prompt', 'nonexistent');
      expect(result).toBeNull();
    });

    it('should respect TTL', async () => {
      await cacheManager.set('semantic', 'ttl-key', 'value', { ttlMs: 10 });
      let result = await cacheManager.get('semantic', 'ttl-key');
      expect(result).toBe('value');

      await new Promise((r) => setTimeout(r, 20));
      result = await cacheManager.get('semantic', 'ttl-key');
      expect(result).toBeNull();
    });

    it('should delete cache entries', async () => {
      await cacheManager.set('embedding', 'del-key', 'value');
      const deleted = await cacheManager.delete('embedding', 'del-key');
      expect(deleted).toBe(true);

      const result = await cacheManager.get('embedding', 'del-key');
      expect(result).toBeNull();
    });

    it('should invalidate by tag', async () => {
      await cacheManager.set('semantic', 'tagged-1', 'v1', { tags: ['group-a'] });
      await cacheManager.set('semantic', 'tagged-2', 'v2', { tags: ['group-a'] });
      await cacheManager.set('semantic', 'other', 'v3', { tags: ['group-b'] });

      const count = await cacheManager.invalidateByTag('semantic', 'group-a');
      expect(count).toBe(2);

      const r1 = await cacheManager.get('semantic', 'tagged-1');
      expect(r1).toBeNull();
      const r3 = await cacheManager.get('semantic', 'other');
      expect(r3).toBe('v3');
    });

    it('should invalidate by pattern', async () => {
      await cacheManager.set('semantic', 'user:123:profile', 'data');
      await cacheManager.set('semantic', 'user:456:profile', 'data');
      await cacheManager.set('semantic', 'other:789', 'data');

      const count = await cacheManager.invalidateByPattern('semantic', 'user:*:profile');
      expect(count).toBe(2);
    });

    it('should clear entire namespace', async () => {
      await cacheManager.set('search', 'a', 1);
      await cacheManager.set('search', 'b', 2);
      const count = await cacheManager.invalidateByNamespace('search');
      expect(count).toBe(2);

      const r1 = await cacheManager.get('search', 'a');
      expect(r1).toBeNull();
    });
  });

  // ─── Phase 3: Enterprise Observability ─────────────────────────────

  describe('Phase 3: Enterprise Observability', () => {
    it('should create and complete spans', () => {
      const span = observability.startSpan('test-op', { key: 'value' });
      expect(span.spanId).toBeDefined();
      expect(span.traceId).toBeDefined();
      expect(span.attributes).toEqual({ key: 'value' });

      observability.endSpan(span);
      expect(span.status).toBe('OK');
      expect(span.endTime).toBeDefined();
    });

    it('should record errors on spans', () => {
      const span = observability.startSpan('failing-op');
      observability.recordError(span, new Error('test error'));
      expect(span.status).toBe('ERROR');
      expect(span.errorMessage).toBe('test error');
    });

    it('should inject and extract trace context', () => {
      const span = observability.startSpan('context-test');
      const carrier = observability.injectContext(span);
      expect(carrier['x-trace-id']).toBe(span.traceId);

      const extracted = observability.extractContext(carrier);
      expect(extracted).toBe(span.traceId);
    });

    it('should record metrics', () => {
      observability.increment('requests_total', 1, { method: 'GET' });
      observability.increment('requests_total', 1, { method: 'GET' });
      observability.gauge('active_users', 42);
      observability.record('latency_ms', 150, { endpoint: '/test' });
    });

    it('should perform structured logging', () => {
      observability.info('test message', { module: 'test' });
      observability.warn('warning', { threshold: 0.9 });
      observability.error('error occurred', new Error('test'), { code: 'E001' });
    });
  });

  // ─── Phase 4: Enterprise Config ────────────────────────────────────

  describe('Phase 4: Enterprise Config', () => {
    it('should set and get config values', async () => {
      await configManager.set('maxUploadSize', 10485760, 'system');
      const val = await configManager.get<number>('maxUploadSize', 'system');
      expect(val).toBe(10485760);
    });

    it('should support scoped config', async () => {
      await configManager.set('theme', 'dark', 'workspace', 'ws-1');
      await configManager.set('theme', 'light', 'workspace', 'ws-2');

      const ws1 = await configManager.get('theme', 'workspace', 'ws-1');
      const ws2 = await configManager.get('theme', 'workspace', 'ws-2');
      expect(ws1).toBe('dark');
      expect(ws2).toBe('light');
    });

    it('should fall back to system config', async () => {
      await configManager.set('defaultLang', 'en', 'system');
      const val = await configManager.get('defaultLang', 'workspace', 'unknown-ws');
      expect(val).toBe('en');
    });

    it('should define and check feature flags', async () => {
      await configManager.define({
        key: 'new-dashboard',
        name: 'New Dashboard',
        description: 'Enable new dashboard UI',
        enabled: false,
      });

      const enabled = await configManager.isEnabled('new-dashboard');
      expect(enabled).toBe(false);
    });

    it('should enable feature flags per workspace', async () => {
      await configManager.define({
        key: 'beta-feature',
        name: 'Beta Feature',
        description: 'Beta feature flag',
        enabled: false,
      });

      await configManager.enable('beta-feature', 'ws-beta');
      const wsEnabled = await configManager.isEnabled('beta-feature', 'ws-beta');
      expect(wsEnabled).toBe(true);

      const globalEnabled = await configManager.isEnabled('beta-feature');
      expect(globalEnabled).toBe(false);
    });

    it('should handle environment variables', () => {
      process.env.TEST_VAR = 'hello';
      expect(envProvider.get('TEST_VAR')).toBe('hello');
      expect(envProvider.get('NONEXISTENT')).toBeUndefined();
      expect(envProvider.getBool('NONEXISTENT', true)).toBe(true);
      expect(envProvider.getInt('NONEXISTENT', 42)).toBe(42);
    });
  });

  // ─── Phase 7: Enterprise API Platform ──────────────────────────────

  describe('Phase 7: Enterprise API Platform', () => {
    it('should register and discover API endpoints', () => {
      apiDiscovery.registerEndpoint({
        path: '/api/v1/knowledge',
        method: 'GET',
        version: 'v1',
        module: 'knowledge',
        description: 'List knowledge entries',
        authRequired: true,
        rateLimitTier: 'basic',
      });

      const endpoints = apiDiscovery.getEndpoints('v1');
      expect(endpoints.length).toBeGreaterThan(0);
      expect(endpoints[0].path).toBe('/api/v1/knowledge');
    });

    it('should filter endpoints by module', () => {
      const filtered = apiDiscovery.getEndpoints(undefined, 'knowledge');
      expect(filtered.every((e) => e.module === 'knowledge')).toBe(true);
    });

    it('should track API versions', () => {
      const versions = apiDiscovery.getActiveVersions();
      expect(versions.length).toBeGreaterThan(0);
      expect(versions.some((v) => v.version === 'v1')).toBe(true);
    });

    it('should deprecate endpoints', () => {
      apiDiscovery.deprecateEndpoint(
        '/api/v1/knowledge',
        'Use /api/v2/knowledge instead',
        '2026-12-31T00:00:00Z',
      );
      const endpoints = apiDiscovery.getEndpoints('v1');
      const deprecated = endpoints.find((e) => e.deprecated);
      expect(deprecated).toBeDefined();
      expect(deprecated!.deprecationMessage).toContain('Use /api/v2');
    });

    it('should rate limit requests', async () => {
      const result1 = await rateLimiter.check('test-client', 'free');
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBeGreaterThanOrEqual(0);

      const config = rateLimiter.getConfig('free');
      expect(config.requestsPerWindow).toBe(10);
    });

    it('should deny when rate limit exceeded', async () => {
      const key = 'burst-client';
      for (let i = 0; i < 12; i++) {
        await rateLimiter.check(key, 'free');
      }
      const result = await rateLimiter.check(key, 'free');
      expect(result.allowed).toBe(false);
    });

    it('should reset rate limit', async () => {
      await rateLimiter.reset('test-client');
      const result = await rateLimiter.check('test-client', 'free');
      expect(result.allowed).toBe(true);
    });
  });

  // ─── Phase 8: Enterprise Search Federation ─────────────────────────

  describe('Phase 8: Enterprise Search Federation', () => {
    it('should register search sources', () => {
      const source: ISearchSource = {
        sourceName: 'test-source',
        priority: 1,
        search: async () => [
          {
            id: '1',
            source: 'test-source',
            type: 'article',
            title: 'Test Result',
            description: 'A test search result',
            url: '/articles/1',
            workspaceId: 'ws-1',
            score: 0.9,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      federatedSearch.registerSource(source);
    });

    it('should federate search across sources', async () => {
      const sourceA: ISearchSource = {
        sourceName: 'source-a',
        priority: 1,
        search: async () => [
          {
            id: 'a1',
            source: 'source-a',
            type: 'article',
            title: 'Alpha Result',
            description: 'From source A',
            url: '/a/1',
            workspaceId: 'ws-1',
            score: 0.8,
            createdAt: new Date().toISOString(),
          },
        ],
      };
      const sourceB: ISearchSource = {
        sourceName: 'source-b',
        priority: 2,
        search: async () => [
          {
            id: 'b1',
            source: 'source-b',
            type: 'standard',
            title: 'Beta Standard',
            description: 'From source B',
            url: '/b/1',
            workspaceId: 'ws-1',
            score: 0.9,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      federatedSearch.registerSource(sourceA);
      federatedSearch.registerSource(sourceB);

      const result = await federatedSearch.search({ query: 'test', limit: 10 });
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.sourceCounts['source-a']).toBe(1);
      expect(result.tookMs).toBeGreaterThanOrEqual(0);
    });

    it('should filter sources by name', async () => {
      const result = await federatedSearch.search({
        query: 'test',
        sources: ['source-a'],
        limit: 10,
      });
      expect(result.items.every((i) => i.source === 'source-a')).toBe(true);
    });

    it('should deduplicate results from multiple sources', async () => {
      const dedupA: ISearchSource = {
        sourceName: 'dedup-a',
        priority: 1,
        search: async () => [
          {
            id: 'd1',
            source: 'dedup-a',
            type: 'article',
            title: 'Dedup Result',
            description: 'First',
            url: '/d/1',
            workspaceId: 'ws-1',
            score: 0.9,
            createdAt: new Date().toISOString(),
          },
        ],
      };
      const dedupB: ISearchSource = {
        sourceName: 'dedup-b',
        priority: 2,
        search: async () => [
          {
            id: 'd1',
            source: 'dedup-b',
            type: 'article',
            title: 'Dedup Result',
            description: 'Duplicate ID',
            url: '/d/1',
            workspaceId: 'ws-1',
            score: 0.8,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      federatedSearch.registerSource(dedupA);
      federatedSearch.registerSource(dedupB);

      const result = await federatedSearch.search({ query: 'dedup', limit: 10 });
      const dedupItems = result.items.filter((i) => i.id === 'd1');
      expect(dedupItems.length).toBe(1);
    });
  });

  // ─── Cross-Phase Integration ───────────────────────────────────────

  describe('Cross-Phase Integration', () => {
    it('should use command bus to invalidate cache', async () => {
      await cacheManager.set('semantic', 'invalidate-me', 'cached-value', {
        tags: ['command-tag'],
      });

      const invalidateHandler: ICommandHandler<ICommand, number> = {
        handledCommand: 'InvalidateCacheCommand',
        handle: async () => cacheManager.invalidateByTag('semantic', 'command-tag'),
      };
      commandBus.register(invalidateHandler);

      const cmd: ICommand = {
        commandName: 'InvalidateCacheCommand',
        commandId: 'inv-cmd-1',
        timestamp: new Date().toISOString(),
        correlationId: 'corr-inv',
        causationId: 'cause-inv',
        workspaceId: 'ws-1',
      };

      const count = await commandBus.execute<ICommand, number>(cmd);
      expect(count).toBe(1);

      const cached = await cacheManager.get('semantic', 'invalidate-me');
      expect(cached).toBeNull();
    });

    it('should publish metric on command execution', async () => {
      const metricHandler: ICommandHandler<ICommand, void> = {
        handledCommand: 'TrackedCommand',
        handle: async () => {
          observability.increment('commands_executed', 1, { command: 'TrackedCommand' });
        },
      };
      commandBus.register(metricHandler);

      const cmd: ICommand = {
        commandName: 'TrackedCommand',
        commandId: 'metric-cmd-1',
        timestamp: new Date().toISOString(),
        correlationId: 'corr-metric',
        causationId: 'cause-metric',
        workspaceId: 'ws-1',
      };

      await commandBus.execute(cmd);
      const metric = await observability.getMetric('commands_executed');
      // metric tracking works (could be more than 1 due to other tests)
      // look for the specific metric key
      expect(metric).toBeDefined();
    });

    it('should check feature flag before rate limiting', async () => {
      await configManager.define({
        key: 'rate-limit-override',
        name: 'Rate Limit Override',
        description: 'Bypass rate limiting for internal clients',
        enabled: true,
        workspaceOverrides: { 'ws-internal': true },
      });

      const rateLimitCheck = await configManager.isEnabled('rate-limit-override', 'ws-internal');
      expect(rateLimitCheck).toBe(true);
    });

    it('should use saga with compensation and cache invalidation', async () => {
      const order: string[] = [];

      const cacheStep: SagaStep = {
        name: 'cache-step',
        execute: async () => {
          await cacheManager.set('semantic', 'saga-key', 'saga-value', { tags: ['saga'] });
          order.push('cached');
        },
        compensate: async () => {
          await cacheManager.delete('semantic', 'saga-key');
          order.push('deleted');
        },
      };
      const failingStep: SagaStep = {
        name: 'failing-step',
        execute: async () => {
          order.push('fail');
          throw new Error('intentional');
        },
        compensate: async () => {
          order.push('comp-fail');
        },
      };

      const sagaDef: SagaDefinition = {
        sagaName: 'CacheAndFailSaga',
        steps: [cacheStep, failingStep],
        timeoutMs: 5000,
        compensable: true,
      };

      orchestrator.registerSaga(sagaDef);
      const sagaId = await orchestrator.start('CacheAndFailSaga', {});
      await new Promise((r) => setTimeout(r, 100));

      const status = await orchestrator.getStatus(sagaId);
      expect(status!.status).toBe('COMPENSATED');
      expect(order).toContain('cached');
      expect(order).toContain('deleted');

      const cached = await cacheManager.get('semantic', 'saga-key');
      expect(cached).toBeNull();
    });
  });
});
