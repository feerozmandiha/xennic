import { Injectable, Inject, Logger } from '@nestjs/common';
import type {
  ICostRepository,
  FindByExecutionOptions,
} from '../domain/cost-repository.interface.js';
import { CostEntry } from '../domain/cost-entry.entity.js';
import { ResourceUsage } from '../domain/resource-usage.vo.js';
import type { PaginatedResult } from '../../shared/types/index.js';

@Injectable()
export class CostTrackingService {
  private readonly logger = new Logger(CostTrackingService.name);

  constructor(
    @Inject('ICostRepository')
    private readonly repository: ICostRepository,
  ) {}

  async recordProviderCost(
    executionId: string,
    provider: string,
    model: string,
    tokens: number,
    cost: number,
    latency?: number,
    metadata?: Record<string, unknown>,
  ): Promise<CostEntry> {
    const entry = CostEntry.create({
      workflowExecutionId: executionId,
      sourceType: 'provider',
      sourceId: `${provider}:${model}`,
      costType: 'token',
      amount: cost,
      tokens,
      latency: latency ?? null,
      metadata: { ...metadata, provider, model },
    });

    await this.repository.saveEntry(entry);
    this.logger.debug(`Recorded provider cost: ${provider}/${model} -> ${cost} for ${executionId}`);
    return entry;
  }

  async recordSkillCost(
    executionId: string,
    skillId: string,
    tokens: number,
    cost: number,
    latency?: number,
  ): Promise<CostEntry> {
    const entry = CostEntry.create({
      workflowExecutionId: executionId,
      sourceType: 'skill',
      sourceId: skillId,
      costType: 'token',
      amount: cost,
      tokens,
      latency: latency ?? null,
      metadata: { skillId },
    });

    await this.repository.saveEntry(entry);
    this.logger.debug(`Recorded skill cost: ${skillId} -> ${cost} for ${executionId}`);
    return entry;
  }

  async recordToolCost(executionId: string, toolId: string, cost: number): Promise<CostEntry> {
    const entry = CostEntry.create({
      workflowExecutionId: executionId,
      sourceType: 'tool',
      sourceId: toolId,
      costType: 'api_call',
      amount: cost,
      metadata: { toolId },
    });

    await this.repository.saveEntry(entry);
    this.logger.debug(`Recorded tool cost: ${toolId} -> ${cost} for ${executionId}`);
    return entry;
  }

  async recordWorkflowCost(executionId: string, cost: number): Promise<CostEntry> {
    const entry = CostEntry.create({
      workflowExecutionId: executionId,
      sourceType: 'workflow',
      sourceId: executionId,
      costType: 'compute',
      amount: cost,
    });

    await this.repository.saveEntry(entry);
    this.logger.debug(`Recorded workflow cost: ${executionId} -> ${cost}`);
    return entry;
  }

  async getExecutionCost(executionId: string): Promise<ResourceUsage> {
    return this.repository.getAggregates(executionId);
  }

  async getWorkflowCosts(
    workflowId: string,
    options?: FindByExecutionOptions,
  ): Promise<PaginatedResult<CostEntry>> {
    return this.repository.findByExecution(workflowId, options);
  }

  async getTopCosts(limit: number = 10): Promise<CostEntry[]> {
    return this.repository.getTopCosts(limit);
  }
}
