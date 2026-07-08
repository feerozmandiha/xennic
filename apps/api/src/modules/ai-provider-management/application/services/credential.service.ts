import { Injectable } from '@nestjs/common';
import type { ICredentialRepository } from '../ports/credential-repository.interface.js';
import { ICREDENTIAL_REPOSITORY } from '../ports/credential-repository.interface.js';
import { Inject } from '@nestjs/common';
import { EncryptionService } from './encryption.service.js';

@Injectable()
export class CredentialService {
  constructor(
    @Inject(ICREDENTIAL_REPOSITORY)
    private readonly credentialRepo: ICredentialRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  async getApiKey(providerId: string): Promise<string | null> {
    const credential = await this.credentialRepo.findByType(providerId, 'api_key');
    if (!credential) return null;
    if (credential.isExpired()) return null;
    return this.encryptionService.decryptApiKey(credential.encryptedValue);
  }

  async getDecryptedCredentials(providerId: string): Promise<Array<{
    type: string; value: string; maskedValue: string;
  }>> {
    const credentials = await this.credentialRepo.findByProviderId(providerId);
    return credentials.map(c => ({
      type: c.credentialType,
      value: this.encryptionService.decryptApiKey(c.encryptedValue),
      maskedValue: c.maskedValue,
    }));
  }
}
