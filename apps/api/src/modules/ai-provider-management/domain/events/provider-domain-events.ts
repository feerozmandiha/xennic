export const ProviderDomainEventTypes = {
  PROVIDER_REGISTERED: 'provider.registered',
  PROVIDER_UPDATED: 'provider.updated',
  PROVIDER_DELETED: 'provider.deleted',
  PROVIDER_HEALTH_CHANGED: 'provider.health_changed',
  PROVIDER_FAILOVER: 'provider.failover',
  PROVIDER_DISCOVERY_COMPLETED: 'provider.discovery_completed',
  PROVIDER_KEY_ROTATED: 'provider.key_rotated',
  PROVIDER_QUOTA_EXCEEDED: 'provider.quota_exceeded',
} as const;

export type ProviderDomainEventType = (typeof ProviderDomainEventTypes)[keyof typeof ProviderDomainEventTypes];

export interface ProviderDomainEvent {
  eventType: ProviderDomainEventType;
  providerId: string;
  timestamp: string;
  data: Record<string, unknown>;
  correlationId?: string;
}

export function createProviderEvent(
  eventType: ProviderDomainEventType,
  providerId: string,
  data: Record<string, unknown> = {},
  correlationId?: string,
): ProviderDomainEvent {
  return {
    eventType,
    providerId,
    timestamp: new Date().toISOString(),
    data,
    correlationId,
  };
}
