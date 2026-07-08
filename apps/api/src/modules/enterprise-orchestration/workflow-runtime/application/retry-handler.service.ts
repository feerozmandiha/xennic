import { Injectable, Logger } from '@nestjs/common';
import type { ExecutionStep } from '../domain/workflow-execution.entity.js';

@Injectable()
export class RetryHandlerService {
  private readonly logger = new Logger(RetryHandlerService.name);

  async executeWithRetry(
    executionId: string,
    step: ExecutionStep,
    executor: () => Promise<Record<string, unknown>>,
  ): Promise<Record<string, unknown>> {
    let lastError: Error | null = null;

    while (step.retryCount < 3) {
      try {
        step.retryCount += 1;
        this.logger.debug(`Retry attempt ${step.retryCount} for step ${step.stepId}`);
        return await executor();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(`Step ${step.stepId} attempt ${step.retryCount} failed: ${lastError.message}`);

        if (!this.shouldRetry(step, lastError)) {
          throw lastError;
        }

        const backoff = this.getBackoff(step.retryCount);
        this.logger.debug(`Waiting ${backoff}ms before retry ${step.retryCount}`);
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }

    throw lastError ?? new Error('Max retries exceeded');
  }

  shouldRetry(step: ExecutionStep, _error: Error): boolean {
    return step.retryCount < 3;
  }

  getBackoff(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt - 1), 30000);
  }
}
