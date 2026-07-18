import { Injectable, Logger, Inject } from '@nestjs/common';
import type { DecisionLog } from '../domain/decision-log.entity.js';
import type { SelectionRationale } from '../domain/selection-rationale.vo.js';
import type { ConfidenceSummary } from '../domain/explainability-repository.interface.js';
import type { IExplainabilityRepository } from '../domain/explainability-repository.interface.js';

export interface ExplainabilityReport {
  executionId: string;
  decisions: DecisionLog[];
  rationales: SelectionRationale[];
  confidence: ConfidenceSummary;
  contextUsage: ContextUsageReport;
  policyDecisions: PolicyDecisionReport;
}

export interface ContextUsageReport {
  totalContexts: number;
  contexts: string[];
}

export interface PolicyDecisionReport {
  totalPolicyDecisions: number;
  decisions: DecisionLog[];
}

@Injectable()
export class ExplainabilityService {
  private readonly logger = new Logger(ExplainabilityService.name);

  constructor(
    @Inject('IExplainabilityRepository')
    private readonly repository: IExplainabilityRepository,
  ) {}

  async generateReport(executionId: string): Promise<ExplainabilityReport> {
    const [decisionsResult, rationales, confidence] = await Promise.all([
      this.repository.getDecisions(executionId),
      this.repository.getRationale(executionId),
      this.repository.getConfidenceSummary(executionId),
    ]);

    const policyDecisions = decisionsResult.items.filter((d) => d.decisionType === 'policy');
    const contextEntries = decisionsResult.items.filter((d) => d.decisionType === 'tool_selection');

    return {
      executionId,
      decisions: decisionsResult.items,
      rationales,
      confidence,
      contextUsage: {
        totalContexts: contextEntries.length,
        contexts: contextEntries.map((d) => d.decision),
      },
      policyDecisions: {
        totalPolicyDecisions: policyDecisions.length,
        decisions: policyDecisions,
      },
    };
  }

  async getContextUsage(executionId: string): Promise<ContextUsageReport> {
    const result = await this.repository.getDecisions(executionId);
    const contextEntries = result.items.filter((d) => d.decisionType === 'tool_selection');

    return {
      totalContexts: contextEntries.length,
      contexts: contextEntries.map((d) => d.decision),
    };
  }

  async getPolicyDecisions(executionId: string): Promise<PolicyDecisionReport> {
    const policyDecisions = await this.repository.getDecisionsByType(executionId, 'policy');

    return {
      totalPolicyDecisions: policyDecisions.length,
      decisions: policyDecisions,
    };
  }
}
