import { Module } from '@nestjs/common';
import { BackupManagerService } from './application/services/backup-manager.service.js';
import { RestoreService } from './application/services/restore.service.js';
import { SnapshotService } from './application/services/snapshot.service.js';
import { RetentionService } from './application/services/retention.service.js';
import { DisasterRecoveryService } from './application/services/disaster-recovery.service.js';

@Module({
  providers: [
    BackupManagerService,
    RestoreService,
    SnapshotService,
    RetentionService,
    DisasterRecoveryService,
  ],
  exports: [
    BackupManagerService,
    RestoreService,
    SnapshotService,
    RetentionService,
    DisasterRecoveryService,
  ],
})
export class EnterpriseBackupModule {}
