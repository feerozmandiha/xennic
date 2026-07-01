import type { Backup, BackupType, BackupTarget, BackupStatus, RestorePoint, Snapshot, RetentionRule, DisasterRecoveryPlan } from '../types/backup.types.js';

export interface IBackupManager {
  create(type: BackupType, target: BackupTarget, metadata?: Record<string, unknown>, workspaceId?: string): Promise<string>;
  getStatus(backupId: string): Promise<Backup | null>;
  list(filters?: { type?: BackupType; status?: BackupStatus; page?: number; limit?: number }): Promise<{ items: Backup[]; total: number }>;
  cancel(backupId: string): Promise<void>;
}

export interface IRestoreService {
  restore(backupId: string, target?: BackupTarget): Promise<string>;
  getStatus(restoreId: string): Promise<RestorePoint | null>;
  cancel(restoreId: string): Promise<void>;
}

export interface ISnapshotService {
  create(backupId: string, name: string, retentionDays: number): Promise<string>;
  list(filters?: { type?: BackupType; page?: number; limit?: number }): Promise<{ items: Snapshot[]; total: number }>;
  delete(snapshotId: string): Promise<void>;
  prune(retentionRules: RetentionRule[]): Promise<number>;
}

export interface IRetentionService {
  getRules(): Promise<RetentionRule[]>;
  setRule(rule: Omit<RetentionRule, 'id'>): Promise<string>;
  deleteRule(ruleId: string): Promise<void>;
  apply(): Promise<{ deleted: number; freed: number }>;
}

export interface IDisasterRecoveryService {
  getPlans(): Promise<DisasterRecoveryPlan[]>;
  execute(planId: string): Promise<string>;
  test(planId: string): Promise<{ passed: boolean; issues: string[] }>;
  getStatus(executionId: string): Promise<{ step: number; status: string; error?: string }>;
}
