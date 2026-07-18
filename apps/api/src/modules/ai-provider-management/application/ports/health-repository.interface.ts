import {
  ProviderHealthEntity,
  HealthStatus,
} from '../../domain/entities/provider-health.entity.js';

export interface IHealthRepository {
  findById(id: string): Promise<ProviderHealthEntity | null>;
  findByProviderId(providerId: string, limit?: number): Promise<ProviderHealthEntity[]>;
  findLatestByProviderId(providerId: string): Promise<ProviderHealthEntity | null>;
  findUnhealthyProviders(): Promise<Array<{ providerId: string; status: HealthStatus }>>;
  save(health: ProviderHealthEntity): Promise<void>;
  deleteOlderThan(providerId: string, date: Date): Promise<void>;
}

export const IHEALTH_REPOSITORY = 'IHealthRepository';
