import { ContextEntity } from '../context.entity.js';

describe('ContextEntity', () => {
  describe('create()', () => {
    it('should create a new entity with version 1', () => {
      const entity = ContextEntity.create(
        'workspace',
        'ws-1',
        'user',
        'current-user',
        { role: 'admin' },
        'creator',
      );

      expect(entity.scope).toBe('workspace');
      expect(entity.scopeId).toBe('ws-1');
      expect(entity.source).toBe('user');
      expect(entity.key).toBe('current-user');
      expect(entity.value).toEqual({ role: 'admin' });
      expect(entity.version).toBe(1);
      expect(entity.createdBy).toBe('creator');
      expect(entity.id).toBeDefined();
      expect(entity.createdAt).toBeInstanceOf(Date);
    });

    it('should generate a unique UUID for each entity', () => {
      const e1 = ContextEntity.create('workspace', 'ws-1', 'user', 'k1', { a: 1 }, 'u1');
      const e2 = ContextEntity.create('workspace', 'ws-1', 'user', 'k2', { b: 2 }, 'u2');
      expect(e1.id).not.toBe(e2.id);
    });

    it('should preserve falsy values in value', () => {
      const entity = ContextEntity.create(
        'global',
        'g-1',
        'test',
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
      const entity = ContextEntity.reconstitute(
        'fixed-id',
        'project',
        'proj-1',
        'engineering',
        'calc-1',
        { voltage: 230 },
        5,
        date,
        'creator',
      );

      expect(entity.id).toBe('fixed-id');
      expect(entity.scope).toBe('project');
      expect(entity.scopeId).toBe('proj-1');
      expect(entity.source).toBe('engineering');
      expect(entity.key).toBe('calc-1');
      expect(entity.value).toEqual({ voltage: 230 });
      expect(entity.version).toBe(5);
      expect(entity.createdAt).toBe(date);
      expect(entity.createdBy).toBe('creator');
    });

    it('should allow reconstitution with version 0', () => {
      const entity = ContextEntity.reconstitute(
        'id-0',
        'global',
        'g-1',
        'test',
        'key-0',
        {},
        0,
        new Date(),
        'system',
      );
      expect(entity.version).toBe(0);
    });
  });

  describe('equality by id', () => {
    it('should treat entities with same id as same identity', () => {
      const date = new Date();
      const e1 = ContextEntity.reconstitute(
        'same-id',
        'workspace',
        'ws-1',
        'user',
        'k',
        {},
        1,
        date,
        'u',
      );
      const e2 = ContextEntity.reconstitute(
        'same-id',
        'workspace',
        'ws-1',
        'user',
        'k',
        {},
        1,
        date,
        'u',
      );
      expect(e1.id).toBe(e2.id);
    });

    it('should treat entities with different ids as different', () => {
      const e1 = ContextEntity.create('workspace', 'ws-1', 'user', 'k', {}, 'u');
      const e2 = ContextEntity.create('workspace', 'ws-1', 'user', 'k', {}, 'u');
      expect(e1.id).not.toBe(e2.id);
    });
  });
});
