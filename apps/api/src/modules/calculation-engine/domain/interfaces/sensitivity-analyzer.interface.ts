import type { SensitivityResult } from '../types/calculation.types.js';
import type { IFormula } from './formula-registry.interface.js';

export interface ISensitivityAnalyzer {
  analyze(formula: IFormula, inputs: Record<string, number>, variationPercent?: number): SensitivityResult[];
  findCriticalParameters(formula: IFormula, inputs: Record<string, number>, variationPercent?: number): Array<{ parameter: string; impactFactor: number }>;
}
