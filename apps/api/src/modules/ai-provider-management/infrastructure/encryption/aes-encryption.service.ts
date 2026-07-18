import { Injectable, Logger } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

@Injectable()
export class AesEncryptionService {
  private readonly logger = new Logger(AesEncryptionService.name);
  private readonly masterKey: Buffer;

  constructor() {
    const key = process.env['AI_MASTER_KEY'];
    const salt = process.env['AI_MASTER_KEY_SALT'] || '';
    if (!key || key.length < 16) {
      throw new Error(
        'AI_MASTER_KEY is not set or too short (minimum 16 chars). ' +
          'Set it in your .env file — see .env.example for reference.',
      );
    }
    this.masterKey = scryptSync(key, salt, 32);
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
