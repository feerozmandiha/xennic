import { Test, TestingModule } from '@nestjs/testing';
import { CoordinatorService } from '../coordinator.service.js';
import { InMemoryCoordinationRepository } from '../../testing/adapters/in-memory-coordination-repository.js';
import { CoordinationPlan } from '../../domain/coordination-plan.entity.js';
import type { ICoordinationRepository } from '../../domain/coordination-repository.interface.js';
import type { Metadata } from '../../../shared/types/index.js';
import { AgentRole } from '../../domain/agent-role.enum.js';
import { NotFoundException } from '@nestjs/common';

const testMetadata: Metadata = {
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'test-user',
  updatedBy: null,
};

describe('CoordinatorService', () => {
  let service: CoordinatorService;
  let repository: ICoordinationRepository;
  let testPlan: CoordinationPlan;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoordinatorService,
        { provide: 'ICoordinationRepository', useClass: InMemoryCoordinationRepository },
      ],
    }).compile();

    service = module.get(CoordinatorService);
    repository = module.get('ICoordinationRepository');

    testPlan = CoordinationPlan.create({
      workflowExecutionId: 'exec-1',
      goal: 'Test coordination',
      metadata: testMetadata,
    });
    await repository.savePlan(testPlan);
  });

  describe('assignTask', () => {
    it('should assign a task to an agent', async () => {
      const plan = await service.assignTask(
        testPlan.id,
        'Perform analysis',
        'agent-1',
        AgentRole.WORKER,
        { type: 'analysis' },
      );

      expect(plan.tasks).toHaveLength(1);
      expect(plan.tasks[0].assignedTo).toBe('agent-1');
      expect(plan.tasks[0].role).toBe(AgentRole.WORKER);
      expect(plan.tasks[0].description).toBe('Perform analysis');
      expect(plan.tasks[0].status).toBe('pending');
    });

    it('should assign multiple tasks with dependencies', async () => {
      await service.assignTask(testPlan.id, 'Task A', 'agent-1', AgentRole.WORKER, {}, []);
      await service.assignTask(testPlan.id, 'Task B', 'agent-2', AgentRole.WORKER, {}, ['task-0']);

      const plan = await repository.getPlan(testPlan.id);
      expect(plan?.tasks).toHaveLength(2);
    });

    it('should throw when plan does not exist', async () => {
      await expect(
        service.assignTask('nonexistent', 'Task', 'agent-1', AgentRole.WORKER),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('distribute', () => {
    it('should distribute pending tasks whose dependencies are met', async () => {
      await service.assignTask(testPlan.id, 'Independent', 'agent-1', AgentRole.WORKER, {}, []);

      const assigned = await service.distribute(testPlan.id);

      expect(assigned).toHaveLength(1);
      expect(assigned[0].status).toBe('running');
    });

    it('should not distribute tasks with unmet dependencies', async () => {
      await service.assignTask(testPlan.id, 'Dep task', 'agent-1', AgentRole.WORKER, {}, ['dep-1']);

      const assigned = await service.distribute(testPlan.id);

      expect(assigned).toHaveLength(0);
    });

    it('should not distribute already running or completed tasks', async () => {
      await service.assignTask(testPlan.id, 'Task A', 'agent-1', AgentRole.WORKER, {}, []);
      await service.distribute(testPlan.id);

      const assigned = await service.distribute(testPlan.id);
      expect(assigned).toHaveLength(0);
    });
  });

  describe('getWorkload', () => {
    it('should return workload for an agent', async () => {
      await service.assignTask(testPlan.id, 'Task 1', 'agent-1', AgentRole.WORKER, {}, []);
      await service.assignTask(testPlan.id, 'Task 2', 'agent-1', AgentRole.WORKER, {}, []);

      const workload = await service.getWorkload('agent-1');

      expect(workload.agentId).toBe('agent-1');
      expect(workload.count).toBe(2);
      expect(workload.currentTasks).toHaveLength(2);
    });

    it('should return empty workload for idle agent', async () => {
      const workload = await service.getWorkload('idle-agent');

      expect(workload.agentId).toBe('idle-agent');
      expect(workload.count).toBe(0);
      expect(workload.currentTasks).toHaveLength(0);
    });
  });

  describe('rebalance', () => {
    it('should rebalance tasks in a plan', async () => {
      await service.assignTask(testPlan.id, 'Task A', 'agent-1', AgentRole.WORKER, {}, []);
      await service.assignTask(testPlan.id, 'Task B', 'agent-2', AgentRole.WORKER, [], []);

      const plan = await service.rebalance(testPlan.id);

      expect(plan.tasks).toHaveLength(2);
    });

    it('should return plan unchanged when no pending or running tasks', async () => {
      const plan = await service.rebalance(testPlan.id);
      expect(plan.tasks).toHaveLength(0);
    });
  });
});
