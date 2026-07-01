export enum BackupStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIAL = 'partial',
}

export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential',
}

export enum BackupTarget {
  DATABASE = 'database',
  FILES = 'files',
  BOTH = 'both',
}

export interface Backup {
  id: string;
  type: BackupType;
  target: BackupTarget;
  status: BackupStatus;
  size: number;
  location: string;
  checksum: string;
  startedAt: Date;
  completedAt?: Date;
  metadata: Record<string, unknown>;
  retentionDays: number;
  workspaceId?: string;
}

export interface RestorePoint {
  id: string;
  backupId: string;
  status: BackupStatus;
  target: BackupTarget;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface Snapshot {
  id: string;
  name: string;
  type: BackupType;
  size: number;
  location: string;
  checksum: string;
  createdAt: Date;
  retentionUntil: Date;
  metadata: Record<string, unknown>;
}

export interface RetentionRule {
  id: string;
  name: string;
  backupType: BackupType;
  maxAge: number;
  maxCount: number;
  priority: number;
  enabled: boolean;
}

export interface DisasterRecoveryPlan {
  id: string;
  name: string;
  description: string;
  steps: DisasterRecoveryStep[];
  estimatedRto: number;
  estimatedRpo: number;
  lastTested?: Date;
  enabled: boolean;
}

export interface DisasterRecoveryStep {
  order: number;
  name: string;
  action: string;
  timeout: number;
  required: boolean;
  dependsOn: number[];
}
