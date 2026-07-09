import { Test, TestingModule } from '@nestjs/testing';
import { ReviewerService } from '../reviewer.service.js';
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

describe('ReviewerService', () => {
  let service: ReviewerService;
  let repository: ICoordinationRepository;
  let taskId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewerService,
        { provide: 'ICoordinationRepository', useClass: InMemoryCoordinationRepository },
      ],
    }).compile();

    service = module.get(ReviewerService);
    repository = module.get('ICoordinationRepository');

    const plan = CoordinationPlan.create({
      workflowExecutionId: 'exec-1',
      goal: 'Test review',
      metadata: testMetadata,
    });

    const task = {
      id: 'task-1',
      description: 'Test task',
      assignedTo: 'agent-1',
      role: AgentRole.WORKER,
      input: { test: true },
      output: null,
      status: 'completed' as const,
      dependsOn: [],
      createdAt: new Date(),
    };
    plan.tasks.push(task);
    taskId = task.id;
    await repository.savePlan(plan);
  });

  describe('review', () => {
    it('should approve task with complete output', async () => {
      const result = await service.review(taskId, {
        completed: true,
        quality: true,
        result: 'success',
      });

      expect(result.taskId).toBe(taskId);
      expect(result.approved).toBe(true);
      expect(result.feedback).toBeNull();
    });

    it('should reject task with incomplete output', async () => {
      const result = await service.review(taskId, { started: true });

      expect(result.taskId).toBe(taskId);
      expect(result.approved).toBe(false);
      expect(result.feedback).toBeTruthy();
    });

    it('should reject task with missing quality metric', async () => {
      const result = await service.review(
        taskId,
        { completed: true },
        { quality: true, completeness: false, accuracy: false },
      );

      expect(result.approved).toBe(false);
      expect(result.feedback).toContain('Quality');
    });

    it('should reject task with error in output', async () => {
      const result = await service.review(taskId, { error: 'Something went wrong' });

      expect(result.approved).toBe(false);
      expect(result.feedback).toContain('error');
    });

    it('should throw when task does not exist', async () => {
      await expect(service.review('nonexistent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('requestChanges', () => {
    it('should mark task as pending with feedback', async () => {
      await service.requestChanges(taskId, 'Please add more details');

      const plan = await repository.findPlanByExecution('exec-1');
      const task = plan?.tasks.find((t) => t.id === taskId);
      expect(task?.status).toBe('pending');
    });

    it('should throw when task does not exist', async () => {
      await expect(service.requestChanges('nonexistent', 'Fix it')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('approve', () => {
    it('should mark task as completed', async () => {
      await service.approve(taskId);

      const plan = await repository.findPlanByExecution('exec-1');
      const task = plan?.tasks.find((t) => t.id === taskId);
      expect(task?.status).toBe('completed');
    });

    it('should throw when task does not exist', async () => {
      await expect(service.approve('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
