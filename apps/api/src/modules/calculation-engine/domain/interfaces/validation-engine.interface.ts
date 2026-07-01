import type { ValidationResult, ValidationCheck, FormulaDefinition } from '../types/calculation.types.js';

export interface IValidationEngine {
  validateInputs(formula: FormulaDefinition, inputs: Record<string, number>): ValidationCheck[];
  validateOutputs(formula: FormulaDefinition, outputs: Record<string, number>, inputs: Record<string, number>): ValidationCheck[];
  checkPhysicalConsistency(inputs: Record<string, number>, outputs: Record<string, number>): boolean;
  validateAll(formula: FormulaDefinition, inputs: Record<string, number>, outputs: Record<string, number>): ValidationResult;
}
