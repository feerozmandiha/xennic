import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IUsageRepository } from '../../application/ports/usage-repository.interface.js';
import { ProviderUsageEntity } from '../../domain/entities/provider-usage.entity.js';

const prisma = new PrismaClient();

@Injectable()
export class PrismaUsageRepository implements IUsageRepository {
  async findById(id: string): Promise<ProviderUsageEntity | null> {
    const row = await prisma.ai_provider_usage.findUnique({ where: { id } });
    if (!row) return null;
    return ProviderUsageEntity.reconstitute(row);
  }

  async findByProviderId(providerId: string, options?: { from?: Date; to?: Date }): Promise<ProviderUsageEntity[]> {
    const where: any = { provider_id: providerId };
    if (options?.from || options?.to) {
      where.period_start = {};
      if (options?.from) where.period_start.gte = options.from;
      if (options?.to) where.period_start.lte = options.to;
    }
    const rows = await prisma.ai_provider_usage.findMany({ where, orderBy: { period_start: 'desc' } });
    return rows.map(r => ProviderUsageEntity.reconstitute(r));
  }

  async findByPeriod(providerId: string, periodStart: Date, periodEnd: Date): Promise<ProviderUsageEntity | null> {
    const row = await prisma.ai_provider_usage.findFirst({
      where: { provider_id: providerId, period_start: periodStart, period_end: periodEnd },
    });
    if (!row) return null;
    return ProviderUsageEntity.reconstitute(row);
  }

  async save(usage: ProviderUsageEntity): Promise<void> {
    await prisma.ai_provider_usage.create({ data: {
      id: usage.id,
      provider_id: usage.providerId,
      model_id: usage.modelId,
      request_count: usage.requestCount,
      prompt_tokens: usage.promptTokens,
      completion_tokens: usage.completionTokens,
      total_tokens: usage.totalTokens,
      estimated_cost: usage.estimatedCost,
      period_start: usage.periodStart,
      period_end: usage.periodEnd,
      workspace_id: usage.workspaceId,
      created_at: usage.createdAt,
    }});
  }

  async getTotalTokens(providerId: string, from?: Date, to?: Date): Promise<bigint> {
    const where: any = { provider_id: providerId };
    if (from || to) {
      where.period_start = {};
      if (from) where.period_start.gte = from;
      if (to) where.period_start.lte = to;
    }
    const result = await prisma.ai_provider_usage.aggregate({
      where,
      _sum: { total_tokens: true },
    });
    return result._sum.total_tokens ?? BigInt(0);
  }

  async getTotalCost(providerId: string, from?: Date, to?: Date): Promise<number> {
    const where: any = { provider_id: providerId };
    if (from || to) {
      where.period_start = {};
      if (from) where.period_start.gte = from;
      if (to) where.period_start.lte = to;
    }
    const result = await prisma.ai_provider_usage.aggregate({
      where,
      _sum: { estimated_cost: true },
    });
    return result._sum.estimated_cost ?? 0;
  }
}
