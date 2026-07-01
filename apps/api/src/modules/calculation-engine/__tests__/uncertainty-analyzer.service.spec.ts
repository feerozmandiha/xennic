import { Test, TestingModule } from '@nestjs/testing';
import { UncertaintyAnalyzer } from '../application/services/uncertainty-analyzer.service.js';
import { VoltageDropFormula } from '../domain/formulas/voltage-drop.formula.js';

describe('UncertaintyAnalyzer', () => {
  let service: UncertaintyAnalyzer;
  let formula: VoltageDropFormula;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UncertaintyAnalyzer, VoltageDropFormula],
    }).compile();
    service = module.get<UncertaintyAnalyzer>(UncertaintyAnalyzer);
    formula = module.get<VoltageDropFormula>(VoltageDropFormula);
  });

  it('returns uncertainty result for each output', () => {
    const result = service.analyze(formula, { current: 100, length: 50, resistance: 0.387, voltage: 400 }, { current: 5, length: 2, resistance: 0.02 });
    expect(result.outputs.length).toBeGreaterThan(0);
    expect(result.inputs.length).toBe(3);
    for (const out of result.outputs) {
      if (out.name === 'verdict') continue;
      expect(out.nominal).toBeGreaterThan(0);
      expect(out.ciLower).toBeLessThan(out.nominal);
      expect(out.ciUpper).toBeGreaterThan(out.nominal);
    }
  });

  it('wider uncertainties produce wider confidence intervals', () => {
    const tight = service.analyze(formula, { current: 100, length: 50, resistance: 0.387, voltage: 400 }, { current: 1, length: 1, resistance: 0.01 });
    const wide = service.analyze(formula, { current: 100, length: 50, resistance: 0.387, voltage: 400 }, { current: 20, length: 10, resistance: 0.1 });
    const tightWidth = tight.outputs[0].ciUpper - tight.outputs[0].ciLower;
    const wideWidth = wide.outputs[0].ciUpper - wide.outputs[0].ciLower;
    expect(wideWidth).toBeGreaterThan(tightWidth);
  });

  it('higher confidence level produces wider intervals', () => {
    const c95 = service.propagateError(formula, { current: 100, length: 50, resistance: 0.387, voltage: 400 }, { current: 5 }, 0.95);
    const c99 = service.propagateError(formula, { current: 100, length: 50, resistance: 0.387, voltage: 400 }, { current: 5 }, 0.99);
    const w95 = c95[0].ciUpper - c95[0].ciLower;
    const w99 = c99[0].ciUpper - c99[0].ciLower;
    expect(w99).toBeGreaterThan(w95);
  });

  it('assumption log tracks input uncertainties', () => {
    const result = service.analyze(formula, { current: 100, length: 50, resistance: 0.387, voltage: 400 }, { current: 5, length: 2 });
    expect(result.assumptionLog.length).toBeGreaterThan(0);
    for (const entry of result.assumptionLog) {
      expect(entry.parameter).toBeTruthy();
      expect(entry.assumption).toBeTruthy();
      expect(entry.impact).toMatch(/^(low|medium|high)$/);
      expect(entry.verified).toBe(false);
    }
  });
});
