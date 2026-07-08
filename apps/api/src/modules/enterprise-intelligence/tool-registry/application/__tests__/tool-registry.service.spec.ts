import { Test, TestingModule } from '@nestjs/testing';
import { ToolRegistryService } from '../tool-registry.service.js';
import type { IToolRegistry } from '../../domain/tool-registry.interface.js';
import { InMemoryToolRegistry } from '../../../testing/adapters/in-memory-tool-registry.js';
import { ToolStatus, ToolHealth } from '../../domain/tool.entity.js';

describe('ToolRegistryService', () => {
  let service: ToolRegistryService;
  let registry: IToolRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolRegistryService,
        { provide: 'IToolRegistry', useClass: InMemoryToolRegistry },
      ],
    }).compile();

    service = module.get(ToolRegistryService);
    registry = module.get('IToolRegistry');
  });

  afterEach(async () => {
    const all = await registry.list();
    for (const item of all.items) {
      await registry.delete(item.id);
    }
  });

  describe('register', () => {
    it('should register a new tool with version 1', async () => {
      const tool = await service.register(
        'text-analyzer',
        'Analyzes text for sentiment and entities',
        {
          input: {
            type: 'object',
            properties: { text: { type: 'string' } },
            required: ['text'],
          },
          output: {
            type: 'object',
            properties: { sentiment: { type: 'string' } },
          },
        },
        ['read:text'],
      );

      expect(tool.name).toBe('text-analyzer');
      expect(tool.version).toBe(1);
      expect(tool.status).toBe(ToolStatus.ACTIVE);
      expect(tool.health).toBe(ToolHealth.UNKNOWN);
      expect(tool.id).toBeDefined();
    });

    it('should register tools with unique IDs', async () => {
      const t1 = await service.register('tool-a', 'First tool', {}, []);
      const t2 = await service.register('tool-b', 'Second tool', {}, []);
      expect(t1.id).not.toBe(t2.id);
    });
  });

  describe('getByName / versioning', () => {
    it('should return the latest version when no version specified', async () => {
      const v1 = await service.register('my-tool', 'v1', { input: { type: 'object', properties: {} } }, []);
      await service.updateSchema(v1.id, { input: { type: 'object', properties: { x: { type: 'string' } } } });

      const found = await service.getByName('my-tool');
      expect(found).toBeDefined();
      expect(found!.version).toBe(2);
    });

    it('should return specific version when requested', async () => {
      const v1 = await service.register('ver-tool', 'v1', {}, []);
      await service.updateSchema(v1.id, { input: { type: 'object', properties: { y: { type: 'number' } } } });

      const foundV1 = await service.getByName('ver-tool', 1);
      expect(foundV1).toBeDefined();
      expect(foundV1!.version).toBe(1);

      const foundV2 = await service.getByName('ver-tool', 2);
      expect(foundV2).toBeDefined();
      expect(foundV2!.version).toBe(2);
    });

    it('should return null for nonexistent name', async () => {
      const found = await service.getByName('nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByCapability', () => {
    it('should find tools by capability in description', async () => {
      await service.register(
        'nlp-engine',
        'Provides natural language processing capabilities',
        {},
        [],
      );
      await service.register('calc', 'Simple arithmetic calculator', {}, []);

      const results = await service.findByCapability('natural language');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('nlp-engine');
    });

    it('should find tools by capability in schema', async () => {
      await service.register(
        'search-tool',
        'Search index',
        { input: { type: 'object', properties: { query: { type: 'string' } } } },
        [],
      );

      const results = await service.findByCapability('query');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('updateHealth', () => {
    it('should update tool health status', async () => {
      const tool = await service.register('health-check', 'Test health', {}, []);
      expect(tool.health).toBe(ToolHealth.UNKNOWN);

      const updated = await service.updateHealth(tool.id, ToolHealth.DEGRADED);
      expect(updated).toBeDefined();
      expect(updated!.health).toBe(ToolHealth.DEGRADED);
    });

    it('should return null for nonexistent tool', async () => {
      const result = await service.updateHealth('nonexistent-id', ToolHealth.HEALTHY);
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should remove tool from registry', async () => {
      const tool = await service.register('temp-tool', 'Temporary', {}, []);
      await service.delete(tool.id);

      const found = await service.get(tool.id);
      expect(found).toBeNull();
    });
  });

  describe('list with pagination', () => {
    it('should return all tools sorted by creation date', async () => {
      await service.register('first', 'First tool', {}, []);
      await service.register('second', 'Second tool', {}, []);

      const result = await service.list();
      expect(result.items.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should respect offset and limit', async () => {
      for (let i = 0; i < 10; i++) {
        await service.register(`tool-${i}`, `Tool ${i}`, {}, []);
      }

      const page = await service.list({ offset: 2, limit: 3 });
      expect(page.items.length).toBe(3);
      expect(page.total).toBe(10);
      expect(page.offset).toBe(2);
      expect(page.limit).toBe(3);
    });

    it('should return empty list when offset exceeds total', async () => {
      await service.register('only-one', 'Only tool', {}, []);

      const page = await service.list({ offset: 10, limit: 5 });
      expect(page.items.length).toBe(0);
      expect(page.total).toBe(1);
    });
  });

  describe('getStats', () => {
    it('should return correct counts', async () => {
      await service.register('active-tool', 'Active', {}, []);
      const inactive = await service.register('inactive-tool', 'Inactive', {}, []);
      await service.updateHealth(inactive.id, ToolHealth.UNHEALTHY);

      const stats = await service.getStats();
      expect(stats.total).toBe(2);
      expect(stats.active).toBe(2);
      expect(stats.healthy).toBe(0);
      expect(stats.unhealthy).toBe(1);
      expect(stats.degraded).toBe(0);
    });
  });
});
