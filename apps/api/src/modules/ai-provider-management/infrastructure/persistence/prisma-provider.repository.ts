import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { prisma } from '@xennic/database';
import { IProviderRepository } from '../../application/ports/provider-repository.interface.js';
import { AIProviderEntity, ProviderType } from '../../domain/entities/ai-provider.entity.js';

@Injectable()
export class PrismaProviderRepository implements IProviderRepository {
  private readonly logger = new Logger(PrismaProviderRepository.name);

  async findById(id: string): Promise<AIProviderEntity | null> {
    const row = await prisma.ai_providers.findUnique({ where: { id } });
    if (!row) return null;
    return AIProviderEntity.reconstitute({
      ...row,
      headers: (row.headers as Record<string, string>) ?? {},
      metadata: (row.metadata as Record<string, unknown>) ?? {},
    });
  }

  async findByName(name: string): Promise<AIProviderEntity | null> {
    const row = await prisma.ai_providers.findUnique({ where: { name } });
    if (!row) return null;
    return AIProviderEntity.reconstitute({
      ...row,
      headers: (row.headers as Record<string, string>) ?? {},
      metadata: (row.metadata as Record<string, unknown>) ?? {},
    });
  }

  async findByType(type: ProviderType): Promise<AIProviderEntity[]> {
    const rows = await prisma.ai_providers.findMany({
      where: { provider_type: type, deleted_at: null },
    });
    return rows.map((r) =>
      AIProviderEntity.reconstitute({
        ...r,
        headers: (r.headers as Record<string, string>) ?? {},
        metadata: (r.metadata as Record<string, unknown>) ?? {},
      }),
    );
  }

  async findAll(options?: {
    enabled?: boolean;
    status?: string;
    includeDeleted?: boolean;
  }): Promise<AIProviderEntity[]> {
    const where: any = {};
    if (!options?.includeDeleted) where.deleted_at = null;
    if (options?.enabled !== undefined) where.enabled = options.enabled;
    if (options?.status) where.status = options.status;
    const rows = await prisma.ai_providers.findMany({ where, orderBy: { priority: 'asc' } });
    return rows.map((r) =>
      AIProviderEntity.reconstitute({
        ...r,
        headers: (r.headers as Record<string, string>) ?? {},
        metadata: (r.metadata as Record<string, unknown>) ?? {},
      }),
    );
  }

  async save(provider: AIProviderEntity): Promise<void> {
    await prisma.ai_providers.upsert({
      where: { id: provider.id },
      update: {
        display_name: provider.displayName,
        base_url: provider.baseUrl,
        org_id: provider.orgId,
        status: provider.status,
        enabled: provider.enabled,
        priority: provider.priority,
        default_weight: provider.defaultWeight,
        visibility: provider.visibility,
        headers: provider.headers as unknown as Prisma.InputJsonValue,
        metadata: provider.metadata as Prisma.InputJsonValue,
        updated_by: provider.updatedBy,
        updated_at: provider.updatedAt,
        deleted_at: provider.deletedAt,
      },
      create: {
        id: provider.id,
        name: provider.name,
        display_name: provider.displayName,
        provider_type: provider.providerType,
        base_url: provider.baseUrl,
        org_id: provider.orgId,
        status: provider.status,
        enabled: provider.enabled,
        priority: provider.priority,
        default_weight: provider.defaultWeight,
        visibility: provider.visibility,
        headers: provider.headers as unknown as Prisma.InputJsonValue,
        metadata: provider.metadata as Prisma.InputJsonValue,
        created_by: provider.createdBy,
        updated_by: provider.updatedBy,
        created_at: provider.createdAt,
        updated_at: provider.updatedAt,
        deleted_at: provider.deletedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.ai_providers.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async count(options?: { enabled?: boolean }): Promise<number> {
    const where: any = { deleted_at: null };
    if (options?.enabled !== undefined) where.enabled = options.enabled;
    return prisma.ai_providers.count({ where });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.ai_providers.count({ where: { id } });
    return count > 0;
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await prisma.ai_providers.count({ where: { name } });
    return count > 0;
  }
}
