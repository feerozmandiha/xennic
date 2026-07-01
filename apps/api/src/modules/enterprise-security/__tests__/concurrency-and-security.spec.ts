import { EncryptionService } from '../application/services/encryption.service.js';
import { SecretsManager } from '../application/services/secrets-manager.service.js';
import { AuditLogService } from '../application/services/audit-log.service.js';
import { SignedUrlService } from '../application/services/signed-url.service.js';

describe('Security - Concurrency & Security Edge Cases', () => {
  describe('EncryptionService concurrency', () => {
    let service: EncryptionService;

    beforeEach(() => { service = new EncryptionService(); });

    it('handles concurrent encrypt operations', async () => {
      const results = await Promise.all(
        Array.from({ length: 50 }, (_, i) => service.encrypt(`data-${i}`)),
      );
      expect(results).toHaveLength(50);
      for (const r of results) expect(r.ciphertext).toBeDefined();
    });

    it('handles concurrent encrypt/decrypt round trips', async () => {
      const pairs = await Promise.all(
        Array.from({ length: 20 }, async (_, i) => {
          const enc = await service.encrypt(`msg-${i}`);
          const dec = await service.decrypt(enc);
          return dec;
        }),
      );
      pairs.forEach((p, i) => expect(p).toBe(`msg-${i}`));
    });

    it('handles very large plaintext', async () => {
      const large = 'x'.repeat(100000);
      const enc = await service.encrypt(large);
      const dec = await service.decrypt(enc);
      expect(dec).toBe(large);
    });

    it('rejects tampered ciphertext', async () => {
      const enc = await service.encrypt('data');
      enc.ciphertext = enc.ciphertext.replace(/^.{4}/, 'ffff');
      await expect(service.decrypt(enc)).rejects.toThrow();
    });
  });

  describe('SecretsManager edge cases', () => {
    let service: SecretsManager;

    beforeEach(() => { service = new SecretsManager(); });

    it('handles very long values', async () => {
      const long = 'x'.repeat(10000);
      await service.set('long-key', long);
      expect(await service.get('long-key')).toBe(long);
    });

    it('handles special characters in values', async () => {
      await service.set('special', '!\n\t\\"\';');
      expect(await service.get('special')).toBe('!\n\t\\"\';');
    });

    it('lists all entries regardless of environment', async () => {
      await service.set('global-key', 'val');
      const all = await service.list();
      expect(all.some((e) => e.key === 'global-key')).toBe(true);
    });

    it('handles concurrent set/get', async () => {
      const ops = Array.from({ length: 10 }, (_, i) => service.set(`k${i}`, `v${i}`));
      await Promise.all(ops);
      const values = await Promise.all(
        Array.from({ length: 10 }, (_, i) => service.get(`k${i}`)),
      );
      values.forEach((v, i) => expect(v).toBe(`v${i}`));
    });
  });

  describe('AuditLogService boundary', () => {
    let service: AuditLogService;

    beforeEach(() => { service = new AuditLogService(); });

    it('handles many concurrent records', async () => {
      await Promise.all(
        Array.from({ length: 100 }, (_, i) =>
          service.record({
            action: 'test', actorId: `user-${i}`, actorType: 'user',
            resourceType: 'test', resourceId: `res-${i}`, severity: 'info',
          }),
        ),
      );
      const result = await service.query({ page: 1, limit: 200 });
      expect(result.total).toBe(100);
    });

    it('handles very many filters simultaneously', async () => {
      await service.record({
        action: 'update', actorId: 'admin', actorType: 'user',
        resourceType: 'doc', resourceId: 'doc-1', severity: 'warning',
        workspaceId: 'ws-1',
      });
      const result = await service.query({
        actorId: 'admin', resourceType: 'doc', resourceId: 'doc-1',
        action: 'update', severity: 'warning', workspaceId: 'ws-1',
        page: 1, limit: 50,
      });
      expect(result.items).toHaveLength(1);
    });

    it('handles export with non-existent workspace', async () => {
      const result = await service.export('nonexistent', new Date('2000-01-01'), new Date());
      expect(result).toEqual([]);
    });
  });

  describe('SignedUrlService edge cases', () => {
    let service: SignedUrlService;

    beforeEach(() => { service = new SignedUrlService(); });

    it('generates URLs with special characters in path', async () => {
      const result = await service.generate({
        operation: 'download', bucket: 'docs',
        path: '/my documents/report (1).pdf', expiresIn: 300,
      });
      expect(result.url).toContain('report');
    });

    it('revokes token then reuses', async () => {
      const result = await service.generate({
        operation: 'upload', bucket: 'b', path: '/f', expiresIn: 60,
      });
      await service.revoke(result.token);
      expect(await service.verify(result.token, result.url)).toBe(false);
      // Revoking again should be harmless
      await expect(service.revoke(result.token)).resolves.not.toThrow();
    });

    it('handles concurrent generation and verify', async () => {
      const results = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          service.generate({ operation: 'download', bucket: 'b', path: `/f${i}`, expiresIn: 3600 }),
        ),
      );
      const verifications = await Promise.all(
        results.map((r) => service.verify(r.token, r.url)),
      );
      verifications.forEach((v) => expect(v).toBe(true));
    });
  });
});
