export enum MessagingEventType {
  MessagePublished = 'MessagePublished',
  MessageHandled = 'MessageHandled',
  MessageFailed = 'MessageFailed',
  MessageDeadLettered = 'MessageDeadLettered',
  CommandExecuted = 'CommandExecuted',
  CommandFailed = 'CommandFailed',
  QueryExecuted = 'QueryExecuted',
}

export interface MessagePublishedPayload {
  messageId: string;
  messageType: string;
  priority: string;
  correlationId: string;
  workspaceId?: string;
}

export interface MessageHandledPayload {
  messageId: string;
  handlerName: string;
  durationMs: number;
}

export interface MessageFailedPayload {
  messageId: string;
  handlerName: string;
  error: string;
  retryCount: number;
}

export interface MessageDeadLetteredPayload {
  messageId: string;
  messageType: string;
  error: string;
  retryCount: number;
}

export interface CommandExecutedPayload {
  commandId: string;
  commandName: string;
  durationMs: number;
  success: boolean;
}

export interface CommandFailedPayload {
  commandId: string;
  commandName: string;
  error: string;
}
