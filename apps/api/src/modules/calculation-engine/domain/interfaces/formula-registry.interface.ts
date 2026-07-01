import type { FormulaDefinition, FormulaCategory, FormulaStatus, CalculationRequest, CalculationResult, IntermediateValue, StandardReference } from '../types/calculation.types.js';

export interface IFormula {
  definition: FormulaDefinition;
  calculate(inputs: Record<string, number>): {
    outputs: Record<string, number>;
    intermediates: IntermediateValue[];
  };
}

export interface IFormulaRegistry {
  register(formula: IFormula): void;
  get(id: string): IFormula | null;
  find(category?: FormulaCategory, status?: FormulaStatus): IFormula[];
  list(): FormulaDefinition[];
  getByStandard(standardCode: string): FormulaDefinition[];
}
