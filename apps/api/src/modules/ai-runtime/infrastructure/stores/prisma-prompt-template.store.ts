import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IPromptTemplateStore } from '../../domain/interfaces/prompt-template-store.interface.js';
import { PromptTemplate } from '../../domain/types/prompt.types.js';
import type { TemplateSection, TemplateVariable } from '../../domain/types/prompt.types.js';

interface PromptRow {
  id: string;
  workspace_id: string | null;
  name: string;
  description: string;
  content: string;
  variables: unknown;
  version: number;
  created_by: string;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class PrismaPromptTemplateStore implements IPromptTemplateStore {
  async save(template: PromptTemplate): Promise<void> {
    const sectionsJson = JSON.stringify(template.sections);
    const variablesJson = { vars: template.variables, tags: template.tags };

    await prisma.prompt_templates.upsert({
      where: { id: template.id },
      create: {
        id: template.id,
        workspace_id: null,
        name: template.key,
        description: template.description,
        content: sectionsJson,
        variables: variablesJson as unknown as Record<string, unknown>,
        version: parseInt(template.version, 10) || 1,
        created_by: 'system',
        created_at: template.createdAt,
        updated_at: template.updatedAt,
      },
      update: {
        name: template.key,
        description: template.description,
        content: sectionsJson,
        variables: variablesJson as unknown as Record<string, unknown>,
        version: parseInt(template.version, 10) || 1,
        updated_by: 'system',
        updated_at: template.updatedAt,
      },
    });
  }

  async findByKey(key: string): Promise<PromptTemplate | null> {
    const row = (await prisma.prompt_templates.findFirst({
      where: { name: key },
      orderBy: { version: 'desc' },
    })) as unknown as PromptRow | null;
    if (!row) return null;

    return this.toEntity(row);
  }

  async findAll(tags?: string[]): Promise<PromptTemplate[]> {
    const rows = (await prisma.prompt_templates.findMany({
      orderBy: { updated_at: 'desc' },
    })) as unknown as PromptRow[];

    let templates = rows.map((row: PromptRow) => this.toEntity(row));

    if (tags && tags.length > 0) {
      templates = templates.filter((t: PromptTemplate) =>
        tags.some(tag => t.tags.includes(tag)),
      );
    }

    return templates;
  }

  async delete(id: string): Promise<void> {
    await prisma.prompt_templates.delete({ where: { id } });
  }

  private toEntity(row: PromptRow): PromptTemplate {
    let sections: TemplateSection[];
    try {
      sections = JSON.parse(row.content) as TemplateSection[];
    } catch {
      sections = [];
    }

    let templateVars: TemplateVariable[];
    let tags: string[];

    try {
      const parsed = row.variables as { vars?: TemplateVariable[]; tags?: string[] };
      templateVars = parsed?.vars ?? [];
      tags = parsed?.tags ?? [];
    } catch {
      templateVars = [];
      tags = [];
    }

    return new PromptTemplate(
      row.id,
      row.name,
      row.name,
      String(row.version),
      sections,
      templateVars,
      row.created_at,
      row.updated_at,
      row.description,
      tags,
    );
  }
}
