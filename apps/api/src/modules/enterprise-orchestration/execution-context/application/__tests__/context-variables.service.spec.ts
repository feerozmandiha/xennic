import { Test, TestingModule } from '@nestjs/testing';
import { ContextVariablesService } from '../context-variables.service.js';
import { InMemoryContextRepository } from '../../testing/adapters/in-memory-context-repository.js';
import type { IContextRepository } from '../../domain/context-repository.interface.js';

describe('ContextVariablesService', () => {
  let service: ContextVariablesService;
  let repository: IContextRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContextVariablesService,
        { provide: 'IContextRepository', useClass: InMemoryContextRepository },
      ],
    }).compile();

    service = module.get(ContextVariablesService);
    repository = module.get('IContextRepository');
  });

  afterEach(async () => {
    for (const execId of ['exec-1', 'exec-2', 'exec-merge', 'exec-snap', 'exec-tpl']) {
      try {
        await repository.deleteContext(execId);
      } catch {
        // ignore
      }
    }
  });

  describe('set', () => {
    it('should create context and set a variable', async () => {
      const result = await service.set('exec-1', 'name', 'Alice', 'user-1');

      expect(result.get('name')).toBe('Alice');
      expect(result.executionId).toBe('exec-1');
    });

    it('should update an existing variable', async () => {
      await service.set('exec-1', 'name', 'Alice', 'user-1');
      const result = await service.set('exec-1', 'name', 'Bob', 'user-1');

      expect(result.get('name')).toBe('Bob');
    });
  });

  describe('get', () => {
    it('should return the value for an existing key', async () => {
      await service.set('exec-1', 'count', 42, 'user-1');
      const value = await service.get('exec-1', 'count');

      expect(value).toBe(42);
    });

    it('should return undefined for a missing key', async () => {
      await service.set('exec-1', 'count', 42, 'user-1');
      const value = await service.get('exec-1', 'missing');

      expect(value).toBeUndefined();
    });

    it('should throw if context does not exist', async () => {
      await expect(service.get('nonexistent', 'key')).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should remove a variable from context', async () => {
      await service.set('exec-1', 'temp', 'value', 'user-1');
      const result = await service.delete('exec-1', 'temp');

      expect(result.has('temp')).toBe(false);
    });

    it('should throw if context does not exist', async () => {
      await expect(service.delete('nonexistent', 'key')).rejects.toThrow();
    });
  });

  describe('merge', () => {
    it('should create context with initial values', async () => {
      const result = await service.merge('exec-merge', { a: 1, b: 2 }, 'user-1');

      expect(result.get('a')).toBe(1);
      expect(result.get('b')).toBe(2);
    });

    it('should merge values into existing context', async () => {
      await service.set('exec-merge', 'x', 'original', 'user-1');
      const result = await service.merge('exec-merge', { x: 'updated', y: 'new' }, 'user-1');

      expect(result.get('x')).toBe('updated');
      expect(result.get('y')).toBe('new');
    });
  });

  describe('snapshot', () => {
    it('should return a frozen copy of all variables', async () => {
      await service.set('exec-snap', 'a', 1, 'user-1');
      await service.set('exec-snap', 'b', { nested: true }, 'user-1');

      const snap = await service.snapshot('exec-snap');

      expect(snap).toEqual({ a: 1, b: { nested: true } });
      expect(Object.isFrozen(snap)).toBe(true);
    });

    it('should not allow mutation of the original context via snapshot', async () => {
      await service.set('exec-snap', 'a', 1, 'user-1');
      const snap = await service.snapshot('exec-snap');

      expect(() => {
        (snap as Record<string, unknown>).a = 2;
      }).toThrow();
    });

    it('should throw if context does not exist', async () => {
      await expect(service.snapshot('nonexistent')).rejects.toThrow();
    });
  });

  describe('resolve', () => {
    it('should replace {{var}} placeholders with context values', async () => {
      await service.set('exec-tpl', 'name', 'Alice', 'user-1');
      await service.set('exec-tpl', 'role', 'admin', 'user-1');

      const result = await service.resolve('exec-tpl', 'Hello {{name}}, you are {{role}}');

      expect(result).toBe('Hello Alice, you are admin');
    });

    it('should leave unresolved placeholders as-is', async () => {
      await service.set('exec-tpl', 'name', 'Alice', 'user-1');

      const result = await service.resolve('exec-tpl', 'Hello {{name}}, {{missing}}');

      expect(result).toBe('Hello Alice, {{missing}}');
    });

    it('should throw if context does not exist', async () => {
      await expect(service.resolve('nonexistent', '{{var}}')).rejects.toThrow();
    });
  });
});
