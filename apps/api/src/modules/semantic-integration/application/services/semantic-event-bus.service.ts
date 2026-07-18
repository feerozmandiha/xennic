import { Injectable, Logger } from '@nestjs/common';
import type { DomainEvent } from '../../domain/events/domain-event.types.js';
import type { IEventHandler } from '../../domain/interfaces/event-handler.interface.js';

@Injectable()
export class SemanticEventBus {
  private readonly logger = new Logger(SemanticEventBus.name);
  private readonly handlers = new Map<string, IEventHandler[]>();

  register(handler: IEventHandler): void {
    const eventType = handler.handledEvent;
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    this.logger.log(`Registered handler ${handler.constructor.name} for ${eventType}`);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? [];
    if (handlers.length === 0) {
      this.logger.debug(`No handlers registered for ${event.eventType}`);
      return;
    }

    for (const handler of handlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Handler ${handler.constructor.name} failed for event ${event.eventId}: ${message}`,
        );
      }
    }
  }
}
