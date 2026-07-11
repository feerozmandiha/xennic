import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { IStatisticsRepository } from '../../application/ports/statistics-repository.interface.js';
import {
  ProviderStatisticsEntity,
  TimePeriod,
} from '../../domain/entities/provider-statistics.entity.js';

@Injectable()
export class PrismaStatisticsRepository implements IStatisticsRepository {
  async findByProviderId(
    providerId: string,
    timePeriod: TimePeriod,
  ): Promise<ProviderStatisticsEntity | null> {
    const row = await prisma.ai_provider_statistics.findFirst({
      where: { provider_id: providerId, time_period: timePeriod },
      orderBy: { recorded_at: 'desc' },
    });
    if (!row) return null;
    return ProviderStatisticsEntity.reconstitute(row);
  }

  async findLatestByProviderId(providerId: string): Promise<ProviderStatisticsEntity | null> {
    const row = await prisma.ai_provider_statistics.findFirst({
      where: { provider_id: providerId },
      orderBy: { recorded_at: 'desc' },
    });
    if (!row) return null;
    return ProviderStatisticsEntity.reconstitute(row);
  }

  async save(stats: ProviderStatisticsEntity): Promise<void> {
    await prisma.ai_provider_statistics.create({
      data: {
        id: stats.id,
        provider_id: stats.providerId,
        success_count: stats.successCount,
        failure_count: stats.failureCount,
        total_requests: stats.totalRequests,
        avg_latency_ms: stats.avgLatencyMs,
        p50_latency_ms: stats.p50LatencyMs,
        p95_latency_ms: stats.p95LatencyMs,
        p99_latency_ms: stats.p99LatencyMs,
        success_rate: stats.successRate,
        time_period: stats.timePeriod,
        recorded_at: stats.recordedAt,
        created_at: stats.createdAt,
      },
    });
  }

  async getAggregatedStats(providerId: string): Promise<{
    successRate: number;
    avgLatency: number;
    totalRequests: number;
  } | null> {
    const latest = await prisma.ai_provider_statistics.findFirst({
      where: { provider_id: providerId },
      orderBy: { recorded_at: 'desc' },
    });
    if (!latest) return null;
    return {
      successRate: latest.success_rate ?? 0,
      avgLatency: latest.avg_latency_ms ?? 0,
      totalRequests: latest.total_requests,
    };
  }
}
