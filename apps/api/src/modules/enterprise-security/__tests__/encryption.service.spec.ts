import { EncryptionService } from '../application/services/encryption.service.js';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(() => {
    service = new EncryptionService();
  });

  it('encrypts and decrypts data', async () => {
    const plaintext = 'sensitive-data-123';
    const encrypted = await service.encrypt(plaintext);
    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.tag).toBeDefined();
    expect(encrypted.algorithm).toBe('aes-256-gcm');
    expect(encrypted.keyId).toBe('v1');
    const decrypted = await service.decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('encrypts with context-derived key', async () => {
    const plaintext = 'ctx-data';
    const encrypted = await service.encrypt(plaintext, 'workspace-42');
    const decrypted = await service.decrypt(encrypted, 'workspace-42');
    expect(decrypted).toBe(plaintext);
  });

  it('fails to decrypt with wrong context', async () => {
    const encrypted = await service.encrypt('secret', 'ctx-a');
    await expect(service.decrypt(encrypted, 'ctx-b')).rejects.toThrow();
  });

  it('generates a new key', async () => {
    const key = await service.generateKey();
    expect(key).toBeDefined();
    expect(key.length).toBe(64);
  });

  it('rotates key and uses new key for subsequent encrypts', async () => {
    const v1 = await service.encrypt('data');
    expect(v1.keyId).toBe('v1');
    await service.rotateKey('v1');
    const v2 = await service.encrypt('data');
    expect(v2.keyId).toBe('v2');
    const content = await service.decrypt(v2);
    expect(content).toBe('data');
  });

  it('handles empty string', async () => {
    const encrypted = await service.encrypt('');
    const decrypted = await service.decrypt(encrypted);
    expect(decrypted).toBe('');
  });

  it('handles unicode characters', async () => {
    const plaintext = 'داده‌های محرمانه 🔒';
    const encrypted = await service.encrypt(plaintext);
    const decrypted = await service.decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('produces different ciphertexts for same plaintext', async () => {
    const a = await service.encrypt('same');
    const b = await service.encrypt('same');
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  it('fails to decrypt with tampered ciphertext', async () => {
    const encrypted = await service.encrypt('data');
    encrypted.ciphertext = encrypted.ciphertext.replace(/^.{4}/, 'ffff');
    await expect(service.decrypt(encrypted)).rejects.toThrow();
  });

  it('fails to decrypt with tampered iv', async () => {
    const encrypted = await service.encrypt('data');
    encrypted.iv = '0'.repeat(32);
    await expect(service.decrypt(encrypted)).rejects.toThrow();
  });
});
