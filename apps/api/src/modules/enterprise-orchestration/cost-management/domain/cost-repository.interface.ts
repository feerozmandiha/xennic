import type { PaginatedResult } from '../../shared/types/index.js';
import type { CostEntry, SourceType } from './cost-entry.entity.js';
import type { ResourceUsage } from './resource-usage.vo.js';

export interface ListCostOptions {
  offset?: number;
  limit?: number;
  sourceType?: SourceType;
  from?: Date;
  to?: Date;
}

export interface FindByExecutionOptions {
  offset?: number;
  limit?: number;
}

export interface FindBySourceOptions {
  offset?: number;
  limit?: number;
}

export interface ICostRepository {
  saveEntry(entry: CostEntry): Promise<void>;
  getEntry(id: string): Promise<CostEntry | null>;
  findByExecution(
    executionId: string,
    options?: FindByExecutionOptions,
  ): Promise<PaginatedResult<CostEntry>>;
  findBySource(
    sourceType: SourceType,
    sourceId: string,
    options?: FindBySourceOptions,
  ): Promise<PaginatedResult<CostEntry>>;
  getAggregates(executionId: string): Promise<ResourceUsage>;
  getAggregatesByWorkflow(workflowId: string): Promise<ResourceUsage>;
  getTopCosts(limit: number): Promise<CostEntry[]>;
  list(options?: ListCostOptions): Promise<PaginatedResult<CostEntry>>;
}
