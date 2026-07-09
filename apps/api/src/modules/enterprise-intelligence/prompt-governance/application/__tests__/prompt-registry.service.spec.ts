import { Test, TestingModule } from '@nestjs/testing';
import { PromptRegistryService } from '../prompt-registry.service.js';
import { PromptStatus } from '../../domain/prompt.entity.js';
import { InMemoryPromptRegistry } from '../../testing/adapters/in-memory-prompt-registry.js';

describe('PromptRegistryService', () => {
  let service: PromptRegistryService;
  let registry: any;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromptRegistryService,
        { provide: 'IPromptRegistry', useClass: InMemoryPromptRegistry },
      ],
    }).compile();

    service = module.get(PromptRegistryService);
    registry = module.get('IPromptRegistry');
  });

  describe('register()', () => {
    it('should register a new prompt', async () => {
      const prompt = await service.register(
        'test-prompt',
        'Hello {{name}}',
        ['name'],
        ['test'],
        'user-1',
        'A test prompt',
      );

      expect(prompt).toBeDefined();
      expect(prompt.name).toBe('test-prompt');
      expect(prompt.version).toBe(1);
      expect(prompt.status).toBe(PromptStatus.DRAFT);
      expect(prompt.content).toBe('Hello {{name}}');
      expect(prompt.variables).toEqual(['name']);
    });

    it('should throw if prompt name already exists', async () => {
      await service.register('dup', 'content', [], [], 'u1');
      await expect(service.register('dup', 'other', [], [], 'u1')).rejects.toThrow(
        'already exists',
      );
    });
  });

  describe('get()', () => {
    it('should retrieve a prompt by id', async () => {
      const created = await service.register('get-test', 'content', [], [], 'u1');
      const found = await service.get(created.id);
      expect(found.id).toBe(created.id);
    });

    it('should throw for non-existent id', async () => {
      await expect(service.get('non-existent')).rejects.toThrow('not found');
    });
  });

  describe('getByName()', () => {
    it('should retrieve the latest version by default', async () => {
      const v1 = await service.register('multi-version', 'v1', [], [], 'u1');
      await service.createVersion(v1.id, 'v2', 'u2');

      const found = await service.getByName('multi-version');

      expect(found).not.toBeNull();
      expect(found!.version).toBe(2);
    });

    it('should retrieve a specific version', async () => {
      await service.register('specific-ver', 'v1', [], [], 'u1');

      const found = await service.getByName('specific-ver', 1);
      expect(found!.version).toBe(1);
    });

    it('should return null for unknown name', async () => {
      const found = await service.getByName('unknown');
      expect(found).toBeNull();
    });
  });

  describe('createVersion()', () => {
    it('should increment version', async () => {
      const v1 = await service.register('versioning', 'v1', ['x'], [], 'u1');
      const v2 = await service.createVersion(v1.id, 'v2 with {{x}}', 'u2');

      expect(v2.version).toBe(2);
      expect(v2.content).toBe('v2 with {{x}}');
      expect(v2.status).toBe(PromptStatus.DRAFT);
      expect(v2.metadata.updatedBy).toBe('u2');
    });

    it('should throw for non-existent id', async () => {
      await expect(service.createVersion('bad-id', 'content', 'u1')).rejects.toThrow('not found');
    });
  });

  describe('list()', () => {
    it('should list all prompts', async () => {
      await service.register('a', 'a', [], [], 'u1');
      await service.register('b', 'b', [], [], 'u1');
      await service.register('c', 'c', [], [], 'u1');

      const result = await service.list();
      expect(result.total).toBe(3);
    });

    it('should filter by status', async () => {
      const p1 = await service.register('active-one', 'content', [], [], 'u1');
      await service.activate(p1.id, 'u1');

      const active = await service.list({ status: PromptStatus.ACTIVE });
      expect(active.items[0].name).toBe('active-one');
    });
  });

  describe('archive() / activate()', () => {
    it('should archive a prompt', async () => {
      const prompt = await service.register('to-archive', 'content', [], [], 'u1');
      const archived = await service.archive(prompt.id, 'u1');
      expect(archived.status).toBe(PromptStatus.ARCHIVED);
    });

    it('should activate a prompt', async () => {
      const prompt = await service.register('to-activate', 'content', [], [], 'u1');
      const archived = await service.archive(prompt.id, 'u1');
      expect(archived.status).toBe(PromptStatus.ARCHIVED);

      const activated = await service.activate(prompt.id, 'u2');
      expect(activated.status).toBe(PromptStatus.ACTIVE);
      expect(activated.metadata.updatedBy).toBe('u2');
    });
  });

  describe('search()', () => {
    it('should find prompts matching query in name', async () => {
      await service.register('find-me', 'content', [], ['tag1'], 'u1');
      await service.register('other', 'content', [], ['tag2'], 'u1');

      const result = await service.search('find');
      expect(result.total).toBeGreaterThanOrEqual(1);
    });

    it('should find prompts matching query in tags', async () => {
      await service.register('tagged', 'content', [], ['special-tag'], 'u1');

      const result = await service.search('special');
      expect(result.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('delete()', () => {
    it('should delete a prompt', async () => {
      const prompt = await service.register('to-delete', 'content', [], [], 'u1');
      await service.delete(prompt.id);
      await expect(service.get(prompt.id)).rejects.toThrow('not found');
    });
  });
});
