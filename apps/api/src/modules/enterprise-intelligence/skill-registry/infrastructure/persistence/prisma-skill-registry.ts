import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { SkillEntity, type SkillStatus, type SkillDependency, type SkillIO } from '../../domain/skill.entity.js';
import type {
  ISkillRegistry,
  ListOptions,
} from '../../domain/skill-registry.interface.js';
import type { PaginatedResult } from '../../../shared/types/index.js';

@Injectable()
export class PrismaSkillRegistry implements ISkillRegistry {
  private readonly logger = new Logger(PrismaSkillRegistry.name);

  async register(entity: SkillEntity): Promise<void> {
    await prisma.skill_registry.upsert({
      where: { id: entity.id },
      update: {
        name: entity.name,
        description: entity.description,
        version: entity.version,
        dependencies: entity.dependencies as unknown as Record<string, unknown>,
        inputs: entity.inputs as unknown as Record<string, unknown>,
        outputs: entity.outputs as unknown as Record<string, unknown>,
        policies: entity.policies,
        tags: entity.tags,
        status: entity.status,
        metadata: entity.metadata as Record<string, unknown>,
      },
      create: {
        id: entity.id,
        workspace_id: null,
        name: entity.name,
        description: entity.description,
        version: entity.version,
        dependencies: entity.dependencies as unknown as Record<string, unknown>,
        inputs: entity.inputs as unknown as Record<string, unknown>,
        outputs: entity.outputs as unknown as Record<string, unknown>,
        policies: entity.policies,
        tags: entity.tags,
        status: entity.status,
        metadata: entity.metadata as Record<string, unknown>,
      },
    });
    this.logger.debug(`Registered skill ${entity.name} (${entity.id}) v${entity.version}`);
  }

  async get(id: string): Promise<SkillEntity | null> {
    const row = await prisma.skill_registry.findUnique({ where: { id } });
    if (!row) return null;
    return this.toEntity(row);
  }

  async getByName(name: string, version?: number): Promise<SkillEntity | null> {
    if (version !== undefined) {
      const row = await prisma.skill_registry.findUnique({
        where: { name_version: { name, version } },
      });
      return row ? this.toEntity(row) : null;
    }
    const rows = await prisma.skill_registry.findMany({
      where: { name },
      orderBy: { version: 'desc' },
      take: 1,
    });
    return rows.length > 0 ? this.toEntity(rows[0]!) : null;
  }

  async list(options?: ListOptions): Promise<PaginatedResult<SkillEntity>> {
    const where: Record<string, unknown> = {};
    if (options?.status) where.status = options.status;
    if (options?.tag) where.tags = { has: options.tag };
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;
    const [items, total] = await Promise.all([
      prisma.skill_registry.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.skill_registry.count({ where }),
    ]);
    return {
      items: items.map(r => this.toEntity(r)),
      total,
      offset,
      limit,
    };
  }

  async findByDependency(skillId: string): Promise<SkillEntity[]> {
    const rows = await prisma.skill_registry.findMany();
    return rows
      .filter(r => {
        const deps = r.dependencies as unknown as SkillDependency[];
        return deps.some(d => d.skillId === skillId);
      })
      .map(r => this.toEntity(r));
  }

  async findByTag(tag: string): Promise<SkillEntity[]> {
    const rows = await prisma.skill_registry.findMany({
      where: { tags: { has: tag } },
    });
    return rows.map(r => this.toEntity(r));
  }

  async findCapable(inputs: string[], outputs: string[]): Promise<SkillEntity[]> {
    const rows = await prisma.skill_registry.findMany();
    return rows
      .filter(r => {
        const skillInputs = r.inputs as unknown as SkillIO[];
        const skillOutputs = r.outputs as unknown as SkillIO[];
        const hasInputs = inputs.length === 0 ||
          inputs.every(inp => skillInputs.some(i => i.name === inp));
        const hasOutputs = outputs.length === 0 ||
          outputs.every(out => skillOutputs.some(o => o.name === out));
        return hasInputs && hasOutputs;
      })
      .map(r => this.toEntity(r));
  }

  async update(
    id: string,
    partial: Partial<SkillEntity>,
  ): Promise<SkillEntity | null> {
    const existing = await prisma.skill_registry.findUnique({ where: { id } });
    if (!existing) return null;

    const version = partial.version ?? existing.version;
    const updated = SkillEntity.reconstitute(
      partial.id ?? existing.id,
      partial.name ?? existing.name,
      partial.description ?? existing.description,
      version,
      partial.dependencies ?? (existing.dependencies as unknown as SkillDependency[]),
      partial.inputs ?? (existing.inputs as unknown as SkillIO[]),
      partial.outputs ?? (existing.outputs as unknown as SkillIO[]),
      partial.policies ?? existing.policies,
      partial.tags ?? existing.tags,
      partial.status ?? (existing.status as SkillStatus),
      partial.metadata ?? (existing.metadata as Record<string, unknown>),
      existing.created_at,
      new Date(),
    );

    await this.register(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await prisma.skill_registry.delete({ where: { id } }).catch(() => {});
  }

  private toEntity(r: {
    id: string;
    name: string;
    description: string;
    version: number;
    dependencies: unknown;
    inputs: unknown;
    outputs: unknown;
    policies: string[];
    tags: string[];
    status: string;
    metadata: unknown;
    created_at: Date;
    updated_at: Date;
  }): SkillEntity {
    return SkillEntity.reconstitute(
      r.id,
      r.name,
      r.description,
      r.version,
      r.dependencies as unknown as SkillDependency[],
      r.inputs as unknown as SkillIO[],
      r.outputs as unknown as SkillIO[],
      r.policies,
      r.tags,
      r.status as SkillStatus,
      r.metadata as Record<string, unknown>,
      r.created_at,
      r.updated_at,
    );
  }
}
