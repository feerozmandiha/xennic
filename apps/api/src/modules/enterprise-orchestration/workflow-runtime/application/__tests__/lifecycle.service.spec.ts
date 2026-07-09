import { Test, TestingModule } from '@nestjs/testing';
import { LifecycleService } from '../lifecycle.service.js';
import { CompensationService } from '../compensation.service.js';
import { InMemoryExecutionRepository } from '../../testing/adapters/in-memory-execution-repository.js';
import { WorkflowExecution } from '../../domain/workflow-execution.entity.js';
import type { IExecutionRepository } from '../../domain/execution-repository.interface.js';

describe('LifecycleService', () => {
  let lifecycle: LifecycleService;
  let repository: IExecutionRepository;

  const createRunningExecution = async (): Promise<WorkflowExecution> => {
    const execution = WorkflowExecution.reconstitute(
      'exec-1',
      'wf-1',
      1,
      'running',
      [],
      {},
      null,
      null,
      new Date(),
      null,
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
        updatedBy: null,
      },
      new Date(),
    );
    await repository.save(execution);
    return execution;
  };

  const createPausedExecution = async (): Promise<WorkflowExecution> => {
    const execution = WorkflowExecution.reconstitute(
      'exec-2',
      'wf-1',
      1,
      'paused',
      [],
      {},
      null,
      null,
      new Date(),
      null,
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
        updatedBy: null,
      },
      new Date(),
    );
    await repository.save(execution);
    return execution;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LifecycleService,
        CompensationService,
        { provide: 'IExecutionRepository', useClass: InMemoryExecutionRepository },
      ],
    }).compile();

    lifecycle = module.get(LifecycleService);
    repository = module.get('IExecutionRepository');
  });

  describe('pause', () => {
    it('should pause a running execution', async () => {
      await createRunningExecution();
      await lifecycle.pause('exec-1');

      const status = await lifecycle.getStatus('exec-1');
      expect(status).toBe('paused');
    });

    it('should throw for non-running execution', async () => {
      await createPausedExecution();
      await expect(lifecycle.pause('exec-2')).rejects.toThrow();
    });

    it('should throw for non-existent execution', async () => {
      await expect(lifecycle.pause('non-existent')).rejects.toThrow();
    });
  });

  describe('resume', () => {
    it('should resume a paused execution', async () => {
      await createPausedExecution();
      await lifecycle.resume('exec-2');

      const status = await lifecycle.getStatus('exec-2');
      expect(status).toBe('running');
    });

    it('should throw for non-paused execution', async () => {
      await createRunningExecution();
      await expect(lifecycle.resume('exec-1')).rejects.toThrow();
    });
  });

  describe('cancel', () => {
    it('should cancel a running execution', async () => {
      await createRunningExecution();
      await lifecycle.cancel('exec-1');

      const status = await lifecycle.getStatus('exec-1');
      expect(status).toBe('cancelled');
    });

    it('should throw for already completed execution', async () => {
      const execution = WorkflowExecution.reconstitute(
        'exec-3',
        'wf-1',
        1,
        'completed',
        [],
        {},
        null,
        null,
        new Date(),
        new Date(),
        {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
          updatedBy: null,
        },
        new Date(),
      );
      await repository.save(execution);

      await expect(lifecycle.cancel('exec-3')).rejects.toThrow();
    });
  });

  describe('getStatus', () => {
    it('should return the current status', async () => {
      await createRunningExecution();
      const status = await lifecycle.getStatus('exec-1');
      expect(status).toBe('running');
    });

    it('should throw for non-existent execution', async () => {
      await expect(lifecycle.getStatus('non-existent')).rejects.toThrow();
    });
  });
});
