import { Test, TestingModule } from '@nestjs/testing';
import { SensitivityAnalyzer } from '../application/services/sensitivity-analyzer.service.js';
import { VoltageDropFormula } from '../domain/formulas/voltage-drop.formula.js';

describe('SensitivityAnalyzer', () => {
  let service: SensitivityAnalyzer;
  let formula: VoltageDropFormula;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SensitivityAnalyzer, VoltageDropFormula],
    }).compile();
    service = module.get<SensitivityAnalyzer>(SensitivityAnalyzer);
    formula = module.get<VoltageDropFormula>(VoltageDropFormula);
  });

  it('returns sensitivity results for each required input', () => {
    const results = service.analyze(formula, { current: 100, length: 50, resistance: 0.387, voltage: 400 });
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.parameter).toBeTruthy();
      expect(r.baseValue).toBeGreaterThan(0);
      expect(r.outputImpacts.length).toBeGreaterThan(0);
      expect(r.impactFactor).toBeGreaterThanOrEqual(0);
    }
  });

  it('sensitivity of output to current is positive', () => {
    const results = service.analyze(formula, { current: 100, length: 50, resistance: 0.387, voltage: 400 });
    const currentResult = results.find((r) => r.parameter === 'current')!;
    expect(currentResult).toBeDefined();
    const continuousImpacts = currentResult.outputImpacts.filter((i) => i.output !== 'verdict');
    for (const impact of continuousImpacts) {
      expect(impact.sensitivity).toBeGreaterThan(0);
    }
  });

  it('identifies critical parameters sorted by impact', () => {
    const critical = service.findCriticalParameters(formula, { current: 100, length: 50, resistance: 0.387, voltage: 400 });
    expect(critical.length).toBeGreaterThan(0);
    for (let i = 1; i < critical.length; i++) {
      expect(critical[i - 1].impactFactor).toBeGreaterThanOrEqual(critical[i].impactFactor);
    }
  });

  it('skips parameters with zero base value', () => {
    const results = service.analyze(formula, { current: 0, length: 50, resistance: 0.387, voltage: 400 });
    expect(results.every((r) => r.parameter !== 'current')).toBe(true);
  });

  it('uses custom variation percent', () => {
    const defaultResults = service.analyze(formula, { current: 100, length: 50, resistance: 0.387, voltage: 400 }, 10);
    const doubleResults = service.analyze(formula, { current: 100, length: 50, resistance: 0.387, voltage: 400 }, 20);
    expect(doubleResults.length).toBe(defaultResults.length);
  });
});
