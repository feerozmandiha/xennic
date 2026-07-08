import { Injectable, Logger } from '@nestjs/common';

export interface CompensationPlan<TContext = unknown> {
  sagaName: string;
  steps: Array<{
    name: string;
    compensate(context: TContext, error: Error): Promise<void>;
  }>;
}

@Injectable()
export class CompensationHandler {
  private readonly logger = new Logger(CompensationHandler.name);

  async executeCompensation<TContext>(
    plan: CompensationPlan<TContext>,
    context: TContext,
    originalError: Error,
  ): Promise<void> {
    this.logger.log(`Executing compensation plan for ${plan.sagaName}`);

    for (const step of plan.steps.reverse()) {
      try {
        await step.compensate(context, originalError);
        this.logger.debug(`Compensation step ${step.name} completed`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Compensation step ${step.name} failed: ${message}`);
      }
    }
  }
}
