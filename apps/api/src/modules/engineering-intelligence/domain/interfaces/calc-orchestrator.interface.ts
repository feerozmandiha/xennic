import type { CalculationResult } from '../types/ei.types.js';

export interface ICalcOrchestrator {
  execute(toolId: string, input: Record<string, unknown>, context?: Record<string, unknown>): Promise<CalculationResult>;
  executeBatch(calculations: Array<{ toolId: string; input: Record<string, unknown> }>): Promise<CalculationResult[]>;
  getCacheKey(toolId: string, input: Record<string, unknown>): string;
  invalidateCache(toolId?: string): Promise<void>;
  getHistory(toolId: string): Promise<CalculationResult[]>;
}
