import type { DomainEvent, EventType } from '../events/domain-event.types.js';

export interface IEventHandler {
  readonly handledEvent: EventType;
  handle(event: DomainEvent): Promise<void>;
}
