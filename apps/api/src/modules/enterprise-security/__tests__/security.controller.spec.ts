import { Test, TestingModule } from '@nestjs/testing';
import { SecurityController } from '../presentation/controllers/security.controller.js';
import { EncryptionService } from '../application/services/encryption.service.js';
import { AuditLogService } from '../application/services/audit-log.service.js';
import { SignedUrlService } from '../application/services/signed-url.service.js';
import { AuthGuard } from '@nestjs/passport';
import { CanActivate } from '@nestjs/common';

describe('SecurityController', () => {
  let controller: SecurityController;
  let encryption: EncryptionService;

  const mockGuard: CanActivate = { canActivate: () => true };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecurityController],
      providers: [EncryptionService, AuditLogService, SignedUrlService],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockGuard)
      .compile();

    controller = module.get<SecurityController>(SecurityController);
    encryption = module.get<EncryptionService>(EncryptionService);
  });

  it('encrypts data via controller', async () => {
    const result = await controller.encrypt({ plaintext: 'hello' });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('decrypts data via controller', async () => {
    const encResult = await controller.encrypt({ plaintext: 'roundtrip' });
    const result = await controller.decrypt({
      ciphertext: encResult.data.ciphertext,
      iv: encResult.data.iv,
      tag: encResult.data.tag,
      algorithm: encResult.data.algorithm,
      keyId: encResult.data.keyId,
    });
    expect(result.success).toBe(true);
    expect(result.data.plaintext).toBe('roundtrip');
  });

  it('queries audit logs via controller', async () => {
    const result = await controller.queryAuditLogs({ page: 1, limit: 10 });
    expect(result.success).toBe(true);
    expect(result.data.items).toBeDefined();
  });

  it('generates signed URL via controller', async () => {
    const result = await controller.generateSignedUrl({
      operation: 'download', bucket: 'files', path: '/test.pdf', expiresIn: 300,
    });
    expect(result.success).toBe(true);
    expect(result.data.url).toContain('/api/v1/storage');
  });
});
