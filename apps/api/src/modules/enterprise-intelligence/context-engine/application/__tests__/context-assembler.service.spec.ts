import { Test, TestingModule } from '@nestjs/testing';
import { ContextAssemblerService } from '../context-assembler.service.js';
import { ContextCacheService } from '../context-cache.service.js';
import { InMemoryContextStore } from '../../../testing/adapters/in-memory-context-store.js';
import type { IContextRepository } from '../../domain/context-repository.interface.js';
import { ContextEntity } from '../../domain/context.entity.js';

describe('ContextAssemblerService', () => {
  let assembler: ContextAssemblerService;
  let repository: IContextRepository;
  let cache: ContextCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContextAssemblerService,
        ContextCacheService,
        { provide: 'IContextRepository', useClass: InMemoryContextStore },
      ],
    }).compile();

    assembler = module.get(ContextAssemblerService);
    repository = module.get('IContextRepository');
    cache = module.get(ContextCacheService);
  });

  afterEach(() => {
    cache.clear();
  });

  describe('assemble returns snapshot', () => {
    it('should return empty snapshot when no context exists', async () => {
      const snapshot = await assembler.assemble('workspace', 'ws-empty');
      expect(snapshot).toBeDefined();
      expect(snapshot.data).toEqual({});
    });

    it('should create snapshot from stored entities', async () => {
      const entity = ContextEntity.create(
        'workspace',
        'ws-1',
        'user',
        'user-1',
        { name: 'test' },
        'creator',
      );
      await repository.save(entity);

      const snapshot = await assembler.assemble('workspace', 'ws-1');
      expect(snapshot.data).toEqual({ 'user-1': { name: 'test' } });
    });

    it('should merge multiple entities into one snapshot', async () => {
      const e1 = ContextEntity.create(
        'project',
        'proj-1',
        'knowledge',
        'doc-1',
        { title: 'Doc A' },
        'creator',
      );
      const e2 = ContextEntity.create(
        'project',
        'proj-1',
        'engineering',
        'calc-1',
        { voltage: 230 },
        'creator',
      );
      await repository.save(e1);
      await repository.save(e2);

      const snapshot = await assembler.assemble('project', 'proj-1');
      expect(snapshot.data).toEqual({
        'doc-1': { title: 'Doc A' },
        'calc-1': { voltage: 230 },
      });
    });
  });

  describe('source priority ordering', () => {
    it('should return configured priority for a source', () => {
      assembler.configureSource('workspace', 10, 300);
      expect(assembler.getSourcePriority('workspace')).toBe(10);
    });

    it('should return default priority for unconfigured source', () => {
      expect(assembler.getSourcePriority('unknown')).toBe(100);
    });

    it('should allow dynamic configuration of source priority', () => {
      assembler.configureSource('user', 5, 600);
      expect(assembler.getSourcePriority('user')).toBe(5);

      assembler.configureSource('user', 1, 600);
      expect(assembler.getSourcePriority('user')).toBe(1);
    });
  });

  describe('caching behavior', () => {
    it('should cache assembled snapshot', async () => {
      const entity = ContextEntity.create(
        'workspace',
        'ws-cache',
        'test',
        'key-1',
        { data: 1 },
        'creator',
      );
      await repository.save(entity);

      const snapshot1 = await assembler.assemble('workspace', 'ws-cache');
      expect(snapshot1.data).toEqual({ 'key-1': { data: 1 } });

      const cacheKey = 'workspace:ws-cache';
      const cached = cache.get(cacheKey);
      expect(cached).not.toBeNull();
      expect(cached!.version).toBe(snapshot1.version);
    });

    it('should return cached result on repeated assembly', async () => {
      const entity = ContextEntity.create(
        'workspace',
        'ws-cache2',
        'test',
        'key-1',
        { data: 1 },
        'creator',
      );
      await repository.save(entity);

      const snapshot1 = await assembler.assemble('workspace', 'ws-cache2');
      const snapshot2 = await assembler.assemble('workspace', 'ws-cache2');
      expect(snapshot2.version).toBe(snapshot1.version);
    });

    it('should invalidate cache when invalidate is called', async () => {
      const entity = ContextEntity.create(
        'workspace',
        'ws-inv',
        'test',
        'key-1',
        { data: 1 },
        'creator',
      );
      await repository.save(entity);

      await assembler.assemble('workspace', 'ws-inv');
      cache.invalidate('workspace', 'ws-inv');

      const cached = cache.get('workspace:ws-inv');
      expect(cached).toBeNull();
    });
  });
});
