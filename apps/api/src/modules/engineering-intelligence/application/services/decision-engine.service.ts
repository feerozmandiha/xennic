import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IDecisionEngine } from '../../domain/interfaces/decision-engine.interface.js';
import type { EngineeringDecision, DecisionAlternative, ReasoningStep, CalculationResult } from '../../domain/types/ei.types.js';

@Injectable()
export class DecisionEngine implements IDecisionEngine {
  private readonly logger = new Logger(DecisionEngine.name);
  private readonly decisions = new Map<string, EngineeringDecision>();

  async make(params: {
    title: string; description: string; inputs: Record<string, unknown>;
    evidence: string[]; appliedStandards: string[]; reasoningSteps: ReasoningStep[];
    calculations: CalculationResult[]; alternatives: DecisionAlternative[];
  }): Promise<EngineeringDecision> {
    const { scored, rejected } = await this.evaluateAlternatives(params.alternatives);
    const best = scored.length > 0 ? scored.reduce((a, b) => (a.score > b.score ? a : b)) : null;

    const decision: EngineeringDecision = {
      id: randomUUID(), title: params.title, description: params.description,
      inputs: params.inputs, evidence: params.evidence, appliedStandards: params.appliedStandards,
      reasoningSteps: params.reasoningSteps, calculations: params.calculations,
      confidence: best?.score ?? 0,
      alternatives: scored, rejectedAlternatives: rejected,
      finalDecision: best?.description ?? 'No viable alternative found',
      timestamp: Date.now(),
    };

    this.decisions.set(decision.id, decision);
    this.logger.debug(`Decision ${decision.id} created with confidence ${decision.confidence}`);
    return decision;
  }

  async evaluateAlternatives(alternatives: DecisionAlternative[]): Promise<{
    scored: DecisionAlternative[]; rejected: Array<{ alternativeId: string; reason: string; evidentialBasis: string }>;
  }> {
    const scored: DecisionAlternative[] = [];
    const rejected: Array<{ alternativeId: string; reason: string; evidentialBasis: string }> = [];

    for (const alt of alternatives) {
      if (alt.score < 0.3) {
        rejected.push({ alternativeId: alt.id, reason: 'Score below minimum threshold', evidentialBasis: 'Automated scoring' });
      } else {
        scored.push(alt);
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return { scored, rejected };
  }

  async getDecision(decisionId: string): Promise<EngineeringDecision | null> {
    return this.decisions.get(decisionId) ?? null;
  }
}
