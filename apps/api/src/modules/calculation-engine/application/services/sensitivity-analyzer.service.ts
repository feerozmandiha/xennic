import { Injectable } from '@nestjs/common';
import type { ISensitivityAnalyzer } from '../../domain/interfaces/sensitivity-analyzer.interface.js';
import type { SensitivityResult } from '../../domain/types/calculation.types.js';
import type { IFormula } from '../../domain/interfaces/formula-registry.interface.js';

@Injectable()
export class SensitivityAnalyzer implements ISensitivityAnalyzer {
  analyze(formula: IFormula, inputs: Record<string, number>, variationPercent = 10): SensitivityResult[] {
    const results: SensitivityResult[] = [];
    const baseResult = formula.calculate(inputs);

    for (const param of formula.definition.inputs) {
      if (!param.required) continue;
      const baseValue = inputs[param.name];
      if (baseValue === undefined || baseValue === 0) continue;

      const delta = baseValue * (variationPercent / 100);
      const variedInputs = { ...inputs, [param.name]: baseValue + delta };
      const variedResult = formula.calculate(variedInputs);

      const outputImpacts = formula.definition.outputs.map((out) => {
        const baseOut = baseResult.outputs[out.name] ?? 0;
        const variedOut = variedResult.outputs[out.name] ?? 0;
        const basePct = baseOut !== 0 ? (variedOut - baseOut) / baseOut : 0;
        const sensitivity = variationPercent > 0 ? basePct / (variationPercent / 100) : 0;
        return { output: out.name, baseResult: baseOut, variedResult: variedOut, sensitivity: Math.round(sensitivity * 100) / 100 };
      });

      const impactFactor = outputImpacts.length > 0
        ? Math.round(outputImpacts.reduce((s, o) => s + Math.abs(o.sensitivity), 0) / outputImpacts.length * 100) / 100
        : 0;

      results.push({
        parameter: param.name, baseValue, variedValue: Math.round((baseValue + delta) * 1000) / 1000,
        outputImpacts, impactFactor,
      });
    }

    return results;
  }

  findCriticalParameters(formula: IFormula, inputs: Record<string, number>, variationPercent = 10): Array<{ parameter: string; impactFactor: number }> {
    const results = this.analyze(formula, inputs, variationPercent);
    return results
      .map((r) => ({ parameter: r.parameter, impactFactor: r.impactFactor }))
      .sort((a, b) => b.impactFactor - a.impactFactor);
  }
}
