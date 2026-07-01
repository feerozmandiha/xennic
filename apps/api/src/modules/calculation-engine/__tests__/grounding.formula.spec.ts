import { Test, TestingModule } from '@nestjs/testing';
import { GroundingFormula } from '../domain/formulas/grounding.formula.js';

describe('GroundingFormula', () => {
  let formula: GroundingFormula;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroundingFormula],
    }).compile();
    formula = module.get<GroundingFormula>(GroundingFormula);
  });

  it('has correct definition', () => {
    const def = formula.definition;
    expect(def.id).toBe('grounding-ieee-80');
    expect(def.standards[0].code).toContain('IEEE 80');
  });

  it('calculates grid resistance', () => {
    const result = formula.calculate({ soilResistivity: 100, gridArea: 2500, faultCurrent: 5000, faultDuration: 0.5 });
    expect(result.outputs.gridResistance).toBeGreaterThan(0);
    expect(result.outputs.gridResistance).toBeLessThan(10);
  });

  it('touch voltage decreases with larger grid', () => {
    const small = formula.calculate({ soilResistivity: 100, gridArea: 100, faultCurrent: 5000, faultDuration: 0.5 });
    const large = formula.calculate({ soilResistivity: 100, gridArea: 10000, faultCurrent: 5000, faultDuration: 0.5 });
    expect(large.outputs.meshVoltage).toBeLessThan(small.outputs.meshVoltage);
  });

  it('tolerable voltage increases with fault duration', () => {
    const fast = formula.calculate({ soilResistivity: 100, gridArea: 2500, faultCurrent: 5000, faultDuration: 0.1, personWeight: 70 });
    const slow = formula.calculate({ soilResistivity: 100, gridArea: 2500, faultCurrent: 5000, faultDuration: 1, personWeight: 70 });
    expect(slow.outputs.tolerableTouch).toBeLessThan(fast.outputs.tolerableTouch);
  });

  it('produces safe verdict for well-designed grid', () => {
    const result = formula.calculate({ soilResistivity: 50, gridArea: 5000, faultCurrent: 300, faultDuration: 0.3, gridSpacing: 4, burialDepth: 0.6 });
    expect(result.outputs.touchSafe).toBe(1);
    expect(result.outputs.stepSafe).toBe(1);
  });

  it('includes intermediate values', () => {
    const result = formula.calculate({ soilResistivity: 100, gridArea: 2500, faultCurrent: 5000, faultDuration: 0.5 });
    const names = result.intermediates.map((i) => i.name);
    expect(names).toContain('gridResistanceRaw');
    expect(names).toContain('tolerableTouchVoltage');
    expect(names).toContain('tolerableStepVoltage');
    expect(names).toContain('meshVoltageRaw');
  });

  it('is deterministic', () => {
    const inputs = { soilResistivity: 200, gridArea: 1600, faultCurrent: 10000, faultDuration: 0.5, burialDepth: 0.5, gridSpacing: 5, personWeight: 70 };
    expect(formula.calculate(inputs).outputs).toEqual(formula.calculate(inputs).outputs);
  });
});
