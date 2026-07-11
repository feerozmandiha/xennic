import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IPluginRepository } from '../../application/ports/plugin-repository.interface.js';
import { CalculationPluginEntity } from '../../domain/entities/calculation-plugin.entity.js';

@Injectable()
export class PrismaPluginRepository implements IPluginRepository {
  private readonly logger = new Logger(PrismaPluginRepository.name);

  async findById(id: string): Promise<CalculationPluginEntity | null> {
    const row = await prisma.calculation_plugins.findUnique({ where: { id } });
    return row ? CalculationPluginEntity.reconstitute({ ...row, config: row.config as any }) : null;
  }

  async findBySlug(slug: string): Promise<CalculationPluginEntity | null> {
    const row = await prisma.calculation_plugins.findUnique({ where: { slug } });
    return row ? CalculationPluginEntity.reconstitute({ ...row, config: row.config as any }) : null;
  }

  async findAll(options?: { enabled?: boolean }): Promise<CalculationPluginEntity[]> {
    const where: Record<string, unknown> = {};
    if (options?.enabled !== undefined) where.enabled = options.enabled;
    const rows = await prisma.calculation_plugins.findMany({ where });
    return rows.map((r) => CalculationPluginEntity.reconstitute({ ...r, config: r.config as any }));
  }

  async save(plugin: CalculationPluginEntity): Promise<void> {
    await prisma.calculation_plugins.upsert({
      where: { id: plugin.id },
      update: {
        name: plugin.name,
        description: plugin.description,
        version: plugin.version,
        enabled: plugin.enabled,
        config: plugin.config as any,
        updated_at: plugin.updatedAt,
      },
      create: {
        id: plugin.id,
        slug: plugin.slug,
        name: plugin.name,
        description: plugin.description,
        version: plugin.version,
        enabled: plugin.enabled,
        config: plugin.config as any,
        created_at: plugin.createdAt,
        updated_at: plugin.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.calculation_plugins.delete({ where: { id } });
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await prisma.calculation_plugins.count({ where: { slug } });
    return count > 0;
  }
}
