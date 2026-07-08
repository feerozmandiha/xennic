import { Injectable } from '@nestjs/common';
import { AesEncryptionService } from '../../infrastructure/encryption/aes-encryption.service.js';

@Injectable()
export class EncryptionService {
  constructor(private readonly aes: AesEncryptionService) {}

  encryptApiKey(plaintext: string): string {
    return this.aes.encrypt(plaintext);
  }

  decryptApiKey(encryptedBlob: string): string {
    return this.aes.decrypt(encryptedBlob);
  }

  maskApiKey(apiKey: string): string {
    return this.aes.maskApiKey(apiKey);
  }
}
