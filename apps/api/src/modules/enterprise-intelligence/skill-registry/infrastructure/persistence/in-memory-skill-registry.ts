import { Injectable, Logger } from '@nestjs/common';
import { SkillEntity } from '../../domain/skill.entity.js';
import type {
  ISkillRegistry,
  ListOptions,
} from '../../domain/skill-registry.interface.js';
import type { PaginatedResult } from '../../../shared/types/index.js';

@Injectable()
export class InMemorySkillRegistry implements ISkillRegistry {
  private readonly logger = new Logger(InMemorySkillRegistry.name);
  private readonly store = new Map<string, SkillEntity>();
  private readonly versions = new Map<string, SkillEntity[]>();

  async register(entity: SkillEntity): Promise<void> {
    this.store.set(entity.id, entity);
    this.logger.debug(`Registered skill ${entity.name} (${entity.id}) v${entity.version}`);
  }

  async get(id: string): Promise<SkillEntity | null> {
    return this.store.get(id) ?? null;
  }

  async getByName(name: string, version?: number): Promise<SkillEntity | null> {
    const candidates = Array.from(this.store.values()).filter(
      e => e.name === name,
    );
    if (version !== undefined) {
      const match = candidates.find(e => e.version === version);
      if (match) return match;
      const archived = this.versions.get(name);
      if (archived) {
        return archived.find(e => e.name === name && e.version === version) ?? null;
      }
      return null;
    }
    if (candidates.length === 0) return null;
    return candidates.reduce((latest, e) =>
      e.version > latest.version ? e : latest,
    );
  }

  async list(options?: ListOptions): Promise<PaginatedResult<SkillEntity>> {
    let items = Array.from(this.store.values());
    if (options?.status) {
      items = items.filter(e => e.status === options.status);
    }
    if (options?.tag) {
      items = items.filter(e => e.tags.includes(options.tag!));
    }
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;
    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
    };
  }

  async findByDependency(skillId: string): Promise<SkillEntity[]> {
    return Array.from(this.store.values()).filter(e =>
      e.dependencies.some(d => d.skillId === skillId),
    );
  }

  async findByTag(tag: string): Promise<SkillEntity[]> {
    return Array.from(this.store.values()).filter(e =>
      e.tags.includes(tag),
    );
  }

  async findCapable(inputs: string[], outputs: string[]): Promise<SkillEntity[]> {
    return Array.from(this.store.values()).filter(e => {
      const hasInputs = inputs.length === 0 ||
        inputs.every(inp => e.inputs.some(i => i.name === inp));
      const hasOutputs = outputs.length === 0 ||
        outputs.every(out => e.outputs.some(o => o.name === out));
      return hasInputs && hasOutputs;
    });
  }

  async update(
    id: string,
    partial: Partial<SkillEntity>,
  ): Promise<SkillEntity | null> {
    const existing = this.store.get(id);
    if (!existing) return null;

    const version = partial.version ?? existing.version;
    if (version !== existing.version) {
      const archived = this.versions.get(existing.name) ?? [];
      archived.push(existing);
      this.versions.set(existing.name, archived);
    }

    const updated = SkillEntity.reconstitute(
      partial.id ?? existing.id,
      partial.name ?? existing.name,
      partial.description ?? existing.description,
      version,
      partial.dependencies ?? existing.dependencies,
      partial.inputs ?? existing.inputs,
      partial.outputs ?? existing.outputs,
      partial.policies ?? existing.policies,
      partial.tags ?? existing.tags,
      partial.status ?? existing.status,
      partial.metadata ?? existing.metadata,
      existing.createdAt,
      new Date(),
    );
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const entity = this.store.get(id);
    if (entity) {
      this.versions.delete(entity.name);
    }
    this.store.delete(id);
  }
}
