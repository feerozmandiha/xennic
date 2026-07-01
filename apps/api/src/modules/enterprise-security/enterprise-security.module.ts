import { Module } from '@nestjs/common';
import { SecurityController } from './presentation/controllers/security.controller.js';
import { EncryptionService } from './application/services/encryption.service.js';
import { SecretsManager } from './application/services/secrets-manager.service.js';
import { AuditLogService } from './application/services/audit-log.service.js';
import { SignedUrlService } from './application/services/signed-url.service.js';

@Module({
  controllers: [SecurityController],
  providers: [
    EncryptionService,
    SecretsManager,
    AuditLogService,
    SignedUrlService,
  ],
  exports: [
    EncryptionService,
    SecretsManager,
    AuditLogService,
    SignedUrlService,
  ],
})
export class EnterpriseSecurityModule {}
