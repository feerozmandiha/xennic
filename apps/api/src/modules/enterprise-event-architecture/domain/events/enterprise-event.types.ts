export enum EnterpriseEventType {
  SchemaRegistered = 'SchemaRegistered',
  SchemaVersionCreated = 'SchemaVersionCreated',
  CompatibilityChecked = 'CompatibilityChecked',
  ReplayStarted = 'ReplayStarted',
  ReplayCompleted = 'ReplayCompleted',
  ReplayFailed = 'ReplayFailed',
  EventUpcasted = 'EventUpcasted',
}

export interface SchemaRegisteredPayload {
  eventType: string;
  version: number;
  propertyCount: number;
}

export interface SchemaVersionCreatedPayload {
  eventType: string;
  previousVersion: number;
  newVersion: number;
}

export interface ReplayStartedPayload {
  replayId: string;
  eventType?: string;
  workspaceId?: string;
  maxEvents?: number;
}

export interface ReplayCompletedPayload {
  replayId: string;
  replayedCount: number;
  failedCount: number;
  durationMs: number;
}

export interface EventUpcastedPayload {
  eventId: string;
  eventType: string;
  fromVersion: number;
  toVersion: number;
}

export type EnterpriseEventPayloads = {
  [EnterpriseEventType.SchemaRegistered]: SchemaRegisteredPayload;
  [EnterpriseEventType.SchemaVersionCreated]: SchemaVersionCreatedPayload;
  [EnterpriseEventType.CompatibilityChecked]: never;
  [EnterpriseEventType.ReplayStarted]: ReplayStartedPayload;
  [EnterpriseEventType.ReplayCompleted]: ReplayCompletedPayload;
  [EnterpriseEventType.ReplayFailed]: ReplayStartedPayload;
  [EnterpriseEventType.EventUpcasted]: EventUpcastedPayload;
};
