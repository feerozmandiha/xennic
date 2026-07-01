/**
 * Regression tests — verify pre-Phase 8 functionality is unaffected
 */
import { EncryptionService } from '../application/services/encryption.service.js';
import { AuditLogService } from '../application/services/audit-log.service.js';
import { SignedUrlService } from '../application/services/signed-url.service.js';

describe('Regression - Pre-Phase 8 functional contracts', () => {
  it('encryption produces deterministic structure', async () => {
    const service = new EncryptionService();
    const result = await service.encrypt('fixed-data');
    expect(result).toMatchObject({
      iv: expect.any(String),
      ciphertext: expect.any(String),
      tag: expect.any(String),
      algorithm: expect.any(String),
      keyId: expect.any(String),
    });
    expect(result.iv.length).toBe(32);
    expect(result.tag.length).toBe(32);
  });

  it('audit log query returns correct shape', async () => {
    const service = new AuditLogService();
    const result = await service.query({ page: 1, limit: 50 });
    expect(result).toMatchObject({ items: expect.any(Array), total: expect.any(Number) });
  });

  it('signed URL returns correct shape', async () => {
    const service = new SignedUrlService();
    const result = await service.generate({ operation: 'download', bucket: 'b', path: '/f', expiresIn: 60 });
    expect(result).toMatchObject({
      url: expect.stringContaining('/api/v1/storage/'),
      token: expect.any(String),
      expiresAt: expect.any(Date),
      method: expect.any(String),
    });
  });
});
