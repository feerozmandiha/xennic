import { Injectable } from '@nestjs/common';
import type { IFormulaRegistry, IFormula } from '../../domain/interfaces/formula-registry.interface.js';
import type { FormulaDefinition, FormulaCategory, FormulaStatus } from '../../domain/types/calculation.types.js';
import { CableSizingFormula } from '../../domain/formulas/cable-sizing.formula.js';
import { VoltageDropFormula } from '../../domain/formulas/voltage-drop.formula.js';
import { ShortCircuitFormula } from '../../domain/formulas/short-circuit.formula.js';
import { TransformerSizingFormula } from '../../domain/formulas/transformer-sizing.formula.js';
import { GroundingFormula } from '../../domain/formulas/grounding.formula.js';
import { ProtectionCoordinationFormula } from '../../domain/formulas/protection-coordination.formula.js';
import { HarmonicFormula } from '../../domain/formulas/harmonic.formula.js';
import { PowerFactorFormula } from '../../domain/formulas/power-factor.formula.js';
import { LoadEstimationFormula } from '../../domain/formulas/load-estimation.formula.js';

@Injectable()
export class FormulaRegistry implements IFormulaRegistry {
  private formulas = new Map<string, IFormula>();

  constructor(
    private readonly cableSizing: CableSizingFormula,
    private readonly voltageDrop: VoltageDropFormula,
    private readonly shortCircuit: ShortCircuitFormula,
    private readonly transformerSizing: TransformerSizingFormula,
    private readonly grounding: GroundingFormula,
    private readonly protectionCoordination: ProtectionCoordinationFormula,
    private readonly harmonic: HarmonicFormula,
    private readonly powerFactor: PowerFactorFormula,
    private readonly loadEstimation: LoadEstimationFormula,
  ) {
    for (const f of [cableSizing, voltageDrop, shortCircuit, transformerSizing, grounding, protectionCoordination, harmonic, powerFactor, loadEstimation]) {
      this.formulas.set(f.definition.id, f);
    }
  }

  register(formula: IFormula): void {
    this.formulas.set(formula.definition.id, formula);
  }

  get(id: string): IFormula | null {
    return this.formulas.get(id) ?? null;
  }

  find(category?: FormulaCategory, status?: FormulaStatus): IFormula[] {
    let result = Array.from(this.formulas.values());
    if (category) result = result.filter((f) => f.definition.category === category);
    if (status) result = result.filter((f) => f.definition.status === status);
    return result;
  }

  list(): FormulaDefinition[] {
    return Array.from(this.formulas.values()).map((f) => f.definition);
  }

  getByStandard(standardCode: string): FormulaDefinition[] {
    return Array.from(this.formulas.values())
      .filter((f) => f.definition.standards.some((s) => s.code.includes(standardCode)))
      .map((f) => f.definition);
  }
}
