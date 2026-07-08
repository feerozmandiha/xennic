import { Injectable, Logger } from '@nestjs/common';
import type { ICostRepository } from '../domain/cost-repository.interface.js';
import { Inject } from '@nestjs/common';

export type BudgetScope = 'workspace' | 'project' | 'workflow';
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface BudgetConfig {
  scope: BudgetScope;
  scopeId: string;
  limit: number;
  period: BudgetPeriod;
}

export interface BudgetStatus {
  withinLimit: boolean;
  currentSpend: number;
  limit: number;
  remaining: number;
}

export interface SpendReport {
  scope: BudgetScope;
  scopeId: string;
  from: Date;
  to: Date;
  totalSpend: number;
  entries: number;
}

@Injectable()
export class BudgetService {
  private readonly logger = new Logger(BudgetService.name);
  private readonly budgets = new Map<string, BudgetConfig>();

  constructor(
    @Inject('ICostRepository')
    private readonly repository: ICostRepository,
  ) {}

  private budgetKey(scope: BudgetScope, scopeId: string): string {
    return `${scope}:${scopeId}`;
  }

  async setBudget(
    scope: BudgetScope,
    scopeId: string,
    limit: number,
    period: BudgetPeriod,
  ): Promise<BudgetConfig> {
    const config: BudgetConfig = { scope, scopeId, limit, period };
    this.budgets.set(this.budgetKey(scope, scopeId), config);
    this.logger.log(`Budget set: ${scope}:${scopeId} = ${limit} (${period})`);
    return config;
  }

  async checkBudget(scope: BudgetScope, scopeId: string): Promise<BudgetStatus> {
    const config = this.budgets.get(this.budgetKey(scope, scopeId));
    if (!config) {
      return {
        withinLimit: true,
        currentSpend: 0,
        limit: 0,
        remaining: 0,
      };
    }

    const periodStart = this.getPeriodStart(config.period);
    const allEntries = await this.repository.list({
      from: periodStart,
      to: new Date(),
    });

    let currentSpend = 0;
    for (const entry of allEntries.items) {
      if (scope === 'workflow' && entry.workflowExecutionId === scopeId) {
        currentSpend += entry.amount;
      } else if (scope === 'workspace' || scope === 'project') {
        currentSpend += entry.amount;
      }
    }

    return {
      withinLimit: currentSpend <= config.limit,
      currentSpend,
      limit: config.limit,
      remaining: Math.max(0, config.limit - currentSpend),
    };
  }

  async getSpendReport(
    scope: BudgetScope,
    scopeId: string,
    from: Date,
    to: Date,
  ): Promise<SpendReport> {
    const allEntries = await this.repository.list({ from, to });

    let totalSpend = 0;
    for (const entry of allEntries.items) {
      if (scope === 'workflow' && entry.workflowExecutionId === scopeId) {
        totalSpend += entry.amount;
      } else if (scope === 'workspace' || scope === 'project') {
        totalSpend += entry.amount;
      }
    }

    return {
      scope,
      scopeId,
      from,
      to,
      totalSpend,
      entries: allEntries.items.length,
    };
  }

  async resetBudget(scope: BudgetScope, scopeId: string): Promise<void> {
    this.budgets.delete(this.budgetKey(scope, scopeId));
    this.logger.log(`Budget reset: ${scope}:${scopeId}`);
  }

  private getPeriodStart(period: BudgetPeriod): Date {
    const now = new Date();
    switch (period) {
      case 'daily':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'weekly': {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(now.getFullYear(), now.getMonth(), diff);
      }
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarterly': {
        const quarter = Math.floor(now.getMonth() / 3) * 3;
        return new Date(now.getFullYear(), quarter, 1);
      }
    }
  }
}
