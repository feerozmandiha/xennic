import { Test, TestingModule } from '@nestjs/testing';
import { MemoryService } from '../memory.service.js';
import { MemoryEntity, MemoryType } from '../../domain/memory.entity.js';
import type { IMemoryStore } from '../../domain/memory-store.interface.js';
import { InMemoryMemoryStore } from '../../testing/adapters/in-memory-memory-store.js';
import { InMemoryMemoryIndex } from '../../testing/adapters/in-memory-memory-index.js';

describe('MemoryService', () => {
  let service: MemoryService;
  let store: IMemoryStore;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemoryService,
        { provide: 'IMemoryStore', useClass: InMemoryMemoryStore },
        { provide: 'IMemoryIndex', useClass: InMemoryMemoryIndex },
      ],
    }).compile();

    service = module.get(MemoryService);
    store = module.get('IMemoryStore');
  });

  describe('store()', () => {
    it('should save a memory and index it', async () => {
      const entity = MemoryEntity.create(
        MemoryType.WORKING,
        'workspace',
        'ws-1',
        'test-key',
        { data: 'value' },
        'user-1',
      );

      const result = await service.store(entity);
      expect(result.id).toBe(entity.id);

      const saved = await store.findById(entity.id);
      expect(saved).toBeDefined();
      expect(saved!.id).toBe(entity.id);
    });
  });

  describe('get()', () => {
    it('should retrieve a stored memory', async () => {
      const entity = MemoryEntity.create(
        MemoryType.SESSION,
        'user',
        'u-1',
        'session-data',
        { token: 'abc' },
        'user-1',
      );
      await service.store(entity);

      const found = await service.get(entity.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(entity.id);
      expect(found!.key).toBe('session-data');
    });

    it('should return null for non-existent id', async () => {
      const found = await service.get('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('find()', () => {
    it('should find memories by type and scope', async () => {
      const e1 = MemoryEntity.create(MemoryType.SHORT_TERM, 'workspace', 'ws-1', 'k1', {}, 'u1');
      const e2 = MemoryEntity.create(MemoryType.SHORT_TERM, 'workspace', 'ws-1', 'k2', {}, 'u2');
      const e3 = MemoryEntity.create(MemoryType.LONG_TERM, 'workspace', 'ws-1', 'k3', {}, 'u3');

      await service.store(e1);
      await service.store(e2);
      await service.store(e3);

      const result = await service.find(MemoryType.SHORT_TERM, 'workspace', 'ws-1');
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should return empty for mismatched scope', async () => {
      const entity = MemoryEntity.create(MemoryType.WORKING, 'workspace', 'ws-1', 'k1', {}, 'u1');
      await service.store(entity);

      const result = await service.find(MemoryType.WORKING, 'workspace', 'ws-2');
      expect(result.items).toHaveLength(0);
    });
  });

  describe('search()', () => {
    it('should search across indexed memories when no type filter', async () => {
      const e1 = MemoryEntity.create(
        MemoryType.SEMANTIC,
        'global',
        'g-1',
        'artificial-intelligence',
        { description: 'AI research' },
        'u1',
        ['ai', 'research'],
      );
      const e2 = MemoryEntity.create(
        MemoryType.LONG_TERM,
        'global',
        'g-1',
        'machine-learning',
        { description: 'ML models' },
        'u2',
        ['ml'],
      );

      await service.store(e1);
      await service.store(e2);

      const results = await service.search('intelligence');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some((r) => r.entity.key === 'artificial-intelligence')).toBe(true);
    });

    it('should filter by type when provided', async () => {
      const e1 = MemoryEntity.create(MemoryType.SEMANTIC, 'global', 'g-1', 'ai', {}, 'u1');
      const e2 = MemoryEntity.create(MemoryType.LONG_TERM, 'global', 'g-1', 'ai', {}, 'u2');

      await service.store(e1);
      await service.store(e2);

      const results = await service.search('ai', MemoryType.SEMANTIC);
      expect(results.every((r) => r.entity.type === MemoryType.SEMANTIC)).toBe(true);
    });
  });

  describe('tagSearch()', () => {
    it('should find memories by tags', async () => {
      const e1 = MemoryEntity.create(MemoryType.WORKING, 'workspace', 'ws-1', 'task1', {}, 'u1', [
        'urgent',
        'frontend',
      ]);
      const e2 = MemoryEntity.create(MemoryType.WORKING, 'workspace', 'ws-1', 'task2', {}, 'u2', [
        'backend',
      ]);
      const e3 = MemoryEntity.create(MemoryType.WORKING, 'workspace', 'ws-1', 'task3', {}, 'u3', [
        'urgent',
        'backend',
      ]);

      await service.store(e1);
      await service.store(e2);
      await service.store(e3);

      const result = await service.tagSearch(['urgent']);
      expect(result.total).toBe(2);
    });

    it('should filter by scope when provided', async () => {
      const e1 = MemoryEntity.create(MemoryType.WORKING, 'workspace', 'ws-1', 'task', {}, 'u1', [
        'urgent',
      ]);
      const e2 = MemoryEntity.create(MemoryType.WORKING, 'project', 'proj-1', 'task', {}, 'u2', [
        'urgent',
      ]);

      await service.store(e1);
      await service.store(e2);

      const result = await service.tagSearch(['urgent'], 'workspace', 'ws-1');
      expect(result.total).toBe(1);
    });
  });

  describe('delete()', () => {
    it('should remove memory from store and index', async () => {
      const entity = MemoryEntity.create(
        MemoryType.EPISODIC,
        'user',
        'u-1',
        'event',
        { action: 'login' },
        'u1',
      );
      await service.store(entity);
      expect(await service.get(entity.id)).toBeDefined();

      await service.delete(entity.id);
      expect(await service.get(entity.id)).toBeNull();
    });
  });

  describe('getStats()', () => {
    it('should return statistics including total and byType counts', async () => {
      await service.store(
        MemoryEntity.create(MemoryType.WORKING, 'workspace', 'ws-1', 'k1', {}, 'u1'),
      );
      await service.store(MemoryEntity.create(MemoryType.SESSION, 'user', 'u-1', 'k2', {}, 'u2'));
      await service.store(
        MemoryEntity.create(MemoryType.SHORT_TERM, 'project', 'proj-1', 'k3', {}, 'u3'),
      );

      const stats = await service.getStats();
      expect(stats.total).toBe(3);
      expect(stats.byType[MemoryType.WORKING]).toBe(1);
      expect(stats.byType[MemoryType.SESSION]).toBe(1);
      expect(stats.byType[MemoryType.SHORT_TERM]).toBe(1);
      expect(typeof stats.expired).toBe('number');
    });
  });
});
