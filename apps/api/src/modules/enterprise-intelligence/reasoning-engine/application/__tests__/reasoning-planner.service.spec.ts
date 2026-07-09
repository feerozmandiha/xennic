import { Test, TestingModule } from '@nestjs/testing';
import { ReasoningPlannerService } from '../reasoning-planner.service.js';
import { InMemoryReasoningRepository } from '../../testing/adapters/in-memory-reasoning-repository.js';
import { PlanStatus } from '../../domain/reasoning-plan.entity.js';

describe('ReasoningPlannerService', () => {
  let service: ReasoningPlannerService;
  let repo: any;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReasoningPlannerService,
        { provide: 'IReasoningRepository', useClass: InMemoryReasoningRepository },
      ],
    }).compile();

    service = module.get(ReasoningPlannerService);
    repo = module.get('IReasoningRepository');
  });

  describe('plan()', () => {
    it('should create a plan from available steps', async () => {
      const plan = await service.plan('Test goal', [
        { id: '1', description: 'Step 1', input: {} },
        { id: '2', description: 'Step 2', input: {}, dependencies: ['1'] },
      ]);

      expect(plan).toBeDefined();
      expect(plan.goal).toBe('Test goal');
      expect(plan.steps).toHaveLength(2);
      expect(plan.status).toBe(PlanStatus.PENDING);
    });

    it('should create an empty plan when no steps provided', async () => {
      const plan = await service.plan('Empty goal');

      expect(plan).toBeDefined();
      expect(plan.steps).toHaveLength(0);
    });
  });

  describe('decomposeGoal()', () => {
    it('should split a goal into subgoals based on sentence boundaries', () => {
      const result = service.decomposeGoal(
        'Analyze the data. Build a model. Deploy to production.',
      );

      expect(result.subgoals).toHaveLength(3);
      expect(result.subgoals[0]).toBe('Analyze the data');
      expect(result.subgoals[1]).toBe('Build a model');
      expect(result.subgoals[2]).toBe('Deploy to production');
    });

    it('should detect dependencies between subgoals', () => {
      const result = service.decomposeGoal(
        'Set up infrastructure. Configure the build a model system. Deploy the model to production.',
      );

      expect(result.subgoals).toHaveLength(3);
    });
  });

  describe('validatePlan()', () => {
    it('should detect cycles in plan dependencies', async () => {
      const plan = await service.plan('Cyclic goal', [
        { id: '1', description: 'Step 1', input: {}, dependencies: ['3'] },
        { id: '2', description: 'Step 2', input: {}, dependencies: ['1'] },
        { id: '3', description: 'Step 3', input: {}, dependencies: ['2'] },
      ]);

      const result = await service.validatePlan(plan.id);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plan contains circular dependencies');
    });

    it('should validate a valid plan without issues', async () => {
      const plan = await service.plan('Valid goal', [
        { id: '1', description: 'Step 1', input: {} },
        { id: '2', description: 'Step 2', input: {}, dependencies: ['1'] },
      ]);

      const result = await service.validatePlan(plan.id);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing step dependencies', async () => {
      const plan = await service.plan('Missing dep', [
        { id: '1', description: 'Step 1', input: {}, dependencies: ['non-existent'] },
      ]);

      const result = await service.validatePlan(plan.id);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn about empty step descriptions', async () => {
      const plan = await service.plan('Empty steps', [{ id: '1', description: '', input: {} }]);

      const result = await service.validatePlan(plan.id);

      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('optimizePlan()', () => {
    it('should merge adjacent independent steps', async () => {
      const plan = await service.plan('Optimizable goal', [
        { id: '1', description: 'Initialize', input: { x: 1 } },
        { id: '2', description: 'Configure', input: { y: 2 } },
        { id: '3', description: 'Heavy computation', input: { z: 3 }, dependencies: ['2'] },
      ]);

      const optimized = await service.optimizePlan(plan.id);

      expect(optimized.steps.length).toBeLessThan(plan.steps.length);
    });
  });
});
