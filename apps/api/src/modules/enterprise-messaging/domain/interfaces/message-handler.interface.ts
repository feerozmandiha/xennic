export const I_MESSAGE_QUEUE = 'IMessageQueue' as const;

export type MessagePriority = 'low' | 'normal' | 'high' | 'critical';

export interface MessageEnvelope<T = unknown> {
  readonly messageId: string;
  readonly messageType: string;
  readonly payload: T;
  readonly priority: MessagePriority;
  readonly correlationId: string;
  readonly causationId: string;
  readonly userId?: string;
  readonly workspaceId?: string;
  readonly timestamp: string;
  readonly retryCount: number;
  readonly maxRetries: number;
  readonly scheduledAt?: string;
  readonly ttlMs?: number;
}

export interface IMessageHandler<T = unknown> {
  readonly handledMessageType: string;
  handle(envelope: MessageEnvelope<T>): Promise<void>;
}

export interface IMessageQueue {
  publish<T>(envelope: Omit<MessageEnvelope<T>, 'timestamp' | 'retryCount'>): Promise<void>;
  subscribe(handler: IMessageHandler): void;
  unsubscribe(messageType: string): void;
}

export interface DeadLetterRecord {
  messageId: string;
  messageType: string;
  payload: unknown;
  error: string;
  failedAt: string;
  retryCount: number;
}

export interface IDeadLetterQueue {
  send(record: DeadLetterRecord): Promise<void>;
  replay(messageId: string): Promise<void>;
  list(limit?: number, offset?: number): Promise<DeadLetterRecord[]>;
}
