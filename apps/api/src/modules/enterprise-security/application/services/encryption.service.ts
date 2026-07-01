import { Injectable, Logger } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, createHash, scryptSync } from 'node:crypto';
import type { IEncryptionService } from '../../domain/interfaces/security-interfaces.js';
import type { EncryptedData } from '../../domain/types/security.types.js';
import { EncryptionAlgorithm } from '../../domain/types/security.types.js';

@Injectable()
export class EncryptionService implements IEncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private masterKey: Buffer;
  private keyVersion = 1;

  constructor() {
    const envKey = process.env.ENCRYPTION_MASTER_KEY;
    this.masterKey = envKey
      ? Buffer.from(envKey, 'hex')
      : scryptSync('xennic-dev-master-key-change-in-production', 'salt', 32);
  }

  async encrypt(plaintext: string, context?: string): Promise<EncryptedData> {
    const iv = randomBytes(16);
    const key = this.deriveKey(context);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return { iv: iv.toString('hex'), ciphertext, tag, algorithm: EncryptionAlgorithm.AES_256_GCM, keyId: `v${this.keyVersion}` };
  }

  async decrypt(data: EncryptedData, context?: string): Promise<string> {
    const key = this.deriveKey(context);
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(data.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(data.tag, 'hex'));
    let plaintext = decipher.update(data.ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');
    return plaintext;
  }

  async generateKey(): Promise<string> {
    return randomBytes(32).toString('hex');
  }

  async rotateKey(keyId: string): Promise<void> {
    this.keyVersion++;
    this.masterKey = randomBytes(32);
    this.logger.log(`Key rotated: ${keyId} → v${this.keyVersion}`);
  }

  private deriveKey(context?: string): Buffer {
    if (!context) return this.masterKey;
    return scryptSync(this.masterKey, context, 32);
  }
}
