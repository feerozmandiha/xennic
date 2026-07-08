import { Module, Global, OnModuleInit, Logger } from '@nestjs/common';
import { BenchmarkRegistryService } from './application/benchmark-registry.service.js';
import { GoldenDatasetService } from './application/golden-dataset.service.js';
import { EvaluationRunnerService } from './application/evaluation-runner.service.js';
import { RegressionTestingService } from './application/regression-testing.service.js';
import { PrismaEvaluationRepository } from './infrastructure/persistence/prisma-evaluation-repository.js';

@Global()
@Module({
  providers: [
    BenchmarkRegistryService,
    GoldenDatasetService,
    EvaluationRunnerService,
    RegressionTestingService,
    { provide: 'IEvaluationRepository', useClass: PrismaEvaluationRepository },
  ],
  exports: [
    BenchmarkRegistryService,
    GoldenDatasetService,
    EvaluationRunnerService,
    RegressionTestingService,
  ],
})
export class EvaluationPlatformModule implements OnModuleInit {
  private readonly logger = new Logger(EvaluationPlatformModule.name);

  onModuleInit(): void {
    this.logger.log('Evaluation Platform Module initialized');
  }
}
