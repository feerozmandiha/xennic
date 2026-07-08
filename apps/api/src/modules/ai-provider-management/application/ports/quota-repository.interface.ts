import { ProviderQuotaEntity } from '../../domain/entities/provider-quota.entity.js';

export interface IQuotaRepository {
  findByProviderId(providerId: string): Promise<ProviderQuotaEntity | null>;
  save(quota: ProviderQuotaEntity): Promise<void>;
}

export const IQUOTA_REPOSITORY = 'IQuotaRepository';
