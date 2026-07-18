import { Injectable, Logger } from '@nestjs/common';

interface ExecutionMetrics {
  planId: string;
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  totalDuration: number;
  averageStepDuration: number;
  startTime: Date;
  endTime: Date | null;
}

interface AggregateStats {
  totalPlans: number;
  totalStepsExecuted: number;
  averageDuration: number;
  averageStepsPerPlan: number;
  successRate: number;
  failureRate: number;
  averageConfidence: number;
}

@Injectable()
export class ReasoningTelemetryService {
  private readonly logger = new Logger(ReasoningTelemetryService.name);
  private readonly metrics = new Map<string, ExecutionMetrics>();

  async recordMetrics(
    planId: string,
    metrics: {
      totalSteps: number;
      completedSteps: number;
      failedSteps: number;
      totalDuration: number;
      averageStepDuration: number;
      startTime: Date;
      endTime: Date | null;
    },
  ): Promise<void> {
    const entry: ExecutionMetrics = {
      planId,
      ...metrics,
    };

    this.metrics.set(planId, entry);
    this.logger.debug(`Recorded metrics for plan ${planId}: ${metrics.totalDuration}ms`);
  }

  async getMetrics(planId: string): Promise<ExecutionMetrics | null> {
    return this.metrics.get(planId) ?? null;
  }

  async getAggregateStats(): Promise<AggregateStats> {
    const allMetrics = Array.from(this.metrics.values());

    if (allMetrics.length === 0) {
      return {
        totalPlans: 0,
        totalStepsExecuted: 0,
        averageDuration: 0,
        averageStepsPerPlan: 0,
        successRate: 0,
        failureRate: 0,
        averageConfidence: 0,
      };
    }

    const totalPlans = allMetrics.length;
    const totalStepsExecuted = allMetrics.reduce((sum, m) => sum + m.completedSteps, 0);
    const totalDuration = allMetrics.reduce((sum, m) => sum + m.totalDuration, 0);
    const totalSteps = allMetrics.reduce((sum, m) => sum + m.totalSteps, 0);
    const totalFailed = allMetrics.reduce((sum, m) => sum + m.failedSteps, 0);

    const completedPlans = allMetrics.filter((m) => m.endTime !== null).length;

    return {
      totalPlans,
      totalStepsExecuted,
      averageDuration: totalPlans > 0 ? totalDuration / totalPlans : 0,
      averageStepsPerPlan: totalPlans > 0 ? totalSteps / totalPlans : 0,
      successRate: totalSteps > 0 ? totalStepsExecuted / totalSteps : 0,
      failureRate: totalSteps > 0 ? totalFailed / totalSteps : 0,
      averageConfidence: completedPlans > 0 ? completedPlans / totalPlans : 0,
    };
  }
}
