import { ProviderUsageEntity } from '../../domain/entities/provider-usage.entity.js';

export interface IUsageRepository {
  findById(id: string): Promise<ProviderUsageEntity | null>;
  findByProviderId(
    providerId: string,
    options?: { from?: Date; to?: Date },
  ): Promise<ProviderUsageEntity[]>;
  findByPeriod(
    providerId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<ProviderUsageEntity | null>;
  save(usage: ProviderUsageEntity): Promise<void>;
  getTotalTokens(providerId: string, from?: Date, to?: Date): Promise<bigint>;
  getTotalCost(providerId: string, from?: Date, to?: Date): Promise<number>;
}

export const IUSAGE_REPOSITORY = 'IUsageRepository';
