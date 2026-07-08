import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ISkillRegistry, ListOptions } from '../domain/skill-registry.interface.js';
import { SkillEntity, SkillStatus } from '../domain/skill.entity.js';
import type { SkillDependency, SkillIO } from '../domain/skill.entity.js';
import type { PaginatedResult } from '../../shared/types/index.js';

export interface RegisterSkillData {
  name: string;
  description: string;
  dependencies: SkillDependency[];
  inputs: SkillIO[];
  outputs: SkillIO[];
  policies: string[];
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface ResolvedDependencies {
  resolved: SkillEntity[];
  circular: string[][];
}

@Injectable()
export class SkillRegistryService {
  private readonly logger = new Logger(SkillRegistryService.name);

  constructor(
    @Inject('ISkillRegistry') private readonly registry: ISkillRegistry,
  ) {}

  async register(data: RegisterSkillData): Promise<SkillEntity> {
    const entity = SkillEntity.create(
      data.name,
      data.description,
      data.dependencies,
      data.inputs,
      data.outputs,
      data.policies,
      data.tags,
      data.metadata,
    );
    await this.registry.register(entity);
    this.logger.log(`Registered skill "${data.name}" (${entity.id}) v${entity.version}`);
    return entity;
  }

  async get(id: string): Promise<SkillEntity | null> {
    return this.registry.get(id);
  }

  async getByName(name: string, version?: number): Promise<SkillEntity | null> {
    return this.registry.getByName(name, version);
  }

  async list(options?: ListOptions): Promise<PaginatedResult<SkillEntity>> {
    return this.registry.list(options);
  }

  async findByTag(tag: string): Promise<SkillEntity[]> {
    return this.registry.findByTag(tag);
  }

  async findByDependency(skillId: string): Promise<SkillEntity[]> {
    return this.registry.findByDependency(skillId);
  }

  async findCapable(inputs: string[], outputs: string[]): Promise<SkillEntity[]> {
    return this.registry.findCapable(inputs, outputs);
  }

  async update(
    id: string,
    partial: Partial<SkillEntity>,
  ): Promise<SkillEntity | null> {
    return this.registry.update(id, partial);
  }

  async createVersion(id: string): Promise<SkillEntity | null> {
    const entity = await this.registry.get(id);
    if (!entity) return null;
    return this.registry.update(id, {
      version: entity.version + 1,
    } as Partial<SkillEntity>);
  }

  async deprecate(id: string): Promise<SkillEntity | null> {
    return this.registry.update(id, {
      status: SkillStatus.DEPRECATED,
    } as Partial<SkillEntity>);
  }

  async delete(id: string): Promise<void> {
    await this.registry.delete(id);
    this.logger.log(`Deleted skill ${id}`);
  }

  async resolveDependencies(skillId: string): Promise<ResolvedDependencies> {
    const visited = new Set<string>();
    const resolved: SkillEntity[] = [];
    const circular: string[][] = [];
    const path: string[] = [];

    const dfs = async (currentId: string): Promise<void> => {
      const cycleIndex = path.indexOf(currentId);
      if (cycleIndex !== -1) {
        circular.push(path.slice(cycleIndex));
        return;
      }
      if (visited.has(currentId)) return;

      visited.add(currentId);
      path.push(currentId);

      const skill = await this.registry.get(currentId);
      if (skill) {
        resolved.push(skill);
        for (const dep of skill.dependencies) {
          if (!dep.optional) {
            await dfs(dep.skillId);
          }
        }
      }

      path.pop();
    };

    await dfs(skillId);
    return { resolved, circular };
  }
}
