import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ICostRepository } from '../domain/cost-repository.interface.js';
import { CostEntry, type SourceType } from '../domain/cost-entry.entity.js';

export interface CostBreakdown {
  sourceType: SourceType;
  totalCost: number;
  totalTokens: number;
  totalCalls: number;
  percentage: number;
}

export interface ExecutionComparison {
  executionId: string;
  totalCost: number;
  totalTokens: number;
  totalCalls: number;
  totalLatency: number;
  avgLatency: number;
}

export interface CostEstimate {
  estimatedCost: number;
  estimatedTokens: number;
  estimatedDuration: number;
  confidence: number;
}

interface WorkflowStep {
  type: 'provider' | 'skill' | 'tool';
  id: string;
  estimatedTokens?: number;
  estimatedCost?: number;
}

interface WorkflowDefinition {
  steps: WorkflowStep[];
}

@Injectable()
export class CostAnalysisService {
  private readonly logger = new Logger(CostAnalysisService.name);

  constructor(
    @Inject('ICostRepository')
    private readonly repository: ICostRepository,
  ) {}

  async analyzeExecution(executionId: string): Promise<CostBreakdown[]> {
    const all = await this.repository.findByExecution(executionId);
    const grouped = new Map<SourceType, { cost: number; tokens: number; calls: number }>();

    for (const entry of all.items) {
      const current = grouped.get(entry.sourceType) ?? { cost: 0, tokens: 0, calls: 0 };
      current.cost += entry.amount;
      current.tokens += entry.tokens ?? 0;
      current.calls += 1;
      grouped.set(entry.sourceType, current);
    }

    const totalCost = all.items.reduce((sum, e) => sum + e.amount, 0);

    const breakdown: CostBreakdown[] = [];
    for (const [sourceType, data] of grouped) {
      breakdown.push({
        sourceType,
        totalCost: data.cost,
        totalTokens: data.tokens,
        totalCalls: data.calls,
        percentage: totalCost > 0 ? (data.cost / totalCost) * 100 : 0,
      });
    }

    return breakdown.sort((a, b) => b.totalCost - a.totalCost);
  }

  async compareExecutions(ids: string[]): Promise<ExecutionComparison[]> {
    const results: ExecutionComparison[] = [];

    for (const executionId of ids) {
      const usage = await this.repository.getAggregates(executionId);
      results.push({
        executionId,
        totalCost: usage.totalCost,
        totalTokens: usage.totalTokens,
        totalCalls: usage.totalCalls,
        totalLatency: usage.totalLatency,
        avgLatency: usage.avgLatency,
      });
    }

    return results;
  }

  async getTopCostExecutions(limit: number = 10): Promise<CostEntry[]> {
    return this.repository.getTopCosts(limit);
  }

  async getCostBreakdown(executionId: string): Promise<
    { label: string; value: number; percentage: number }[]
  > {
    const all = await this.repository.findByExecution(executionId);
    const grouped = new Map<string, number>();

    for (const entry of all.items) {
      const label = `${entry.sourceType}:${entry.sourceId}`;
      grouped.set(label, (grouped.get(label) ?? 0) + entry.amount);
    }

    const totalCost = all.items.reduce((sum, e) => sum + e.amount, 0);

    return [...grouped.entries()]
      .map(([label, value]) => ({
        label,
        value,
        percentage: totalCost > 0 ? (value / totalCost) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }

  async estimateCost(workflowDefinition: WorkflowDefinition): Promise<CostEstimate> {
    let estimatedCost = 0;
    let estimatedTokens = 0;
    let estimatedDuration = 0;

    for (const step of workflowDefinition.steps) {
      if (step.estimatedCost) {
        estimatedCost += step.estimatedCost;
      }

      if (step.estimatedTokens) {
        estimatedTokens += step.estimatedTokens;
      }

      estimatedDuration += this.getAverageDurationForStep(step);
    }

    const confidence = workflowDefinition.steps.length > 0
      ? Math.min(0.9, 0.3 + workflowDefinition.steps.length * 0.1)
      : 0;

    return {
      estimatedCost,
      estimatedTokens,
      estimatedDuration,
      confidence,
    };
  }

  private getAverageDurationForStep(step: WorkflowStep): number {
    switch (step.type) {
      case 'provider':
        return 2000;
      case 'skill':
        return 5000;
      case 'tool':
        return 1000;
      default:
        return 3000;
    }
  }
}
