import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { FederatedSearchService } from './application/services/federated-search.service.js';
import { RankingStrategyService } from './application/services/ranking-strategy.service.js';

@Module({
  providers: [FederatedSearchService, RankingStrategyService],
  exports: [FederatedSearchService, RankingStrategyService],
})
export class EnterpriseSearchFederationModule implements OnModuleInit {
  private readonly logger = new Logger(EnterpriseSearchFederationModule.name);

  onModuleInit(): void {
    this.logger.log('Enterprise Search Federation Module initialized: federated search ready');
  }
}
