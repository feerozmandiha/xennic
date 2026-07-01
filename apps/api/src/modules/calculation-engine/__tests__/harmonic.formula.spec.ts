import { Test, TestingModule } from '@nestjs/testing';
import { HarmonicFormula } from '../domain/formulas/harmonic.formula.js';

describe('HarmonicFormula', () => {
  let formula: HarmonicFormula;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HarmonicFormula],
    }).compile();
    formula = module.get<HarmonicFormula>(HarmonicFormula);
  });

  it('has correct definition', () => {
    const def = formula.definition;
    expect(def.id).toBe('harmonic-ieee-519');
    expect(def.standards[0].code).toContain('IEEE 519');
  });

  it('calculates THD from individual harmonics', () => {
    const result = formula.calculate({ fundamentalCurrent: 100, h3: 3, h5: 5, h7: 2, h11: 1, h13: 0.5, voltageThd: 2, iscOverIl: 100, systemVoltage: 400 });
    const expectedThdi = Math.sqrt(3 * 3 + 5 * 5 + 2 * 2 + 1 * 1 + 0.5 * 0.5);
    expect(result.outputs.currentThd).toBeCloseTo(expectedThdi, 1);
  });

  it('reports compliant for low harmonics', () => {
    const result = formula.calculate({ fundamentalCurrent: 100, h3: 1, h5: 1.5, h7: 1, h11: 0.5, h13: 0.3, voltageThd: 2, iscOverIl: 100, systemVoltage: 400 });
    expect(result.outputs.currentCompliant).toBe(1);
    expect(result.outputs.voltageCompliant).toBe(1);
  });

  it('reports non-compliant for high harmonics', () => {
    const result = formula.calculate({ fundamentalCurrent: 100, h3: 12, h5: 15, h7: 8, h11: 5, h13: 3, voltageThd: 12, iscOverIl: 20, systemVoltage: 400 });
    expect(result.outputs.currentCompliant).toBe(0);
  });

  it('applies voltage THD limits by voltage level', () => {
    const hv = formula.calculate({ fundamentalCurrent: 100, h3: 1, h5: 2, h7: 1, h11: 0.5, h13: 0.3, voltageThd: 12, iscOverIl: 100, systemVoltage: 11000 });
    expect(hv.outputs.voltageThdLimit).toBe(5);
    expect(hv.outputs.voltageCompliant).toBe(0);
  });

  it('includes intermediate values', () => {
    const result = formula.calculate({ fundamentalCurrent: 100, h3: 3, h5: 5, h7: 2, h11: 1, h13: 0.5, voltageThd: 2, iscOverIl: 100, systemVoltage: 400 });
    const names = result.intermediates.map((i) => i.name);
    expect(names).toContain('currentThdRaw');
    expect(names).toContain('iscOverIlRaw');
    expect(names).toContain('ihdCompliance');
  });

  it('is deterministic', () => {
    const inputs = { fundamentalCurrent: 200, h3: 2, h5: 3, h7: 1.5, h11: 0.8, h13: 0.4, voltageThd: 1.5, iscOverIl: 50, systemVoltage: 400 };
    expect(formula.calculate(inputs).outputs).toEqual(formula.calculate(inputs).outputs);
  });
});
