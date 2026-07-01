import type { EngineeringDecision, DecisionAlternative, ReasoningStep, CalculationResult } from '../types/ei.types.js';

export interface IDecisionEngine {
  make(params: {
    title: string;
    description: string;
    inputs: Record<string, unknown>;
    evidence: string[];
    appliedStandards: string[];
    reasoningSteps: ReasoningStep[];
    calculations: CalculationResult[];
    alternatives: DecisionAlternative[];
  }): Promise<EngineeringDecision>;
  evaluateAlternatives(alternatives: DecisionAlternative[]): Promise<{
    scored: DecisionAlternative[];
    rejected: Array<{ alternativeId: string; reason: string; evidentialBasis: string }>;
  }>;
  getDecision(decisionId: string): Promise<EngineeringDecision | null>;
}
