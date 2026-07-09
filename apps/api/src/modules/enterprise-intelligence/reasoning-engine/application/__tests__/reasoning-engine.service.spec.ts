import { Test, TestingModule } from '@nestjs/testing';
import { ReasoningEngineService } from '../reasoning-engine.service.js';
import type { IReasoningRepository } from '../../domain/reasoning-repository.interface.js';
import { InMemoryReasoningRepository } from '../../testing/adapters/in-memory-reasoning-repository.js';
import { PlanStatus } from '../../domain/reasoning-plan.entity.js';

describe('ReasoningEngineService', () => {
  let service: ReasoningEngineService;
  let repo: IReasoningRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReasoningEngineService,
        { provide: 'IReasoningRepository', useClass: InMemoryReasoningRepository },
      ],
    }).compile();

    service = module.get(ReasoningEngineService);
    repo = module.get('IReasoningRepository');
  });

  describe('createPlan()', () => {
    it('should create a plan with steps and save it', async () => {
      const plan = await service.createPlan({
        goal: 'Test goal',
        steps: [
          { description: 'Step 1', input: { a: 1 } },
          { description: 'Step 2', input: { b: 2 } },
        ],
      });

      expect(plan.id).toBeDefined();
      expect(plan.goal).toBe('Test goal');
      expect(plan.steps).toHaveLength(2);
      expect(plan.status).toBe(PlanStatus.PENDING);

      const saved = await repo.getPlan(plan.id);
      expect(saved).toBeDefined();
      expect(saved!.id).toBe(plan.id);
    });

    it('should support dependencies between steps', async () => {
      const plan = await service.createPlan({
        goal: 'Goal with deps',
        steps: [
          { description: 'Step A', input: {} },
          { description: 'Step B', input: {} },
        ],
        dependencies: { 2: ['1'] },
      });

      expect(plan.steps[0].dependsOn).toHaveLength(0);
    });
  });

  describe('executePlan()', () => {
    it('should execute all steps sequentially when there are dependencies', async () => {
      const plan = await service.createPlan({
        goal: 'Sequential goal',
        steps: [
          { description: 'Step 1', input: {} },
          { description: 'Step 2', input: {} },
          { description: 'Step 3', input: {} },
        ],
        dependencies: { 2: ['1'], 3: ['2'] },
      });

      const result = await service.executePlan(plan.id);

      expect(result.status).toBe(PlanStatus.COMPLETED);
      for (const step of result.steps) {
        expect(step.status).toBe('completed');
      }
    });

    it('should execute steps in parallel when no dependencies', async () => {
      const plan = await service.createPlan({
        goal: 'Parallel goal',
        steps: [
          { description: 'Step A', input: {} },
          { description: 'Step B', input: {} },
          { description: 'Step C', input: {} },
        ],
      });

      const result = await service.executePlan(plan.id);

      expect(result.status).toBe(PlanStatus.COMPLETED);
      expect(result.steps).toHaveLength(3);
    });

    it('should throw for non-existent plan', async () => {
      await expect(service.executePlan('non-existent')).rejects.toThrow();
    });
  });

  describe('cancelPlan()', () => {
    it('should cancel a pending plan', async () => {
      const plan = await service.createPlan({
        goal: 'Plan to cancel',
        steps: [{ description: 'Step 1', input: {} }],
      });

      const cancelled = await service.cancelPlan(plan.id);

      expect(cancelled.status).toBe(PlanStatus.CANCELLED);

      const status = await service.getPlanStatus(plan.id);
      expect(status.status).toBe(PlanStatus.CANCELLED);
    });

    it('should throw for non-existent plan', async () => {
      await expect(service.cancelPlan('non-existent')).rejects.toThrow();
    });
  });

  describe('getPlanStatus()', () => {
    it('should return correct status and progress', async () => {
      const plan = await service.createPlan({
        goal: 'Status check',
        steps: [
          { description: 'Step 1', input: {} },
          { description: 'Step 2', input: {} },
        ],
      });

      const status = await service.getPlanStatus(plan.id);
      expect(status.id).toBe(plan.id);
      expect(status.status).toBe(PlanStatus.PENDING);
      expect(status.progress).toBe(0);
      expect(status.totalSteps).toBe(2);

      await service.executePlan(plan.id);

      const after = await service.getPlanStatus(plan.id);
      expect(after.status).toBe(PlanStatus.COMPLETED);
      expect(after.progress).toBe(1);
      expect(after.completedSteps).toBe(2);
    });
  });
});
