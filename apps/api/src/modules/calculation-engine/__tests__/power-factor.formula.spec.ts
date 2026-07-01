import { Test, TestingModule } from '@nestjs/testing';
import { PowerFactorFormula } from '../domain/formulas/power-factor.formula.js';

describe('PowerFactorFormula', () => {
  let formula: PowerFactorFormula;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PowerFactorFormula],
    }).compile();
    formula = module.get<PowerFactorFormula>(PowerFactorFormula);
  });

  it('has correct definition', () => {
    const def = formula.definition;
    expect(def.id).toBe('power-factor-correction-ieee-519');
    expect(def.standards[0].code).toContain('IEEE 519');
  });

  it('calculates required kVAR for PF correction', () => {
    const result = formula.calculate({ loadKva: 500, currentPf: 0.8, targetPf: 0.95, voltage: 400 });
    expect(result.outputs.requiredKvar).toBeGreaterThan(100);
    expect(result.outputs.correctedPf).toBe(0.95);
    expect(result.outputs.currentReduction).toBeGreaterThan(0);
  });

  it('requires more kVAR for worse initial PF', () => {
    const good = formula.calculate({ loadKva: 500, currentPf: 0.85, targetPf: 0.95, voltage: 400 });
    const bad = formula.calculate({ loadKva: 500, currentPf: 0.7, targetPf: 0.95, voltage: 400 });
    expect(bad.outputs.requiredKvar).toBeGreaterThan(good.outputs.requiredKvar);
  });

  it('calculates current reduction from PF correction', () => {
    const result = formula.calculate({ loadKva: 500, currentPf: 0.7, targetPf: 0.95, voltage: 400 });
    expect(result.outputs.currentReduction).toBeGreaterThan(10);
  });

  it('detuned capacitor requires more kVAR', () => {
    const standard = formula.calculate({ loadKva: 500, currentPf: 0.8, targetPf: 0.95, voltage: 400, capacitorType: 0 });
    const detuned = formula.calculate({ loadKva: 500, currentPf: 0.8, targetPf: 0.95, voltage: 400, capacitorType: 1 });
    expect(detuned.outputs.requiredKvar).toBeGreaterThanOrEqual(standard.outputs.requiredKvar);
  });

  it('includes intermediate values', () => {
    const result = formula.calculate({ loadKva: 500, currentPf: 0.8, targetPf: 0.95, voltage: 400 });
    const names = result.intermediates.map((i) => i.name);
    expect(names).toContain('activePower');
    expect(names).toContain('reactivePowerBefore');
    expect(names).toContain('requiredKvarRaw');
    expect(names).toContain('currentBefore');
  });

  it('is deterministic', () => {
    const inputs = { loadKva: 1000, currentPf: 0.75, targetPf: 0.95, voltage: 400 };
    expect(formula.calculate(inputs).outputs).toEqual(formula.calculate(inputs).outputs);
  });
});
