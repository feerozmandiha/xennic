import { Injectable, Logger } from '@nestjs/common';
import type { DomainEvent } from '../../domain/events/domain-event.types.js';
import { EventOutboxRepository } from '../../infrastructure/persistence/event-outbox.repository.js';

@Injectable()
export class DomainEventPublisher {
  private readonly logger = new Logger(DomainEventPublisher.name);

  constructor(private readonly outboxRepository: EventOutboxRepository) {}

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    this.logger.debug(`Publishing event ${event.eventType} (${event.eventId})`);
    await this.outboxRepository.insert({
      eventId: event.eventId,
      eventType: event.eventType,
      eventVersion: event.eventVersion,
      correlationId: event.correlationId,
      causationId: event.causationId,
      tracingId: event.tracingId,
      source: event.source,
      payload: event.data,
      metadata: event.metadata as unknown as Record<string, unknown>,
      workspaceId: event.metadata.workspaceId,
      maxRetries: 3,
    });
  }
}
