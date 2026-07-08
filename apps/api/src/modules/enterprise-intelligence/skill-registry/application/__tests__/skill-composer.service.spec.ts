import { Test, TestingModule } from '@nestjs/testing';
import { SkillComposerService } from '../skill-composer.service.js';
import { SkillRegistryService } from '../skill-registry.service.js';
import type { ISkillRegistry } from '../../domain/skill-registry.interface.js';
import { InMemorySkillRegistry } from '../../../testing/adapters/in-memory-skill-registry.js';

describe('SkillComposerService', () => {
  let composer: SkillComposerService;
  let registry: ISkillRegistry;
  let registryService: SkillRegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillComposerService,
        SkillRegistryService,
        { provide: 'ISkillRegistry', useClass: InMemorySkillRegistry },
      ],
    }).compile();

    composer = module.get(SkillComposerService);
    registryService = module.get(SkillRegistryService);
    registry = module.get('ISkillRegistry');
  });

  afterEach(async () => {
    const all = await registry.list();
    for (const item of all.items) {
      await registry.delete(item.id);
    }
  });

  describe('compose', () => {
    it('should create a composition with multiple skills', async () => {
      const skillA = await registryService.register({
        name: 'skill-a',
        description: 'First skill',
        dependencies: [],
        inputs: [{ name: 'x', type: 'number', description: 'Input X', required: true, schema: {} }],
        outputs: [{ name: 'y', type: 'number', description: 'Output Y', required: true, schema: {} }],
        policies: [],
        tags: [],
      });

      const skillB = await registryService.register({
        name: 'skill-b',
        description: 'Second skill',
        dependencies: [],
        inputs: [{ name: 'z', type: 'number', description: 'Input Z', required: true, schema: {} }],
        outputs: [{ name: 'w', type: 'number', description: 'Output W', required: true, schema: {} }],
        policies: [],
        tags: [],
      });

      const composition = await composer.compose(
        [skillA.id, skillB.id],
        [{ x: 'value' }, { z: 'value' }],
        [{ y: 'result' }, { w: 'result' }],
        'test-composition',
      );

      expect(composition.name).toBe('test-composition');
      expect(composition.steps.length).toBe(2);
      expect(composition.steps[0].order).toBe(0);
      expect(composition.steps[1].order).toBe(1);
      expect(composition.id).toBeDefined();
    });

    it('should throw when a skill is not found', async () => {
      await expect(
        composer.compose(
          ['nonexistent-id'],
          [{}],
          [{}],
        ),
      ).rejects.toThrow('Skill nonexistent-id not found');
    });
  });

  describe('decompose', () => {
    it('should return individual skills from a composition', async () => {
      const skillA = await registryService.register({
        name: 'decomp-a',
        description: 'Decompose A',
        dependencies: [],
        inputs: [],
        outputs: [],
        policies: [],
        tags: [],
      });

      const composition = await composer.compose(
        [skillA.id],
        [{}],
        [{}],
        'decomp-test',
      );

      const skills = await composer.decompose(composition.id);
      expect(skills.length).toBe(1);
      expect(skills[0].id).toBe(skillA.id);
    });

    it('should throw for nonexistent composition', async () => {
      await expect(composer.decompose('nonexistent')).rejects.toThrow(
        'Composition nonexistent not found',
      );
    });
  });

  describe('getCompositionGraph', () => {
    it('should return adjacency DAG for composition steps', async () => {
      const skillA = await registryService.register({
        name: 'graph-a',
        description: 'Graph A',
        dependencies: [],
        inputs: [{ name: 'in', type: 'string', description: 'Input', required: true, schema: {} }],
        outputs: [{ name: 'mid', type: 'string', description: 'Intermediate', required: true, schema: {} }],
        policies: [],
        tags: [],
      });

      const skillB = await registryService.register({
        name: 'graph-b',
        description: 'Graph B',
        dependencies: [],
        inputs: [{ name: 'mid', type: 'string', description: 'Mid input', required: true, schema: {} }],
        outputs: [{ name: 'out', type: 'string', description: 'Final output', required: true, schema: {} }],
        policies: [],
        tags: [],
      });

      const composition = await composer.compose(
        [skillA.id, skillB.id],
        [{ in: 'user_input' }, { mid: 'from_a' }],
        [{ mid: 'step1_out' }, { out: 'final' }],
      );

      const graph = composer.getCompositionGraph(composition.id);
      expect(graph.steps.length).toBe(2);
      expect(graph.adjacency.has(skillA.id)).toBe(true);
    });
  });

  describe('validateComposition', () => {
    it('should validate a valid composition with no errors', async () => {
      const skillA = await registryService.register({
        name: 'valid-a',
        description: 'Valid A',
        dependencies: [],
        inputs: [{ name: 'x', type: 'string', description: 'X', required: true, schema: {} }],
        outputs: [{ name: 'y', type: 'string', description: 'Y', required: true, schema: {} }],
        policies: [],
        tags: [],
      });

      const composition = await composer.compose(
        [skillA.id],
        [{ x: 'value' }],
        [{ y: 'out' }],
      );

      const validation = await composer.validateComposition(composition.id);
      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should detect invalid input mapping', async () => {
      const skillA = await registryService.register({
        name: 'invalid-a',
        description: 'Invalid A',
        dependencies: [],
        inputs: [{ name: 'x', type: 'string', description: 'X', required: true, schema: {} }],
        outputs: [{ name: 'y', type: 'string', description: 'Y', required: true, schema: {} }],
        policies: [],
        tags: [],
      });

      const composition = await composer.compose(
        [skillA.id],
        [{ nonexistent_input: 'value' }],
        [{ y: 'out' }],
      );

      const validation = await composer.validateComposition(composition.id);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0].message).toContain('nonexistent_input');
    });

    it('should return error for nonexistent composition', async () => {
      const validation = await composer.validateComposition('no-such');
      expect(validation.valid).toBe(false);
    });
  });
});
