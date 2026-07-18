import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { SchemaRegistryService } from './application/services/schema-registry.service.js';
import { EventReplayService } from './application/services/event-replay.service.js';
import { EventOutboxRepository } from '../semantic-integration/infrastructure/persistence/event-outbox.repository.js';
import { DomainEventPublisher } from '../semantic-integration/application/services/domain-event-publisher.service.js';

@Module({
  providers: [
    SchemaRegistryService,
    EventReplayService,
    EventOutboxRepository,
    DomainEventPublisher,
  ],
  exports: [SchemaRegistryService, EventReplayService],
})
export class EnterpriseEventArchitectureModule implements OnModuleInit {
  private readonly logger = new Logger(EnterpriseEventArchitectureModule.name);

  onModuleInit(): void {
    this.logger.log(
      'Enterprise Event Architecture Module initialized: schema registry + replay ready',
    );
  }
}
