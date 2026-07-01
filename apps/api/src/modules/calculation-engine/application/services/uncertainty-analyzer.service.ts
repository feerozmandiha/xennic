import { Injectable } from '@nestjs/common';
import type { IUncertaintyAnalyzer } from '../../domain/interfaces/uncertainty-analyzer.interface.js';
import type { UncertaintyResult, AssumptionEntry } from '../../domain/types/calculation.types.js';
import type { IFormula } from '../../domain/interfaces/formula-registry.interface.js';

@Injectable()
export class UncertaintyAnalyzer implements IUncertaintyAnalyzer {
  analyze(
    formula: IFormula,
    inputs: Record<string, number>,
    uncertainties: Record<string, number>,
    confidenceLevel = 0.95,
  ): UncertaintyResult {
    const outputResults = this.propagateError(formula, inputs, uncertainties, confidenceLevel);

    const assumptionLog: AssumptionEntry[] = formula.definition.inputs
      .filter((p) => uncertainties[p.name] !== undefined)
      .map((p) => ({
        parameter: p.name,
        assumption: `Nominal: ${inputs[p.name]}, uncertainty: ±${((uncertainties[p.name] ?? 0) / (inputs[p.name] ?? 1) * 100).toFixed(1)}%`,
        impact: uncertainties[p.name]! / (inputs[p.name] ?? 1) > 0.1 ? 'high' : uncertainties[p.name]! / (inputs[p.name] ?? 1) > 0.05 ? 'medium' : 'low',
        verified: false,
      }));

    return {
      inputs: Object.entries(uncertainties).map(([name, uncertainty]) => ({
        name, nominal: inputs[name] ?? 0, uncertainty, distribution: 'normal' as const,
      })),
      outputs: outputResults,
      assumptionLog,
    };
  }

  propagateError(
    formula: IFormula,
    inputs: Record<string, number>,
    uncertainties: Record<string, number>,
    confidenceLevel = 0.95,
  ): Array<{ name: string; nominal: number; ciLower: number; ciUpper: number; confidenceLevel: number }> {
    const baseResult = formula.calculate(inputs);

    // Monte Carlo-style: evaluate at ±1σ for each uncertain input
    const z = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.576 : 1.645;

    return formula.definition.outputs.map((out) => {
      const nominal = baseResult.outputs[out.name] ?? 0;
      let totalVariance = 0;

      for (const param of formula.definition.inputs) {
        const sigma = uncertainties[param.name];
        if (!sigma || sigma === 0) continue;

        const baseVal = inputs[param.name];
        if (baseVal === undefined) continue;

        const highInputs = { ...inputs, [param.name]: baseVal + sigma };
        const lowInputs = { ...inputs, [param.name]: baseVal - sigma };
        const highResult = formula.calculate(highInputs);
        const lowResult = formula.calculate(lowInputs);

        const highOut = highResult.outputs[out.name] ?? 0;
        const lowOut = lowResult.outputs[out.name] ?? 0;
        const partialDeriv = (highOut - lowOut) / (2 * sigma);
        totalVariance += partialDeriv * partialDeriv * sigma * sigma;
      }

      const stdDev = Math.sqrt(totalVariance);
      const ciLower = nominal - z * stdDev;
      const ciUpper = nominal + z * stdDev;

      return {
        name: out.name, nominal,
        ciLower: Math.round(ciLower * 1000) / 1000,
        ciUpper: Math.round(ciUpper * 1000) / 1000,
        confidenceLevel,
      };
    });
  }
}
