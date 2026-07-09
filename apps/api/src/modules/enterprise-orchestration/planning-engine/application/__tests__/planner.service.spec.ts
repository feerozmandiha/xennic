import { Test, TestingModule } from '@nestjs/testing';
import { PlannerService } from '../planner.service.js';
import { InMemoryPlannerRepository } from '../../testing/adapters/in-memory-planner-repository.js';
import type { IPlannerRepository } from '../../domain/planner-repository.interface.js';
import type { PlanTask, Dependency } from '../../domain/plan.entity.js';

describe('PlannerService', () => {
  let service: PlannerService;
  let repository: IPlannerRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlannerService,
        { provide: 'IPlannerRepository', useClass: InMemoryPlannerRepository },
      ],
    }).compile();

    service = module.get(PlannerService);
    repository = module.get('IPlannerRepository');
  });

  afterEach(async () => {
    const result = await repository.listPlans();
    for (const plan of result.items) {
      await repository.deletePlan(plan.id);
    }
  });

  describe('createPlan', () => {
    it('should create a plan with tasks and dependencies', async () => {
      const tasks: PlanTask[] = [
        { id: 't1', description: 'Research', type: 'analysis', status: 'pending', dependsOn: [] },
        {
          id: 't2',
          description: 'Implement',
          type: 'development',
          status: 'pending',
          dependsOn: ['t1'],
        },
        { id: 't3', description: 'Test', type: 'qa', status: 'pending', dependsOn: ['t2'] },
      ];
      const deps: Dependency[] = [
        { from: 't1', to: 't2', type: 'hard' },
        { from: 't2', to: 't3', type: 'hard' },
      ];

      const result = await service.createPlan({
        goal: 'Implement feature X',
        tasks,
        dependencies: deps,
        createdBy: 'user-1',
      });

      expect(result.plan.id).toBeDefined();
      expect(result.plan.goal).toBe('Implement feature X');
      expect(result.plan.tasks).toHaveLength(3);
      expect(result.plan.status).toBe('pending');
      expect(result.graph.nodes).toHaveLength(3);
      expect(result.graph.edges).toHaveLength(2);
    });

    it('should create a plan without explicit dependencies', async () => {
      const tasks: PlanTask[] = [
        { id: 't1', description: 'Task A', type: 'task', status: 'pending', dependsOn: [] },
        { id: 't2', description: 'Task B', type: 'task', status: 'pending', dependsOn: [] },
      ];

      const result = await service.createPlan({
        goal: 'Simple goal',
        tasks,
        createdBy: 'user-1',
      });

      expect(result.plan.tasks).toHaveLength(2);
      expect(result.graph.edges).toHaveLength(0);
    });
  });

  describe('getExecutionOrder', () => {
    it('should return topological execution order', async () => {
      const tasks: PlanTask[] = [
        { id: 't1', description: 'Setup', type: 'task', status: 'pending', dependsOn: [] },
        { id: 't2', description: 'Build', type: 'task', status: 'pending', dependsOn: ['t1'] },
        { id: 't3', description: 'Deploy', type: 'task', status: 'pending', dependsOn: ['t2'] },
        { id: 't4', description: 'Monitor', type: 'task', status: 'pending', dependsOn: ['t2'] },
      ];
      const deps: Dependency[] = [
        { from: 't1', to: 't2', type: 'hard' },
        { from: 't2', to: 't3', type: 'hard' },
        { from: 't2', to: 't4', type: 'hard' },
      ];

      const { plan } = await service.createPlan({
        goal: 'Release pipeline',
        tasks,
        dependencies: deps,
        createdBy: 'user-1',
      });

      const order = await service.getExecutionOrder(plan.id);

      expect(order.indexOf('t1')).toBeLessThan(order.indexOf('t2'));
      expect(order.indexOf('t2')).toBeLessThan(order.indexOf('t3'));
      expect(order.indexOf('t2')).toBeLessThan(order.indexOf('t4'));
    });
  });

  describe('getCriticalPath', () => {
    it('should return critical path of hard dependencies', async () => {
      const tasks: PlanTask[] = [
        { id: 't1', description: 'A', type: 'task', status: 'pending', dependsOn: [] },
        { id: 't2', description: 'B', type: 'task', status: 'pending', dependsOn: ['t1'] },
        { id: 't3', description: 'C', type: 'task', status: 'pending', dependsOn: ['t1'] },
        { id: 't4', description: 'D', type: 'task', status: 'pending', dependsOn: ['t2'] },
      ];
      const deps: Dependency[] = [
        { from: 't1', to: 't2', type: 'hard' },
        { from: 't1', to: 't3', type: 'soft' },
        { from: 't2', to: 't4', type: 'hard' },
      ];

      const { plan } = await service.createPlan({
        goal: 'Critical path test',
        tasks,
        dependencies: deps,
        createdBy: 'user-1',
      });

      const criticalPath = await service.getCriticalPath(plan.id);
      expect(criticalPath).toEqual(['t1', 't2', 't4']);
    });
  });

  describe('getReadyTasks', () => {
    it('should return only tasks with all deps met', async () => {
      const tasks: PlanTask[] = [
        { id: 't1', description: 'First', type: 'task', status: 'pending', dependsOn: [] },
        { id: 't2', description: 'Second', type: 'task', status: 'pending', dependsOn: ['t1'] },
        { id: 't3', description: 'Third', type: 'task', status: 'pending', dependsOn: ['t2'] },
      ];
      const deps: Dependency[] = [
        { from: 't1', to: 't2', type: 'hard' },
        { from: 't2', to: 't3', type: 'hard' },
      ];

      const { plan } = await service.createPlan({
        goal: 'Sequential',
        tasks,
        dependencies: deps,
        createdBy: 'user-1',
      });

      const ready0 = await service.getReadyTasks(plan.id, []);
      expect(ready0.map((t) => t.id)).toEqual(['t1']);

      const ready1 = await service.getReadyTasks(plan.id, ['t1']);
      expect(ready1.map((t) => t.id)).toEqual(['t2']);

      const ready2 = await service.getReadyTasks(plan.id, ['t1', 't2']);
      expect(ready2.map((t) => t.id)).toEqual(['t3']);
    });
  });

  describe('analyzeProgress', () => {
    it('should return correct progress metrics for a fresh plan', async () => {
      const tasks: PlanTask[] = [
        { id: 't1', description: 'Task 1', type: 'task', status: 'pending', dependsOn: [] },
        { id: 't2', description: 'Task 2', type: 'task', status: 'pending', dependsOn: ['t1'] },
      ];
      const deps: Dependency[] = [{ from: 't1', to: 't2', type: 'hard' }];

      const { plan } = await service.createPlan({
        goal: 'Progress test',
        tasks,
        dependencies: deps,
        createdBy: 'user-1',
      });

      const progress = await service.analyzeProgress(plan.id);
      expect(progress.completed).toBe(0);
      expect(progress.remaining).toBe(2);
      expect(progress.blocked).toBe(0);
    });

    it('should detect blocked tasks when intermediate tasks fail', async () => {
      const tasks: PlanTask[] = [
        { id: 't1', description: 'Setup', type: 'task', status: 'completed', dependsOn: [] },
        { id: 't2', description: 'Build', type: 'task', status: 'failed', dependsOn: ['t1'] },
        { id: 't3', description: 'Deploy', type: 'task', status: 'pending', dependsOn: ['t2'] },
      ];
      const deps: Dependency[] = [
        { from: 't1', to: 't2', type: 'hard' },
        { from: 't2', to: 't3', type: 'hard' },
      ];

      const { plan } = await service.createPlan({
        goal: 'Pipeline with failure',
        tasks,
        dependencies: deps,
        createdBy: 'user-1',
      });

      const progress = await service.analyzeProgress(plan.id);
      expect(progress.completed).toBe(1);
      expect(progress.remaining).toBe(1);
    });
  });
});
