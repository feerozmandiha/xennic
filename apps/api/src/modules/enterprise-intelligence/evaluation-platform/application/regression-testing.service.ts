import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IEvaluationRepository } from '../domain/evaluation-repository.interface.js';
import { EvaluationRunStatus, EvaluationTargetType } from '../domain/evaluation-run.entity.js';

export interface MetricDelta {
  metric: string;
  previous: number;
  current: number;
  delta: number;
  percentChange: number;
}

export interface RegressionReport {
  targetType: EvaluationTargetType;
  targetId: string;
  previousRunId: string;
  currentRunId: string;
  overallDelta: number;
  overallPercentChange: number;
  metrics: MetricDelta[];
  isRegressed: boolean;
  significant: boolean;
}

const SIGNIFICANCE_THRESHOLD = 0.05;

@Injectable()
export class RegressionTestingService {
  private readonly logger = new Logger(RegressionTestingService.name);

  constructor(@Inject('IEvaluationRepository') private readonly repo: IEvaluationRepository) {}

  async detectRegression(previousRunId: string, currentRunId: string): Promise<RegressionReport> {
    const previous = await this.repo.getRun(previousRunId);
    if (!previous) throw new Error(`Previous run ${previousRunId} not found`);
    if (previous.status !== EvaluationRunStatus.COMPLETED) {
      throw new Error(`Previous run ${previousRunId} is not completed`);
    }

    const current = await this.repo.getRun(currentRunId);
    if (!current) throw new Error(`Current run ${currentRunId} not found`);
    if (current.status !== EvaluationRunStatus.COMPLETED) {
      throw new Error(`Current run ${currentRunId} is not completed`);
    }

    const metricNames = new Set<string>();
    for (const r of previous.results) metricNames.add(r.metric);
    for (const r of current.results) metricNames.add(r.metric);

    const metrics: MetricDelta[] = [];
    for (const metric of metricNames) {
      const prevResults = previous.results.filter((r) => r.metric === metric);
      const currResults = current.results.filter((r) => r.metric === metric);

      const prevAvg =
        prevResults.length > 0
          ? prevResults.reduce((s, r) => s + r.value, 0) / prevResults.length
          : 0;
      const currAvg =
        currResults.length > 0
          ? currResults.reduce((s, r) => s + r.value, 0) / currResults.length
          : 0;

      const delta = currAvg - prevAvg;
      const percentChange = prevAvg !== 0 ? (delta / prevAvg) * 100 : 0;

      metrics.push({ metric, previous: prevAvg, current: currAvg, delta, percentChange });
    }

    const overallDelta = (current.score ?? 0) - (previous.score ?? 0);
    const overallPercentChange =
      previous.score !== null && previous.score !== 0 ? (overallDelta / previous.score) * 100 : 0;

    return {
      targetType: current.targetType,
      targetId: current.targetId,
      previousRunId,
      currentRunId,
      overallDelta,
      overallPercentChange,
      metrics,
      isRegressed: overallDelta < 0,
      significant: this.isSignificant(overallDelta),
    };
  }

  async getRegressionReport(
    targetType: EvaluationTargetType,
    targetId: string,
  ): Promise<RegressionReport | null> {
    const result = await this.repo.listRuns({ targetType });
    const completed = result.items.filter(
      (r) =>
        r.targetType === targetType &&
        r.targetId === targetId &&
        r.status === EvaluationRunStatus.COMPLETED,
    );
    const runs = completed.sort(
      (a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
    );

    if (runs.length < 2) return null;

    const previous = runs[1]!;
    const current = runs[0]!;
    return this.detectRegression(previous.id, current.id);
  }

  isSignificant(delta: number): boolean {
    return Math.abs(delta) >= SIGNIFICANCE_THRESHOLD;
  }
}
