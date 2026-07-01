import { Test, TestingModule } from '@nestjs/testing';
import { VoltageDropFormula } from '../domain/formulas/voltage-drop.formula.js';

describe('VoltageDropFormula', () => {
  let formula: VoltageDropFormula;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VoltageDropFormula],
    }).compile();
    formula = module.get<VoltageDropFormula>(VoltageDropFormula);
  });

  it('has correct definition', () => {
    const def = formula.definition;
    expect(def.id).toBe('voltage-drop-iec-60364-5-52-525');
    expect(def.standards[0].code).toContain('IEC 60364');
  });

  it('calculates three-phase voltage drop', () => {
    const result = formula.calculate({ current: 100, length: 50, resistance: 0.387, reactance: 0.08, voltage: 400, phaseCount: 3, powerFactor: 0.85 });
    expect(result.outputs.voltageDropPercent).toBeLessThan(4);
    expect(result.outputs.verdict).toBe(1);
    expect(result.outputs.voltageDrop).toBeGreaterThan(0);
  });

  it('calculates single-phase voltage drop', () => {
    const result = formula.calculate({ current: 50, length: 30, resistance: 0.727, reactance: 0.08, voltage: 230, phaseCount: 1, powerFactor: 0.9 });
    expect(result.outputs.voltageDrop).toBeGreaterThan(0);
    expect(result.outputs.verdict).toBe(1);
  });

  it('flags non-compliant voltage drop', () => {
    const result = formula.calculate({ current: 300, length: 200, resistance: 0.387, reactance: 0.08, voltage: 400, phaseCount: 3, powerFactor: 0.8 });
    expect(result.outputs.voltageDropPercent).toBeGreaterThan(4);
    expect(result.outputs.verdict).toBe(0);
  });

  it('three-phase drop is less than single-phase for same current', () => {
    const sp = formula.calculate({ current: 100, length: 50, resistance: 0.387, reactance: 0.08, voltage: 230, phaseCount: 1, powerFactor: 0.85 });
    const tp = formula.calculate({ current: 100, length: 50, resistance: 0.387, reactance: 0.08, voltage: 400, phaseCount: 3, powerFactor: 0.85 });
    expect(tp.outputs.voltageDropPercent).toBeLessThan(sp.outputs.voltageDropPercent);
  });

  it('includes intermediate values', () => {
    const result = formula.calculate({ current: 100, length: 50, resistance: 0.387, reactance: 0.08, voltage: 400, phaseCount: 3, powerFactor: 0.85 });
    expect(result.intermediates.length).toBeGreaterThanOrEqual(2);
    expect(result.intermediates[0].name).toBe('totalResistance');
  });

  it('is deterministic', () => {
    const inputs = { current: 150, length: 75, resistance: 0.268, reactance: 0.08, voltage: 400, phaseCount: 3, powerFactor: 0.85 };
    expect(formula.calculate(inputs).outputs).toEqual(formula.calculate(inputs).outputs);
  });
});
