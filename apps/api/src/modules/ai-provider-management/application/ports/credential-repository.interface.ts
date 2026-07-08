import { ProviderCredentialEntity, CredentialType } from '../../domain/entities/provider-credential.entity.js';

export interface ICredentialRepository {
  findById(id: string): Promise<ProviderCredentialEntity | null>;
  findByProviderId(providerId: string): Promise<ProviderCredentialEntity[]>;
  findByType(providerId: string, type: CredentialType): Promise<ProviderCredentialEntity | null>;
  save(credential: ProviderCredentialEntity): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByProviderId(providerId: string): Promise<void>;
}

export const ICREDENTIAL_REPOSITORY = 'ICredentialRepository';
