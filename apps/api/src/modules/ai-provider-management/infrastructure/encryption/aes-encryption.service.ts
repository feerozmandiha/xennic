import { Injectable, Logger } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT = 'xennic-aes-salt-2026';

@Injectable()
export class AesEncryptionService {
  private readonly logger = new Logger(AesEncryptionService.name);
  private readonly masterKey: Buffer;

  constructor() {
    const key = process.env['AI_MASTER_KEY'];
    if (!key || key.length < 16) {
      this.logger.warn('AI_MASTER_KEY not set or too short — using development fallback');
      this.masterKey = scryptSync('xennic-dev-fallback-key-2026!!', SALT, 32);
    } else {
      this.masterKey = scryptSync(key, SALT, 32);
    }
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.masterKey, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decrypt(encryptedBlob: string): string {
    const parts = encryptedBlob.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted blob format');
    }
    const iv = Buffer.from(parts[0]!, 'hex');
    const authTag = Buffer.from(parts[1]!, 'hex');
    const encrypted = parts[2]!;
    const decipher = createDecipheriv(ALGORITHM, this.masterKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted: string = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) return '***';
    const prefix = apiKey.startsWith('sk-') ? 'sk-' : apiKey.substring(0, 3);
    const suffix = apiKey.slice(-4);
    return `${prefix}...${suffix}`;
  }
}
