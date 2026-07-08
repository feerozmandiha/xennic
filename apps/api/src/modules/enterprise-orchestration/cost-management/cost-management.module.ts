import { Module, Global, Logger, OnModuleInit } from '@nestjs/common';
import { CostTrackingService } from './application/cost-tracking.service.js';
import { CostAnalysisService } from './application/cost-analysis.service.js';
import { BudgetService } from './application/budget.service.js';
import { PrismaCostRepository } from './infrastructure/persistence/prisma-cost-repository.js';

@Global()
@Module({
  providers: [
    CostTrackingService,
    CostAnalysisService,
    BudgetService,
    { provide: 'ICostRepository', useClass: PrismaCostRepository },
  ],
  exports: [
    CostTrackingService,
    CostAnalysisService,
    BudgetService,
  ],
})
export class CostManagementModule implements OnModuleInit {
  private readonly logger = new Logger(CostManagementModule.name);

  onModuleInit(): void {
    this.logger.log('Cost & Resource Management Module initialized');
  }
}
