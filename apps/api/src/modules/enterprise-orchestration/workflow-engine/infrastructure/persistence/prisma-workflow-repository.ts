import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { WorkflowDefinition } from '../../domain/workflow-definition.entity.js';
import type { WorkflowTemplate } from '../../domain/workflow-template.entity.js';
import type {
  IWorkflowRepository,
  ListWorkflowOptions,
  ListTemplateOptions,
} from '../../domain/workflow-repository.interface.js';
import type { PaginatedResult } from '../../../shared/types/index.js';

@Injectable()
export class PrismaWorkflowRepository implements IWorkflowRepository {
  private readonly logger = new Logger(PrismaWorkflowRepository.name);

  async save(entity: WorkflowDefinition): Promise<void> {
    await prisma.workflow_definitions.upsert({
      where: { id: entity.id },
      create: {
        id: entity.id,
        name: entity.name,
        description: entity.description,
        version: entity.version,
        status: entity.status,
        triggers: entity.triggers as unknown as Record<string, unknown>,
        steps: entity.steps as unknown as Record<string, unknown>,
        metadata: { ...entity.metadata, timeout: entity.timeout } as unknown as Record<string, unknown>,
      },
      update: {
        name: entity.name,
        description: entity.description,
        version: entity.version,
        status: entity.status,
        triggers: entity.triggers as unknown as Record<string, unknown>,
        steps: entity.steps as unknown as Record<string, unknown>,
        metadata: { ...entity.metadata, timeout: entity.timeout } as unknown as Record<string, unknown>,
      },
    });
    this.logger.debug(`Saved workflow definition ${entity.id} v${entity.version}`);
  }

  async get(id: string): Promise<WorkflowDefinition | null> {
    const row = await prisma.workflow_definitions.findFirst({
      where: { id },
      orderBy: { version: 'desc' },
    });
    if (!row) return null;

    const { WorkflowDefinition: Wf } = await import('../../domain/workflow-definition.entity.js');
    const meta = row.metadata as Record<string, unknown> | null;
    return Wf.reconstitute(
      row.id,
      row.name,
      row.description,
      row.version,
      row.steps as unknown as any[],
      row.triggers as unknown as any[],
      (meta?.timeout as number | null) ?? null,
      meta as any ?? {},
      row.created_at,
      row.updated_at,
      row.status as any,
    ) as WorkflowDefinition;
  }

  async getByName(name: string, version?: number): Promise<WorkflowDefinition | null> {
    const where: Record<string, unknown> = { name };
    if (version !== undefined) {
      where.version = version;
    }
    const row = await prisma.workflow_definitions.findFirst({
      where: where as any,
      orderBy: version !== undefined ? undefined : { version: 'desc' },
    });
    if (!row) return null;

    const { WorkflowDefinition: Wf } = await import('../../domain/workflow-definition.entity.js');
    const meta = row.metadata as Record<string, unknown> | null;
    return Wf.reconstitute(
      row.id,
      row.name,
      row.description,
      row.version,
      row.steps as unknown as any[],
      row.triggers as unknown as any[],
      (meta?.timeout as number | null) ?? null,
      meta as any ?? {},
      row.created_at,
      row.updated_at,
      row.status as any,
    ) as WorkflowDefinition;
  }

  async list(options?: ListWorkflowOptions): Promise<PaginatedResult<WorkflowDefinition>> {
    const where: Record<string, unknown> = {};
    if (options?.status) {
      where.status = options.status;
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    const [rows, total] = await Promise.all([
      prisma.workflow_definitions.findMany({
        where: where as any,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.workflow_definitions.count({ where: where as any }),
    ]);

    const { WorkflowDefinition: Wf } = await import('../../domain/workflow-definition.entity.js');
    const items = rows.map(row => {
      const meta = row.metadata as Record<string, unknown> | null;
      return Wf.reconstitute(
        row.id,
        row.name,
        row.description,
        row.version,
        row.steps as unknown as any[],
        row.triggers as unknown as any[],
        (meta?.timeout as number | null) ?? null,
        meta as any ?? {},
        row.created_at,
        row.updated_at,
        row.status as any,
      ) as WorkflowDefinition;
    });

    return { items, total, offset, limit };
  }

  async findByTrigger(type: string): Promise<WorkflowDefinition[]> {
    const rows = await prisma.workflow_definitions.findMany();
    const filtered = rows.filter(row => {
      const triggers = row.triggers as unknown as Array<{ type: string }>;
      return triggers?.some(t => t.type === type);
    });

    const { WorkflowDefinition: Wf } = await import('../../domain/workflow-definition.entity.js');
    return filtered.map(row => {
      const meta = row.metadata as Record<string, unknown> | null;
      return Wf.reconstitute(
        row.id,
        row.name,
        row.description,
        row.version,
        row.steps as unknown as any[],
        row.triggers as unknown as any[],
        (meta?.timeout as number | null) ?? null,
        meta as any ?? {},
        row.created_at,
        row.updated_at,
        row.status as any,
      ) as WorkflowDefinition;
    });
  }

  async saveTemplate(template: WorkflowTemplate): Promise<void> {
    const def = template.definition as unknown as Record<string, unknown>;
    const variables = template.variables as unknown as Record<string, unknown>[];
    await prisma.workflow_templates.upsert({
      where: { id: template.id },
      create: {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        definition: { ...def, _version: template.version, _variables: variables, _metadata: template.metadata } as unknown as Record<string, unknown>,
      },
      update: {
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        definition: { ...def, _version: template.version, _variables: variables, _metadata: template.metadata } as unknown as Record<string, unknown>,
      },
    });
    this.logger.debug(`Saved workflow template ${template.id}`);
  }

  async findTemplates(options?: ListTemplateOptions): Promise<PaginatedResult<WorkflowTemplate>> {
    const where: Record<string, unknown> = {};
    if (options?.category) {
      where.category = options.category;
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    let rows = await prisma.workflow_templates.findMany({
      where: where as any,
      skip: offset,
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    if (options?.tags && options.tags.length > 0) {
      const tagSet = new Set(options.tags);
      rows = rows.filter(r => r.tags?.some(t => tagSet.has(t)));
    }

    const [total] = await Promise.all([
      prisma.workflow_templates.count({ where: where as any }),
    ]);

    const { WorkflowTemplate: Tpl } = await import('../../domain/workflow-template.entity.js');
    const items = rows.map(row => {
      const def = row.definition as Record<string, unknown>;
      const definition = { steps: def.steps, triggers: def.triggers, timeout: def.timeout ?? null } as any;
      const version = (def._version as number) ?? 1;
      const variables = (def._variables as any[]) ?? [];
      const metadata = (def._metadata as any) ?? {};
      return Tpl.reconstitute(
        row.id,
        row.name,
        row.description,
        version,
        definition,
        variables,
        row.category ?? '',
        row.tags ?? [],
        metadata,
      ) as WorkflowTemplate;
    });

    return { items, total, offset, limit };
  }

  async delete(id: string): Promise<void> {
    await prisma.workflow_definitions.deleteMany({ where: { id } });
    this.logger.debug(`Deleted workflow definition ${id}`);
  }
}
