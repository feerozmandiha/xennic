import type { SkillEntity } from './skill.entity.js';
import type { PaginatedResult } from '../../shared/types/index.js';

export interface ListOptions {
  offset?: number;
  limit?: number;
  status?: string;
  tag?: string;
}

export interface ISkillRegistry {
  register(entity: SkillEntity): Promise<void>;
  get(id: string): Promise<SkillEntity | null>;
  getByName(name: string, version?: number): Promise<SkillEntity | null>;
  list(options?: ListOptions): Promise<PaginatedResult<SkillEntity>>;
  findByDependency(skillId: string): Promise<SkillEntity[]>;
  findByTag(tag: string): Promise<SkillEntity[]>;
  findCapable(inputs: string[], outputs: string[]): Promise<SkillEntity[]>;
  update(id: string, partial: Partial<SkillEntity>): Promise<SkillEntity | null>;
  delete(id: string): Promise<void>;
}
