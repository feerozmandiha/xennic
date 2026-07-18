import { Logger } from '@nestjs/common';
import type { WorkflowDefinition } from '../../domain/workflow-definition.entity.js';
import type { WorkflowTemplate } from '../../domain/workflow-template.entity.js';
import type {
  IWorkflowRepository,
  ListWorkflowOptions,
  ListTemplateOptions,
} from '../../domain/workflow-repository.interface.js';
import type { PaginatedResult } from '../../../shared/types/index.js';

export class InMemoryWorkflowRepository implements IWorkflowRepository {
  private readonly logger = new Logger(InMemoryWorkflowRepository.name);
  private readonly definitions = new Map<string, WorkflowDefinition>();
  private readonly templates = new Map<string, WorkflowTemplate>();
  private readonly nameIndex = new Map<string, WorkflowDefinition[]>();

  async save(entity: WorkflowDefinition): Promise<void> {
    this.definitions.set(`${entity.id}::v${entity.version}`, entity);

    const existing = this.nameIndex.get(entity.name) ?? [];
    const idx = existing.findIndex((e) => e.id === entity.id && e.version === entity.version);
    if (idx >= 0) {
      existing[idx] = entity;
    } else {
      existing.push(entity);
    }
    this.nameIndex.set(entity.name, existing);

    this.logger.debug(`Saved workflow definition ${entity.id} v${entity.version}`);
  }

  async get(id: string): Promise<WorkflowDefinition | null> {
    const versions = Array.from(this.definitions.values()).filter((e) => e.id === id);
    if (versions.length === 0) {
      return null;
    }
    return versions.reduce((latest, curr) => (curr.version > latest.version ? curr : latest));
  }

  async getByName(name: string, version?: number): Promise<WorkflowDefinition | null> {
    const versions = this.nameIndex.get(name);
    if (!versions || versions.length === 0) {
      return null;
    }
    if (version !== undefined) {
      return versions.find((v) => v.version === version) ?? null;
    }
    return versions.reduce((latest, curr) => (curr.version > latest.version ? curr : latest));
  }

  async list(options?: ListWorkflowOptions): Promise<PaginatedResult<WorkflowDefinition>> {
    let items = Array.from(this.definitions.values());

    if (options?.status) {
      items = items.filter((e) => e.status === options.status);
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;

    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
    };
  }

  async findByTrigger(type: string): Promise<WorkflowDefinition[]> {
    return Array.from(this.definitions.values()).filter((e) =>
      e.triggers.some((t) => t.type === type),
    );
  }

  async saveTemplate(template: WorkflowTemplate): Promise<void> {
    this.templates.set(template.id, template);
    this.logger.debug(`Saved workflow template ${template.id}`);
  }

  async findTemplates(options?: ListTemplateOptions): Promise<PaginatedResult<WorkflowTemplate>> {
    let items = Array.from(this.templates.values());

    if (options?.category) {
      items = items.filter((t) => t.category === options.category);
    }

    if (options?.tags && options.tags.length > 0) {
      const tagSet = new Set(options.tags);
      items = items.filter((t) => t.tags.some((tag) => tagSet.has(tag)));
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;

    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
    };
  }

  async delete(id: string): Promise<void> {
    const versions = Array.from(this.definitions.values()).filter((e) => e.id === id);
    for (const v of versions) {
      this.definitions.delete(`${v.id}::v${v.version}`);
    }

    const allEntries = Array.from(this.definitions.values());
    const namesToKeep = new Set(allEntries.map((e) => e.name));
    for (const [name] of this.nameIndex) {
      if (!namesToKeep.has(name)) {
        this.nameIndex.delete(name);
      } else {
        this.nameIndex.set(
          name,
          allEntries.filter((e) => e.name === name),
        );
      }
    }

    this.logger.debug(`Deleted workflow definition ${id}`);
  }
}
