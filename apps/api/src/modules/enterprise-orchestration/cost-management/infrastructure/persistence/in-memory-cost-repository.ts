import { Injectable, Logger } from '@nestjs/common';
import { CostEntry, type SourceType } from '../../domain/cost-entry.entity.js';
import { ResourceUsage } from '../../domain/resource-usage.vo.js';
import type {
  ICostRepository,
  ListCostOptions,
  FindByExecutionOptions,
  FindBySourceOptions,
} from '../../domain/cost-repository.interface.js';
import type { PaginatedResult } from '../../../shared/types/index.js';

@Injectable()
export class InMemoryCostRepository implements ICostRepository {
  private readonly logger = new Logger(InMemoryCostRepository.name);
  private readonly entries = new Map<string, CostEntry>();
  private readonly executionIndex = new Map<string, Set<string>>();

  async saveEntry(entry: CostEntry): Promise<void> {
    this.entries.set(entry.id, entry);

    const execIds = this.executionIndex.get(entry.workflowExecutionId) ?? new Set();
    execIds.add(entry.id);
    this.executionIndex.set(entry.workflowExecutionId, execIds);

    this.logger.debug(`Saved cost entry ${entry.id}`);
  }

  async getEntry(id: string): Promise<CostEntry | null> {
    return this.entries.get(id) ?? null;
  }

  async findByExecution(
    executionId: string,
    options?: FindByExecutionOptions,
  ): Promise<PaginatedResult<CostEntry>> {
    const ids = this.executionIndex.get(executionId) ?? new Set();
    const items = [...ids].map(id => this.entries.get(id)!).filter(Boolean);

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;

    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
    };
  }

  async findBySource(
    sourceType: SourceType,
    sourceId: string,
    options?: FindBySourceOptions,
  ): Promise<PaginatedResult<CostEntry>> {
    const items = [...this.entries.values()].filter(
      e => e.sourceType === sourceType && e.sourceId === sourceId,
    );

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;

    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
    };
  }

  async getAggregates(executionId: string): Promise<ResourceUsage> {
    const ids = this.executionIndex.get(executionId) ?? new Set();
    const entries = [...ids].map(id => this.entries.get(id)!).filter(Boolean);

    return this.computeAggregates(entries);
  }

  async getAggregatesByWorkflow(workflowId: string): Promise<ResourceUsage> {
    const entries = [...this.entries.values()].filter(
      e => e.workflowExecutionId.startsWith(workflowId),
    );

    return this.computeAggregates(entries);
  }

  async getTopCosts(limit: number): Promise<CostEntry[]> {
    return [...this.entries.values()]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  }

  async list(options?: ListCostOptions): Promise<PaginatedResult<CostEntry>> {
    let items = [...this.entries.values()];

    if (options?.sourceType) {
      items = items.filter(e => e.sourceType === options.sourceType);
    }
    if (options?.from) {
      items = items.filter(e => e.timestamp >= options.from!);
    }
    if (options?.to) {
      items = items.filter(e => e.timestamp <= options.to!);
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

  private computeAggregates(entries: CostEntry[]): ResourceUsage {
    let totalTokens = 0;
    let totalCost = 0;
    let totalLatency = 0;
    const byProvider: Record<string, { tokens: number; cost: number; calls: number }> = {};
    const bySkill: Record<string, { tokens: number; cost: number; calls: number }> = {};

    for (const entry of entries) {
      totalCost += entry.amount;
      totalTokens += entry.tokens ?? 0;
      totalLatency += entry.latency ?? 0;

      if (entry.sourceType === 'provider') {
        const current = byProvider[entry.sourceId] ?? { tokens: 0, cost: 0, calls: 0 };
        current.tokens += entry.tokens ?? 0;
        current.cost += entry.amount;
        current.calls += 1;
        byProvider[entry.sourceId] = current;
      }

      if (entry.sourceType === 'skill') {
        const current = bySkill[entry.sourceId] ?? { tokens: 0, cost: 0, calls: 0 };
        current.tokens += entry.tokens ?? 0;
        current.cost += entry.amount;
        current.calls += 1;
        bySkill[entry.sourceId] = current;
      }
    }

    return ResourceUsage.create({
      totalTokens,
      totalCost,
      totalCalls: entries.length,
      totalLatency,
      byProvider,
      bySkill,
    });
  }
}
