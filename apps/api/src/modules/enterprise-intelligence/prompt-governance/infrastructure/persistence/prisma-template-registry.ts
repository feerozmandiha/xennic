import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { PaginatedResult, Metadata } from '../../../shared/types/index.js';
import {
  PromptTemplateEntity,
  type VariableDef,
} from '../../domain/prompt-template.entity.js';
import type { ITemplateRegistry, TemplateFindOptions } from '../../domain/prompt-template-registry.interface.js';

@Injectable()
export class PrismaTemplateRegistry implements ITemplateRegistry {
  private readonly logger = new Logger(PrismaTemplateRegistry.name);

  async register(entity: PromptTemplateEntity): Promise<void> {
    await prisma.prompt_templates.upsert({
      where: { id: entity.id },
      update: {
        name: entity.name,
        description: entity.description,
        content: entity.content,
        variables: [...entity.variables] as unknown as Record<string, unknown>,
        version: entity.version,
        created_by: entity.metadata.createdBy,
        updated_by: entity.metadata.updatedBy,
      },
      create: {
        id: entity.id,
        workspace_id: null,
        name: entity.name,
        description: entity.description,
        content: entity.content,
        variables: [...entity.variables] as unknown as Record<string, unknown>,
        version: entity.version,
        created_by: entity.metadata.createdBy,
        updated_by: entity.metadata.updatedBy,
      },
    });
    this.logger.debug(`Registered template ${entity.id}`);
  }

  async get(id: string): Promise<PromptTemplateEntity | null> {
    const row = await prisma.prompt_templates.findUnique({ where: { id } });
    if (!row) return null;
    return this.toEntity(row);
  }

  async getByName(name: string, version?: number): Promise<PromptTemplateEntity | null> {
    if (version !== undefined) {
      const row = await prisma.prompt_templates.findUnique({
        where: { name_version: { name, version } },
      });
      return row ? this.toEntity(row) : null;
    }
    const rows = await prisma.prompt_templates.findMany({
      where: { name },
      orderBy: { version: 'desc' },
      take: 1,
    });
    return rows.length > 0 ? this.toEntity(rows[0]!) : null;
  }

  async list(options?: TemplateFindOptions): Promise<PaginatedResult<PromptTemplateEntity>> {
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;
    const [items, total] = await Promise.all([
      prisma.prompt_templates.findMany({
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.prompt_templates.count(),
    ]);
    return {
      items: items.map(r => this.toEntity(r)),
      total,
      offset,
      limit,
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.prompt_templates.delete({ where: { id } });
  }

  private toEntity(r: {
    id: string;
    name: string;
    description: string;
    content: string;
    variables: unknown;
    version: number;
    created_by: string;
    updated_by: string | null;
    created_at: Date;
    updated_at: Date;
  }): PromptTemplateEntity {
    const metadata: Metadata = {
      createdBy: r.created_by,
      updatedBy: r.updated_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
    return PromptTemplateEntity.reconstitute(
      r.id,
      r.name,
      r.description,
      r.content,
      r.variables as VariableDef[],
      r.version,
      metadata,
      r.created_at,
      r.updated_at,
    );
  }
}
