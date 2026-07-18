export const CalculationDomainEventTypes = {
  DEFINITION_CREATED: 'calculation.definition.created',
  DEFINITION_UPDATED: 'calculation.definition.updated',
  DEFINITION_VERSIONED: 'calculation.definition.versioned',
  DEFINITION_PUBLISHED: 'calculation.definition.published',
  DEFINITION_DEPRECATED: 'calculation.definition.deprecated',
  EXECUTION_STARTED: 'calculation.execution.started',
  EXECUTION_COMPLETED: 'calculation.execution.completed',
  EXECUTION_FAILED: 'calculation.execution.failed',
  CERTIFICATE_GENERATED: 'calculation.certificate.generated',
  CERTIFICATE_REVOKED: 'calculation.certificate.revoked',
  PLUGIN_REGISTERED: 'calculation.plugin.registered',
  PLUGIN_ENABLED: 'calculation.plugin.enabled',
  PLUGIN_DISABLED: 'calculation.plugin.disabled',
} as const;

export type CalculationDomainEventType =
  (typeof CalculationDomainEventTypes)[keyof typeof CalculationDomainEventTypes];

export interface CalculationDomainEvent {
  eventType: CalculationDomainEventType;
  entityId: string;
  entityType: string;
  timestamp: string;
  data: Record<string, unknown>;
  correlationId?: string;
  userId?: string;
  workspaceId?: string;
}

export function createCalculationEvent(
  eventType: CalculationDomainEventType,
  entityId: string,
  entityType: string,
  data: Record<string, unknown> = {},
  context?: { correlationId?: string; userId?: string; workspaceId?: string },
): CalculationDomainEvent {
  return {
    eventType,
    entityId,
    entityType,
    timestamp: new Date().toISOString(),
    data,
    correlationId: context?.correlationId,
    userId: context?.userId,
    workspaceId: context?.workspaceId,
  };
}
