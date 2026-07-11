import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { IHealthRepository } from '../../application/ports/health-repository.interface.js';
import {
  ProviderHealthEntity,
  HealthStatus,
} from '../../domain/entities/provider-health.entity.js';

@Injectable()
export class PrismaHealthRepository implements IHealthRepository {
  async findById(id: string): Promise<ProviderHealthEntity | null> {
    const row = await prisma.ai_provider_health.findUnique({ where: { id } });
    if (!row) return null;
    return ProviderHealthEntity.reconstitute(row);
  }

  async findByProviderId(providerId: string, limit = 20): Promise<ProviderHealthEntity[]> {
    const rows = await prisma.ai_provider_health.findMany({
      where: { provider_id: providerId },
      orderBy: { checked_at: 'desc' },
      take: limit,
    });
    return rows.map((r) => ProviderHealthEntity.reconstitute(r));
  }

  async findLatestByProviderId(providerId: string): Promise<ProviderHealthEntity | null> {
    const row = await prisma.ai_provider_health.findFirst({
      where: { provider_id: providerId },
      orderBy: { checked_at: 'desc' },
    });
    if (!row) return null;
    return ProviderHealthEntity.reconstitute(row);
  }

  async findUnhealthyProviders(): Promise<Array<{ providerId: string; status: HealthStatus }>> {
    const rows = await prisma.ai_provider_health.groupBy({
      by: ['provider_id', 'status'],
      where: { status: { in: ['degraded', 'unhealthy'] } },
      _max: { checked_at: true },
    });
    return rows.map((r) => ({ providerId: r.provider_id, status: r.status as HealthStatus }));
  }

  async save(health: ProviderHealthEntity): Promise<void> {
    await prisma.ai_provider_health.create({
      data: {
        id: health.id,
        provider_id: health.providerId,
        status: health.status,
        latency_ms: health.latencyMs,
        error_msg: health.errorMsg,
        checked_at: health.checkedAt,
        created_at: health.createdAt,
      },
    });
  }

  async deleteOlderThan(providerId: string, date: Date): Promise<void> {
    await prisma.ai_provider_health.deleteMany({
      where: { provider_id: providerId, checked_at: { lt: date } },
    });
  }
}
