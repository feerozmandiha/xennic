import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { IQuotaRepository } from '../../application/ports/quota-repository.interface.js';
import { ProviderQuotaEntity } from '../../domain/entities/provider-quota.entity.js';

@Injectable()
export class PrismaQuotaRepository implements IQuotaRepository {
  async findByProviderId(providerId: string): Promise<ProviderQuotaEntity | null> {
    const row = await prisma.ai_provider_quotas.findUnique({ where: { provider_id: providerId } });
    if (!row) return null;
    return ProviderQuotaEntity.reconstitute(row);
  }

  async save(quota: ProviderQuotaEntity): Promise<void> {
    await prisma.ai_provider_quotas.upsert({
      where: { id: quota.id },
      update: {
        requests_per_min: quota.requestsPerMin,
        tokens_per_min: quota.tokensPerMin,
        concurrent_max: quota.concurrentMax,
        updated_at: quota.updatedAt,
      },
      create: {
        id: quota.id,
        provider_id: quota.providerId,
        requests_per_min: quota.requestsPerMin,
        tokens_per_min: quota.tokensPerMin,
        concurrent_max: quota.concurrentMax,
        created_at: quota.createdAt,
        updated_at: quota.updatedAt,
      },
    });
  }
}
