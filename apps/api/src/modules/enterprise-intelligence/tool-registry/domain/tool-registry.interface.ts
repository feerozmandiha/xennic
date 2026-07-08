import type { ToolEntity } from './tool.entity.js';
import type { PaginatedResult } from '../../shared/types/index.js';

export interface ListOptions {
  offset?: number;
  limit?: number;
  status?: string;
}

export interface IToolRegistry {
  register(entity: ToolEntity): Promise<void>;
  get(id: string): Promise<ToolEntity | null>;
  getByName(name: string, version?: number): Promise<ToolEntity | null>;
  list(options?: ListOptions): Promise<PaginatedResult<ToolEntity>>;
  findByCapability(capability: string): Promise<ToolEntity[]>;
  update(id: string, partial: Partial<ToolEntity>): Promise<ToolEntity | null>;
  delete(id: string): Promise<void>;
}
