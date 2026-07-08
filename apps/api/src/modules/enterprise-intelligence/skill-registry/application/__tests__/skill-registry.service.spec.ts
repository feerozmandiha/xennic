import { Test, TestingModule } from '@nestjs/testing';
import { SkillRegistryService } from '../skill-registry.service.js';
import type { ISkillRegistry } from '../../domain/skill-registry.interface.js';
import { InMemorySkillRegistry } from '../../../testing/adapters/in-memory-skill-registry.js';
import { SkillStatus } from '../../domain/skill.entity.js';

describe('SkillRegistryService', () => {
  let service: SkillRegistryService;
  let registry: ISkillRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillRegistryService,
        { provide: 'ISkillRegistry', useClass: InMemorySkillRegistry },
      ],
    }).compile();

    service = module.get(SkillRegistryService);
    registry = module.get('ISkillRegistry');
  });

  afterEach(async () => {
    const all = await registry.list();
    for (const item of all.items) {
      await registry.delete(item.id);
    }
  });

  function makeSkill(name: string, tags: string[] = []) {
    return service.register({
      name,
      description: `Description for ${name}`,
      dependencies: [],
      inputs: [{ name: 'input1', type: 'string', description: 'Input', required: true, schema: {} }],
      outputs: [{ name: 'output1', type: 'string', description: 'Output', required: true, schema: {} }],
      policies: [],
      tags,
    });
  }

  describe('register', () => {
    it('should register a new skill with version 1 and draft status', async () => {
      const skill = await service.register({
        name: 'text-summarizer',
        description: 'Summarizes text content',
        dependencies: [],
        inputs: [{ name: 'text', type: 'string', description: 'Input text', required: true, schema: {} }],
        outputs: [{ name: 'summary', type: 'string', description: 'Summary text', required: true, schema: {} }],
        policies: ['read:text'],
        tags: ['nlp', 'summarization'],
      });

      expect(skill.name).toBe('text-summarizer');
      expect(skill.version).toBe(1);
      expect(skill.status).toBe(SkillStatus.DRAFT);
      expect(skill.id).toBeDefined();
      expect(skill.tags).toEqual(['nlp', 'summarization']);
    });

    it('should register skills with unique IDs', async () => {
      const s1 = await makeSkill('skill-a');
      const s2 = await makeSkill('skill-b');
      expect(s1.id).not.toBe(s2.id);
    });
  });

  describe('getByName / versioning', () => {
    it('should return the latest version when no version specified', async () => {
      const v1 = await makeSkill('my-skill');
      await service.createVersion(v1.id);

      const found = await service.getByName('my-skill');
      expect(found).toBeDefined();
      expect(found!.version).toBe(2);
    });

    it('should return specific version when requested', async () => {
      const v1 = await makeSkill('ver-skill');
      await service.createVersion(v1.id);

      const foundV1 = await service.getByName('ver-skill', 1);
      expect(foundV1).toBeDefined();
      expect(foundV1!.version).toBe(1);

      const foundV2 = await service.getByName('ver-skill', 2);
      expect(foundV2).toBeDefined();
      expect(foundV2!.version).toBe(2);
    });

    it('should return null for nonexistent name', async () => {
      const found = await service.getByName('nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByTag', () => {
    it('should find skills by tag', async () => {
      await makeSkill('nlp-engine', ['nlp', 'text']);
      await makeSkill('calc', ['math']);

      const results = await service.findByTag('nlp');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('nlp-engine');
    });

    it('should return empty array when no skills match tag', async () => {
      await makeSkill('generic', ['default']);
      const results = await service.findByTag('nonexistent');
      expect(results.length).toBe(0);
    });
  });

  describe('findCapable', () => {
    it('should find skills matching given inputs and outputs', async () => {
      await service.register({
        name: 'translator',
        description: 'Translates text',
        dependencies: [],
        inputs: [{ name: 'text', type: 'string', description: 'Text to translate', required: true, schema: {} }],
        outputs: [{ name: 'translation', type: 'string', description: 'Translated text', required: true, schema: {} }],
        policies: [],
        tags: [],
      });

      const results = await service.findCapable(['text'], ['translation']);
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('translator');
    });

    it('should return empty when no skill matches outputs', async () => {
      await makeSkill('basic');
      const results = await service.findCapable(['input1'], ['nonexistent-output']);
      expect(results.length).toBe(0);
    });
  });

  describe('dependency resolution', () => {
    it('should resolve transitive dependencies', async () => {
      const dep3 = await makeSkill('dep-3');
      const dep2 = await service.register({
        name: 'dep-2',
        description: 'Middle dependency',
        dependencies: [{ skillId: dep3.id, optional: false }],
        inputs: [],
        outputs: [],
        policies: [],
        tags: [],
      });
      const dep1 = await service.register({
        name: 'dep-1',
        description: 'Top dependency',
        dependencies: [{ skillId: dep2.id, optional: false }],
        inputs: [],
        outputs: [],
        policies: [],
        tags: [],
      });

      const result = await service.resolveDependencies(dep1.id);
      expect(result.resolved.length).toBeGreaterThanOrEqual(3);
      expect(result.circular.length).toBe(0);
    });

    it('should detect circular dependencies', async () => {
      const a = await makeSkill('circ-a');
      const b = await service.register({
        name: 'circ-b',
        description: 'Circular B',
        dependencies: [{ skillId: a.id, optional: false }],
        inputs: [],
        outputs: [],
        policies: [],
        tags: [],
      });
      await service.update(a.id, {
        dependencies: [{ skillId: b.id, optional: false }],
      } as any);

      const result = await service.resolveDependencies(a.id);
      expect(result.circular.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('createVersion / deprecate', () => {
    it('should increment version on createVersion', async () => {
      const skill = await makeSkill('versioned');
      const updated = await service.createVersion(skill.id);
      expect(updated).toBeDefined();
      expect(updated!.version).toBe(2);
    });

    it('should deprecate skill', async () => {
      const skill = await makeSkill('to-deprecate');
      const deprecated = await service.deprecate(skill.id);
      expect(deprecated).toBeDefined();
      expect(deprecated!.status).toBe(SkillStatus.DEPRECATED);
    });
  });

  describe('delete', () => {
    it('should remove skill from registry', async () => {
      const skill = await makeSkill('temp');
      await service.delete(skill.id);

      const found = await service.get(skill.id);
      expect(found).toBeNull();
    });
  });

  describe('list with pagination', () => {
    it('should return all skills sorted by creation date', async () => {
      await makeSkill('first');
      await makeSkill('second');

      const result = await service.list();
      expect(result.items.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should respect offset and limit', async () => {
      for (let i = 0; i < 10; i++) {
        await makeSkill(`skill-${i}`);
      }

      const page = await service.list({ offset: 2, limit: 3 });
      expect(page.items.length).toBe(3);
      expect(page.total).toBe(10);
      expect(page.offset).toBe(2);
      expect(page.limit).toBe(3);
    });
  });
});
