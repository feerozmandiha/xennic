import { Module, Global, Logger, OnModuleInit } from '@nestjs/common';
import { ApprovalService } from './application/approval.service.js';
import { ReviewService } from './application/review.service.js';
import { CorrectionService } from './application/correction.service.js';
import { EscalationService } from './application/escalation.service.js';
import { PrismaHitlRepository } from './infrastructure/persistence/prisma-hitl-repository.js';

@Global()
@Module({
  providers: [
    ApprovalService,
    ReviewService,
    CorrectionService,
    EscalationService,
    { provide: 'IHitlRepository', useClass: PrismaHitlRepository },
  ],
  exports: [ApprovalService, ReviewService],
})
export class HumanInTheLoopModule implements OnModuleInit {
  private readonly logger = new Logger(HumanInTheLoopModule.name);

  onModuleInit(): void {
    this.logger.log('Human-in-the-Loop Module initialized');
  }
}
