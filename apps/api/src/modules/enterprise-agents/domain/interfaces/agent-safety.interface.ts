import type { SafetyValidationRequest, SafetyValidationResult, SafetyCheck } from '../types/agent.types.js';

export interface IAgentSafety {
  validate(request: SafetyValidationRequest): SafetyValidationResult;
  checkInputSafety(input: string): SafetyCheck;
  checkOutputConsistency(input: string, output: string): SafetyCheck;
  checkToolSafety(toolsUsed: string[]): SafetyCheck;
  checkConfidence(output: string, context: Record<string, unknown>): SafetyCheck;
}
