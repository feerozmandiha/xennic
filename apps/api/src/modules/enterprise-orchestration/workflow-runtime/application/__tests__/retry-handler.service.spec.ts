import { Test, TestingModule } from '@nestjs/testing';
import { RetryHandlerService } from '../retry-handler.service.js';
import type { ExecutionStep } from '../../domain/workflow-execution.entity.js';

describe('RetryHandlerService', () => {
  let retryHandler: RetryHandlerService;

  const createStep = (overrides?: Partial<ExecutionStep>): ExecutionStep => ({
    stepId: 'step-1',
    name: 'Test step',
    type: 'task',
    status: 'pending',
    input: null,
    output: null,
    error: null,
    startedAt: null,
    completedAt: null,
    attempts: 0,
    retryCount: 0,
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetryHandlerService],
    }).compile();

    retryHandler = module.get(RetryHandlerService);
  });

  describe('executeWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const step = createStep();
      const executor = jest.fn().mockResolvedValue({ result: 'success' });

      const result = await retryHandler.executeWithRetry('exec-1', step, executor);

      expect(result).toEqual({ result: 'success' });
      expect(executor).toHaveBeenCalledTimes(1);
      expect(step.retryCount).toBe(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const step = createStep();
      const executor = jest
        .fn()
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValue({ result: 'success' });

      const result = await retryHandler.executeWithRetry('exec-1', step, executor);

      expect(result).toEqual({ result: 'success' });
      expect(executor).toHaveBeenCalledTimes(3);
      expect(step.retryCount).toBe(3);
    });

    it('should throw after max retries exceeded', async () => {
      const step = createStep();
      const executor = jest.fn().mockRejectedValue(new Error('Persistent failure'));

      await expect(retryHandler.executeWithRetry('exec-1', step, executor)).rejects.toThrow(
        'Persistent failure',
      );

      expect(executor).toHaveBeenCalledTimes(3);
      expect(step.retryCount).toBe(3);
    });
  });

  describe('shouldRetry', () => {
    it('should return true when retryCount < maxRetries', () => {
      const step = createStep({ retryCount: 0 });
      expect(retryHandler.shouldRetry(step, new Error('test'))).toBe(true);
    });

    it('should return false when retryCount >= maxRetries', () => {
      const step = createStep({ retryCount: 3 });
      expect(retryHandler.shouldRetry(step, new Error('test'))).toBe(false);
    });
  });

  describe('getBackoff', () => {
    it('should return 1000ms for attempt 1', () => {
      expect(retryHandler.getBackoff(1)).toBe(1000);
    });

    it('should return 2000ms for attempt 2', () => {
      expect(retryHandler.getBackoff(2)).toBe(2000);
    });

    it('should return 4000ms for attempt 3', () => {
      expect(retryHandler.getBackoff(3)).toBe(4000);
    });

    it('should cap at 30000ms', () => {
      expect(retryHandler.getBackoff(6)).toBe(30000);
    });
  });
});
