import {
  ProviderStatisticsEntity,
  TimePeriod,
} from '../../domain/entities/provider-statistics.entity.js';

export interface IStatisticsRepository {
  findByProviderId(
    providerId: string,
    timePeriod: TimePeriod,
  ): Promise<ProviderStatisticsEntity | null>;
  findLatestByProviderId(providerId: string): Promise<ProviderStatisticsEntity | null>;
  save(stats: ProviderStatisticsEntity): Promise<void>;
  getAggregatedStats(providerId: string): Promise<{
    successRate: number;
    avgLatency: number;
    totalRequests: number;
  } | null>;
}

export const ISTATISTICS_REPOSITORY = 'IStatisticsRepository';
