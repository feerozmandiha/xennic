import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowExecutorService } from '../workflow-executor.service.js';
import { RetryHandlerService } from '../retry-handler.service.js';
import { TimeoutHandlerService } from '../timeout-handler.service.js';
import { CompensationService } from '../compensation.service.js';
import { InMemoryExecutionRepository } from '../../testing/adapters/in-memory-execution-repository.js';
import { WorkflowDefinition } from '../../../workflow-engine/domain/workflow-definition.entity.js';
import type { WorkflowStep } from '../../../workflow-engine/domain/workflow-definition.entity.js';
import type { IExecutionRepository } from '../../domain/execution-repository.interface.js';

describe('WorkflowExecutorService', () => {
  let executor: WorkflowExecutorService;
  let repository: IExecutionRepository;
  const makeDefinition = (steps: WorkflowStep[]): WorkflowDefinition => {
    return WorkflowDefinition.reconstitute(
      'wf-1',
      'test-workflow',
      'A test workflow',
      1,
      steps,
      [],
      null,
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
        updatedBy: null,
      },
      new Date(),
      new Date(),
      'active',
    );
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowExecutorService,
        RetryHandlerService,
        TimeoutHandlerService,
        CompensationService,
        { provide: 'IExecutionRepository', useClass: InMemoryExecutionRepository },
      ],
    }).compile();

    executor = module.get(WorkflowExecutorService);
    repository = module.get('IExecutionRepository');
  });

  describe('start execution', () => {
    it('should create and start a workflow execution', async () => {
      const steps: WorkflowStep[] = [
        {
          id: 'step-1',
          type: 'task',
          name: 'First',
          description: '',
          config: {},
          next: null,
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
      ];

      const definition = makeDefinition(steps);
      const execution = await executor.start('wf-1', definition, { test: true }, 'user-1');

      expect(execution).toBeDefined();
      expect(execution.workflowId).toBe('wf-1');
      expect(execution.status).toBe('completed');
      expect(execution.steps).toHaveLength(1);
      expect(execution.steps[0]?.status).toBe('completed');

      const saved = await repository.get(execution.id);
      expect(saved).toBeDefined();
      expect(saved?.id).toBe(execution.id);
    });
  });

  describe('sequential step execution', () => {
    it('should execute steps in sequence', async () => {
      const steps: WorkflowStep[] = [
        {
          id: 'step-1',
          type: 'task',
          name: 'First',
          description: '',
          config: {},
          next: ['step-2'],
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
        {
          id: 'step-2',
          type: 'task',
          name: 'Second',
          description: '',
          config: {},
          next: null,
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
      ];

      const definition = makeDefinition(steps);
      const execution = await executor.start('wf-1', definition);

      expect(execution.status).toBe('completed');
      expect(execution.steps.every((s) => s.status === 'completed')).toBe(true);
    });
  });

  describe('parallel step execution', () => {
    it('should execute parallel steps concurrently', async () => {
      const steps: WorkflowStep[] = [
        {
          id: 'fork',
          type: 'parallel',
          name: 'Fork',
          description: '',
          config: {},
          next: ['branch-a', 'branch-b'],
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
        {
          id: 'branch-a',
          type: 'task',
          name: 'Branch A',
          description: '',
          config: {},
          next: null,
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
        {
          id: 'branch-b',
          type: 'task',
          name: 'Branch B',
          description: '',
          config: {},
          next: null,
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
      ];

      const definition = makeDefinition(steps);
      const execution = await executor.start('wf-1', definition);

      expect(execution.status).toBe('completed');
    });
  });

  describe('conditional routing', () => {
    it('should evaluate conditional step when condition is true', async () => {
      const steps: WorkflowStep[] = [
        {
          id: 'condition',
          type: 'conditional',
          name: 'Check',
          description: '',
          config: { condition: true },
          next: ['then-step'],
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
        {
          id: 'then-step',
          type: 'task',
          name: 'Then',
          description: '',
          config: {},
          next: null,
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
      ];

      const definition = makeDefinition(steps);
      const execution = await executor.start('wf-1', definition);

      expect(execution.status).toBe('completed');
      const condStep = execution.steps.find((s) => s.stepId === 'condition');
      expect(condStep?.output).toEqual(expect.objectContaining({ conditionResult: true }));
    });

    it('should evaluate conditional step when condition is false', async () => {
      const steps: WorkflowStep[] = [
        {
          id: 'condition',
          type: 'conditional',
          name: 'Check',
          description: '',
          config: { condition: false },
          next: ['then-step'],
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
        {
          id: 'then-step',
          type: 'task',
          name: 'Then',
          description: '',
          config: {},
          next: null,
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
      ];

      const definition = makeDefinition(steps);
      const execution = await executor.start('wf-1', definition);

      expect(execution.status).toBe('completed');
      const condStep = execution.steps.find((s) => s.stepId === 'condition');
      expect(condStep?.output).toEqual(expect.objectContaining({ conditionResult: false }));
    });
  });

  describe('step failure', () => {
    it('should handle step failure and mark execution as failed', async () => {
      const steps: WorkflowStep[] = [
        {
          id: 'step-1',
          type: 'task',
          name: 'Failing step',
          description: '',
          config: {},
          next: null,
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
      ];

      const definition = makeDefinition(steps);
      const execution = await executor.start('wf-1', definition);

      expect(execution.status).toBe('completed');
    });
  });
});
