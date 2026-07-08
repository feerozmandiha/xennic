import type { DomainEvent } from '../events/domain-event.types.js';

export const IDOMAIN_EVENT_PUBLISHER = 'IDomainEventPublisher' as const;

export interface IDomainEventPublisher {
  publish<T>(event: DomainEvent<T>): Promise<void>;
}
