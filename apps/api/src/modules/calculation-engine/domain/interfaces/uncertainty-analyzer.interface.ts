import type { UncertaintyResult } from '../types/calculation.types.js';
import type { IFormula } from './formula-registry.interface.js';

export interface IUncertaintyAnalyzer {
  analyze(formula: IFormula, inputs: Record<string, number>, uncertainties: Record<string, number>, confidenceLevel?: number): UncertaintyResult;
  propagateError(formula: IFormula, inputs: Record<string, number>, uncertainties: Record<string, number>): Array<{ name: string; nominal: number; ciLower: number; ciUpper: number; confidenceLevel: number }>;
}
