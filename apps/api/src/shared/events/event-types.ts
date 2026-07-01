export interface EventEnvelope<T = unknown> {
  eventId: string;
  eventType: string;
  eventVersion: number;
  correlationId: string;
  timestamp: string;
  data: T;
}

export const EventNames = {
  USER_CREATED: 'user.created',
  USER_LOGGED_IN: 'user.logged_in',
  WORKSPACE_CREATED: 'workspace.created',
  PROJECT_CREATED: 'project.created',
  CALCULATION_COMPLETED: 'calculation.completed',
  KNOWLEDGE_ARTICLE_CREATED: 'knowledge.article.created',
  SUBSCRIPTION_CHANGED: 'subscription.changed',
  BILLING_INVOICED: 'billing.invoiced',
} as const;

export type EventName = (typeof EventNames)[keyof typeof EventNames];

export type EventHandler<T = unknown> = (event: EventEnvelope<T>) => Promise<void>;
