import { Injectable, Logger } from '@nestjs/common';
import type { EvaluationRun, EvaluationTargetType } from '../../evaluation-platform/domain/evaluation-run.entity.js';
import type { BenchmarkEntity, BenchmarkData } from '../../evaluation-platform/domain/benchmark.entity.js';
import type { RegressionReport } from '../../evaluation-platform/application/regression-testing.service.js';
import { BenchmarkRegistryService } from '../../evaluation-platform/application/benchmark-registry.service.js';
import { EvaluationRunnerService } from '../../evaluation-platform/application/evaluation-runner.service.js';
import { RegressionTestingService } from '../../evaluation-platform/application/regression-testing.service.js';

@Injectable()
export class EvaluationApi {
  private readonly logger = new Logger(EvaluationApi.name);

  constructor(
    private readonly benchmarkRegistry: BenchmarkRegistryService,
    private readonly runner: EvaluationRunnerService,
    private readonly regression: RegressionTestingService,
  ) {}

  async runBenchmark(
    benchmarkId: string,
    targetType: EvaluationTargetType,
    targetId: string,
  ): Promise<EvaluationRun> {
    this.logger.debug(`runBenchmark(benchmarkId=${benchmarkId}, targetId=${targetId})`);
    return this.runner.run(benchmarkId, targetType, targetId);
  }

  async registerBenchmark(data: BenchmarkData): Promise<BenchmarkEntity> {
    this.logger.debug(`registerBenchmark(name=${data.name})`);
    return this.benchmarkRegistry.register(data);
  }

  async detectRegression(
    previous: string,
    current: string,
  ): Promise<RegressionReport> {
    this.logger.debug(`detectRegression(previous=${previous}, current=${current})`);
    return this.regression.detectRegression(previous, current);
  }

  async getResults(runId: string): Promise<EvaluationRun | null> {
    return this.runner.getRun(runId);
  }
}
