import { Injectable, Logger } from '@nestjs/common';
import type { IStatisticsRepository } from '../ports/statistics-repository.interface.js';
import { ISTATISTICS_REPOSITORY } from '../ports/statistics-repository.interface.js';
import type { IUsageRepository } from '../ports/usage-repository.interface.js';
import { IUSAGE_REPOSITORY } from '../ports/usage-repository.interface.js';
import type { IHealthRepository } from '../ports/health-repository.interface.js';
import { IHEALTH_REPOSITORY } from '../ports/health-repository.interface.js';
import { Inject } from '@nestjs/common';
import { ProviderStatisticsEntity } from '../../domain/entities/provider-statistics.entity.js';
import { CircuitBreakerService } from '../../infrastructure/circuit-breaker/circuit-breaker.service.js';

@Injectable()
export class ProviderMetricsService {
  private readonly logger = new Logger(ProviderMetricsService.name);

  constructor(
    @Inject(ISTATISTICS_REPOSITORY)
    private readonly statsRepo: IStatisticsRepository,
    @Inject(IUSAGE_REPOSITORY)
    private readonly usageRepo: IUsageRepository,
    @Inject(IHEALTH_REPOSITORY)
    private readonly healthRepo: IHealthRepository,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  async recordStats(providerId: string, success: boolean, latencyMs: number): Promise<void> {
    const existing = await this.statsRepo.findLatestByProviderId(providerId);
    const data = existing ? {
      successCount: existing.successCount + (success ? 1 : 0),
      failureCount: existing.failureCount + (success ? 0 : 1),
      totalRequests: existing.totalRequests + 1,
      avgLatencyMs: existing.avgLatencyMs
        ? (existing.avgLatencyMs * existing.totalRequests + latencyMs) / (existing.totalRequests + 1)
        : latencyMs,
    } : {
      successCount: success ? 1 : 0,
      failureCount: success ? 0 : 1,
      totalRequests: 1,
      avgLatencyMs: latencyMs,
    };

    const stats = ProviderStatisticsEntity.create(providerId, '5m', {
      ...data,
      successRate: data.totalRequests > 0 ? (data.successCount / data.totalRequests) * 100 : 0,
    });

    await this.statsRepo.save(stats);
  }

  async getStats(providerId: string): Promise<{
    stats: ProviderStatisticsEntity | null;
    circuitBreaker: { state: string; failureCount: number; successCount: number } | null;
    totalTokens: string;
    totalCost: number;
  }> {
    const stats = await this.statsRepo.findLatestByProviderId(providerId);
    const cb = this.circuitBreaker.getMetrics(providerId);
    const totalTokens = await this.usageRepo.getTotalTokens(providerId);
    const totalCost = await this.usageRepo.getTotalCost(providerId);

    return {
      stats,
      circuitBreaker: cb,
      totalTokens: totalTokens.toString(),
      totalCost,
    };
  }

  async getAggregatedMetrics(): Promise<{
    totalProviders: number; healthyCount: number; degradedCount: number; unhealthyCount: number;
  }> {
    const unhealthy = await this.healthRepo.findUnhealthyProviders();
    const unhealthyCount = unhealthy.filter(u => u.status === 'unhealthy').length;
    const degradedCount = unhealthy.filter(u => u.status === 'degraded').length;
    return {
      totalProviders: 0,
      healthyCount: 0,
      degradedCount,
      unhealthyCount,
    };
  }
}
