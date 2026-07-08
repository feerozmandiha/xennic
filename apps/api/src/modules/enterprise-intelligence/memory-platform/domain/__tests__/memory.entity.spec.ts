import { MemoryEntity, MemoryType } from '../memory.entity.js';

describe('MemoryEntity', () => {
  describe('create()', () => {
    it('should create a new entity with version 1', () => {
      const entity = MemoryEntity.create(
        MemoryType.WORKING,
        'workspace',
        'ws-1',
        'current-user',
        { role: 'admin' },
        'creator',
      );

      expect(entity.type).toBe(MemoryType.WORKING);
      expect(entity.scope).toBe('workspace');
      expect(entity.scopeId).toBe('ws-1');
      expect(entity.key).toBe('current-user');
      expect(entity.value).toEqual({ role: 'admin' });
      expect(entity.tags).toEqual([]);
      expect(entity.embedding).toBeNull();
      expect(entity.version).toBe(1);
      expect(entity.expiresAt).toBeNull();
      expect(entity.metadata.createdBy).toBe('creator');
      expect(entity.id).toBeDefined();
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate a unique UUID for each entity', () => {
      const e1 = MemoryEntity.create(MemoryType.SESSION, 'user', 'u-1', 'k1', { a: 1 }, 'u1');
      const e2 = MemoryEntity.create(MemoryType.SESSION, 'user', 'u-1', 'k2', { b: 2 }, 'u2');
      expect(e1.id).not.toBe(e2.id);
    });

    it('should preserve all memory types', () => {
      const types = [
        MemoryType.WORKING,
        MemoryType.SESSION,
        MemoryType.SHORT_TERM,
        MemoryType.LONG_TERM,
        MemoryType.SEMANTIC,
        MemoryType.EPISODIC,
        MemoryType.PROCEDURAL,
      ];
      for (const t of types) {
        const entity = MemoryEntity.create(t, 'global', 'g-1', 'test', {}, 'system');
        expect(entity.type).toBe(t);
      }
    });

    it('should set expiration when provided', () => {
      const expiresAt = new Date(Date.now() + 3600000);
      const entity = MemoryEntity.create(
        MemoryType.SHORT_TERM,
        'workspace',
        'ws-1',
        'temp',
        {},
        'creator',
        [],
        null,
        expiresAt,
      );
      expect(entity.expiresAt).toEqual(expiresAt);
    });

    it('should preserve tags', () => {
      const tags = ['important', 'urgent', 'temp'];
      const entity = MemoryEntity.create(
        MemoryType.LONG_TERM,
        'project',
        'proj-1',
        'data',
        { x: 1 },
        'creator',
        tags,
      );
      expect(entity.tags).toEqual(tags);
    });

    it('should preserve embedding', () => {
      const embedding = [0.1, 0.2, 0.3];
      const entity = MemoryEntity.create(
        MemoryType.SEMANTIC,
        'global',
        'g-1',
        'vec',
        {},
        'creator',
        [],
        embedding,
      );
      expect(entity.embedding).toEqual(embedding);
    });

    it('should preserve falsy values in value', () => {
      const entity = MemoryEntity.create(
        MemoryType.WORKING,
        'global',
        'g-1',
        'flags',
        { enabled: false, count: 0, name: '' },
        'tester',
      );
      expect(entity.value.enabled).toBe(false);
      expect(entity.value.count).toBe(0);
      expect(entity.value.name).toBe('');
    });
  });

  describe('reconstitute()', () => {
    it('should recreate entity with exact properties', () => {
      const date = new Date('2024-01-01');
      const metadata = {
        createdAt: date,
        updatedAt: date,
        createdBy: 'creator',
        updatedBy: null,
      };
      const entity = MemoryEntity.reconstitute(
        'fixed-id',
        MemoryType.PROCEDURAL,
        'project',
        'proj-1',
        'workflow',
        { steps: 5 },
        ['auto'],
        [0.5, 0.7],
        3,
        metadata,
        new Date('2024-02-01'),
        date,
        date,
      );

      expect(entity.id).toBe('fixed-id');
      expect(entity.type).toBe(MemoryType.PROCEDURAL);
      expect(entity.scope).toBe('project');
      expect(entity.scopeId).toBe('proj-1');
      expect(entity.key).toBe('workflow');
      expect(entity.value).toEqual({ steps: 5 });
      expect(entity.tags).toEqual(['auto']);
      expect(entity.embedding).toEqual([0.5, 0.7]);
      expect(entity.version).toBe(3);
      expect(entity.metadata).toEqual(metadata);
      expect(entity.createdAt).toBe(date);
      expect(entity.updatedAt).toBe(date);
    });

    it('should allow reconstitution with version 0', () => {
      const entity = MemoryEntity.reconstitute(
        'id-0',
        MemoryType.SESSION,
        'global',
        'g-1',
        'key-0',
        {},
        [],
        null,
        0,
        { createdAt: new Date(), updatedAt: new Date(), createdBy: 'system', updatedBy: null },
        null,
        new Date(),
        new Date(),
      );
      expect(entity.version).toBe(0);
      expect(entity.expiresAt).toBeNull();
    });
  });
});
