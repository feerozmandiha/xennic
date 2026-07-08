import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
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
export class PrismaCostRepository implements ICostRepository {
  private readonly logger = new Logger(PrismaCostRepository.name);

  async saveEntry(entry: CostEntry): Promise<void> {
    await prisma.cost_entries.upsert({
      where: { id: entry.id },
      create: {
        id: entry.id,
        execution_id: entry.workflowExecutionId,
        source_type: entry.sourceType,
        source_id: entry.sourceId,
        amount: entry.amount,
        currency: entry.currency,
        description: null,
        metadata: {
          costType: entry.costType,
          tokens: entry.tokens,
          latency: entry.latency,
          ...entry.metadata,
        } as unknown as Record<string, unknown>,
      },
      update: {
        amount: entry.amount,
        currency: entry.currency,
        metadata: {
          costType: entry.costType,
          tokens: entry.tokens,
          latency: entry.latency,
          ...entry.metadata,
        } as unknown as Record<string, unknown>,
      },
    });
    this.logger.debug(`Saved cost entry ${entry.id}`);
  }

  async getEntry(id: string): Promise<CostEntry | null> {
    const row = await prisma.cost_entries.findUnique({ where: { id } });
    if (!row) return null;

    return this.rowToEntry(row);
  }

  async findByExecution(executionId: string, options?: FindByExecutionOptions): Promise<PaginatedResult<CostEntry>> {
    const where = { execution_id: executionId };
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    const [rows, total] = await Promise.all([
      prisma.cost_entries.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.cost_entries.count({ where }),
    ]);

    return {
      items: rows.map(row => this.rowToEntry(row)),
      total,
      offset,
      limit,
    };
  }

  async findBySource(sourceType: SourceType, sourceId: string, options?: FindBySourceOptions): Promise<PaginatedResult<CostEntry>> {
    const where = { source_type: sourceType, source_id: sourceId };
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    const [rows, total] = await Promise.all([
      prisma.cost_entries.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.cost_entries.count({ where }),
    ]);

    return {
      items: rows.map(row => this.rowToEntry(row)),
      total,
      offset,
      limit,
    };
  }

  async getAggregates(executionId: string): Promise<ResourceUsage> {
    const entries = await this.getEntriesByExecution(executionId);
    return this.computeAggregates(entries);
  }

  async getAggregatesByWorkflow(workflowId: string): Promise<ResourceUsage> {
    const rows = await prisma.cost_entries.findMany({
      where: { execution_id: { startsWith: workflowId } },
    });
    const entries = rows.map(row => this.rowToEntry(row));
    return this.computeAggregates(entries);
  }

  async getTopCosts(limit: number): Promise<CostEntry[]> {
    const rows = await prisma.cost_entries.findMany({
      orderBy: { amount: 'desc' },
      take: limit,
    });
    return rows.map(row => this.rowToEntry(row));
  }

  async list(options?: ListCostOptions): Promise<PaginatedResult<CostEntry>> {
    const where: Record<string, unknown> = {};
    if (options?.sourceType) {
      where.source_type = options.sourceType;
    }
    if (options?.from || options?.to) {
      where.created_at = {};
      if (options?.from) (where.created_at as any).gte = options.from;
      if (options?.to) (where.created_at as any).lte = options.to;
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    const [rows, total] = await Promise.all([
      prisma.cost_entries.findMany({
        where: where as any,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.cost_entries.count({ where: where as any }),
    ]);

    return {
      items: rows.map(row => this.rowToEntry(row)),
      total,
      offset,
      limit,
    };
  }

  private async getEntriesByExecution(executionId: string): Promise<CostEntry[]> {
    const rows = await prisma.cost_entries.findMany({
      where: { execution_id: executionId },
    });
    return rows.map(row => this.rowToEntry(row));
  }

  private rowToEntry(row: any): CostEntry {
    const meta = (row.metadata as Record<string, unknown>) ?? {};
    return CostEntry.reconstitute(
      row.id,
      row.execution_id,
      row.source_type as SourceType,
      row.source_id,
      (meta.costType as any) ?? 'api_call',
      row.amount,
      row.currency as any,
      (meta.tokens as number | null) ?? null,
      (meta.latency as number | null) ?? null,
      meta as Record<string, unknown>,
      row.created_at,
    );
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
