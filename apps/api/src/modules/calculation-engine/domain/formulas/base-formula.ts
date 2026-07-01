import { createHash } from 'node:crypto';
import type { IFormula } from '../interfaces/formula-registry.interface.js';
import type { FormulaDefinition, IntermediateValue } from '../types/calculation.types.js';

export abstract class BaseFormula implements IFormula {
  abstract definition: FormulaDefinition;

  abstract calculate(inputs: Record<string, number>): {
    outputs: Record<string, number>;
    intermediates: IntermediateValue[];
  };

  protected round(value: number, precision = 6): number {
    return Math.round(value * 10 ** precision) / 10 ** precision;
  }

  protected checksum(inputs: Record<string, number>): string {
    return createHash('sha256').update(JSON.stringify(inputs)).digest('hex').slice(0, 16);
  }
}
