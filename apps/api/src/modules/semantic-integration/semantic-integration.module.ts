import { Module, OnModuleInit, Global, Logger } from '@nestjs/common';
import { EventOutboxRepository } from './infrastructure/persistence/event-outbox.repository.js';
import { EventProcessLogRepository } from './infrastructure/persistence/event-process-log.repository.js';
import { DomainEventPublisher } from './application/services/domain-event-publisher.service.js';
import { SemanticEventBus } from './application/services/semantic-event-bus.service.js';
import { OutboxRelayService } from './application/services/outbox-relay.service.js';
import { DocumentPublishedHandler } from './application/event-handlers/document-published.handler.js';
import { CacheInvalidationHandler } from './application/event-handlers/cache-invalidation.handler.js';
import { KnowledgeIntelligenceModule } from '../knowledge-intelligence/knowledge-intelligence.module.js';
import { AiRuntimeModule } from '../ai-runtime/ai-runtime.module.js';

@Global()
@Module({
  imports: [KnowledgeIntelligenceModule, AiRuntimeModule],
  providers: [
    EventOutboxRepository,
    EventProcessLogRepository,
    DomainEventPublisher,
    SemanticEventBus,
    OutboxRelayService,
    DocumentPublishedHandler,
    CacheInvalidationHandler,
  ],
  exports: [DomainEventPublisher, SemanticEventBus],
})
export class SemanticIntegrationModule implements OnModuleInit {
  private readonly logger = new Logger(SemanticIntegrationModule.name);

  constructor(
    private readonly eventBus: SemanticEventBus,
    private readonly outboxRelay: OutboxRelayService,
    private readonly documentPublishedHandler: DocumentPublishedHandler,
    private readonly cacheInvalidationHandler: CacheInvalidationHandler,
  ) {}

  onModuleInit(): void {
    this.eventBus.register(this.documentPublishedHandler);
    this.eventBus.register(this.cacheInvalidationHandler);
    this.outboxRelay.start();
    this.logger.log(
      'Semantic Integration Layer initialized: handlers registered, outbox relay started',
    );
  }
}
