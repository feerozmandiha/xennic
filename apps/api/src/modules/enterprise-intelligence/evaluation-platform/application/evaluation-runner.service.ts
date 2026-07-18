import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import type { IEvaluationRepository } from '../domain/evaluation-repository.interface.js';
import {
  EvaluationRun,
  EvaluationRunStatus,
  EvaluationTargetType,
} from '../domain/evaluation-run.entity.js';
import type { EvaluationResult } from '../domain/evaluation-run.entity.js';
import { BenchmarkStatus } from '../domain/benchmark.entity.js';

export interface ComparisonStrategy {
  compare(
    actual: Record<string, unknown>,
    expected: Record<string, unknown>,
    metric: string,
  ): number;
}

export class ExactMatchStrategy implements ComparisonStrategy {
  compare(
    actual: Record<string, unknown>,
    expected: Record<string, unknown>,
    _metric: string,
  ): number {
    const actualVal = JSON.stringify(actual);
    const expectedVal = JSON.stringify(expected);
    return actualVal === expectedVal ? 1 : 0;
  }
}

export class PartialMatchStrategy implements ComparisonStrategy {
  compare(
    actual: Record<string, unknown>,
    expected: Record<string, unknown>,
    _metric: string,
  ): number {
    const keys = Object.keys(expected);
    if (keys.length === 0) return 0;
    const matched = keys.filter((k) => JSON.stringify(actual[k]) === JSON.stringify(expected[k]));
    return matched.length / keys.length;
  }
}

@Injectable()
export class EvaluationRunnerService {
  private readonly logger = new Logger(EvaluationRunnerService.name);
  private strategies: Map<string, ComparisonStrategy> = new Map();

  constructor(@Inject('IEvaluationRepository') private readonly repo: IEvaluationRepository) {
    this.strategies.set('exact', new ExactMatchStrategy());
    this.strategies.set('partial', new PartialMatchStrategy());
  }

  registerStrategy(name: string, strategy: ComparisonStrategy): void {
    this.strategies.set(name, strategy);
  }

  async run(
    benchmarkId: string,
    targetType: EvaluationTargetType,
    targetId: string,
    targetVersion: number = 1,
  ): Promise<EvaluationRun> {
    const benchmark = await this.repo.getBenchmark(benchmarkId);
    if (!benchmark) throw new NotFoundException(`Benchmark ${benchmarkId} not found`);
    if (benchmark.status !== BenchmarkStatus.ACTIVE) {
      throw new Error(`Benchmark ${benchmarkId} is not active (status: ${benchmark.status})`);
    }

    const dataset = await this.repo.getDataset(benchmark.datasetId);
    if (!dataset) throw new NotFoundException(`Dataset ${benchmark.datasetId} not found`);
    if (dataset.items.length === 0) throw new Error(`Dataset ${benchmark.datasetId} has no items`);

    const run = EvaluationRun.create({
      benchmarkId,
      targetType,
      targetId,
      targetVersion,
    });

    const startedRun = EvaluationRun.reconstitute(
      run.id,
      run.benchmarkId,
      run.targetType,
      run.targetId,
      run.targetVersion,
      EvaluationRunStatus.RUNNING,
      [],
      null,
      new Date(),
      null,
      run.metadata,
      run.createdAt,
      new Date(),
    );
    await this.repo.saveRun(startedRun);

    try {
      const results: EvaluationResult[] = [];
      let totalScore = 0;

      for (const item of dataset.items) {
        const actual = await this.executeTarget(targetType, targetId, item.input);
        for (const metric of benchmark.metrics) {
          const strategy = this.strategies.get(metric) ?? this.strategies.get('exact')!;
          const value = strategy.compare(actual, item.expectedOutput, metric);
          results.push({ metric, value, details: { itemId: item.id } });
          totalScore += value;
        }
      }

      const aggregateScore =
        benchmark.metrics.length > 0
          ? totalScore / (dataset.items.length * benchmark.metrics.length)
          : 0;

      const completedRun = EvaluationRun.reconstitute(
        run.id,
        run.benchmarkId,
        run.targetType,
        run.targetId,
        run.targetVersion,
        EvaluationRunStatus.COMPLETED,
        results,
        aggregateScore,
        startedRun.startedAt,
        new Date(),
        run.metadata,
        run.createdAt,
        new Date(),
      );
      await this.repo.saveRun(completedRun);

      this.logger.log(`Completed evaluation run ${run.id} score=${aggregateScore.toFixed(4)}`);
      return completedRun;
    } catch (error) {
      const failedRun = EvaluationRun.reconstitute(
        run.id,
        run.benchmarkId,
        run.targetType,
        run.targetId,
        run.targetVersion,
        EvaluationRunStatus.FAILED,
        [],
        null,
        startedRun.startedAt,
        null,
        run.metadata,
        run.createdAt,
        new Date(),
      );
      await this.repo.saveRun(failedRun);
      this.logger.error(`Evaluation run ${run.id} failed: ${(error as Error).message}`);
      throw error;
    }
  }

  async getRun(id: string): Promise<EvaluationRun | null> {
    return this.repo.getRun(id);
  }

  async listRuns(options?: { offset?: number; limit?: number; targetType?: string }): Promise<{
    items: EvaluationRun[];
    total: number;
    offset: number;
    limit: number;
  }> {
    return this.repo.listRuns(options);
  }

  private async executeTarget(
    targetType: EvaluationTargetType,
    targetId: string,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    this.logger.debug(`Executing ${targetType} ${targetId} with input`);
    return input;
  }
}
