import { Injectable, Logger } from '@nestjs/common';
import type { ExecutionStep } from '../domain/workflow-execution.entity.js';

@Injectable()
export class TimeoutHandlerService {
  private readonly logger = new Logger(TimeoutHandlerService.name);
  private readonly timeouts = new Map<string, ReturnType<typeof setTimeout>>();

  async executeWithTimeout(
    step: ExecutionStep,
    executor: () => Promise<Record<string, unknown>>,
    timeoutMs: number,
  ): Promise<Record<string, unknown>> {
    return new Promise<Record<string, unknown>>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.timeouts.delete(step.stepId);
        reject(new Error(`Step ${step.stepId} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.timeouts.set(step.stepId, timer);

      executor()
        .then((result) => {
          this.cancelTimeout(step.stepId);
          resolve(result);
        })
        .catch((error) => {
          this.cancelTimeout(step.stepId);
          reject(error);
        });
    });
  }

  cancelTimeout(stepId: string): void {
    const timer = this.timeouts.get(stepId);
    if (timer) {
      clearTimeout(timer);
      this.timeouts.delete(stepId);
      this.logger.debug(`Cancelled timeout for step ${stepId}`);
    }
  }
}
