import { Test, TestingModule } from '@nestjs/testing';
import { TransformerSizingFormula } from '../domain/formulas/transformer-sizing.formula.js';

describe('TransformerSizingFormula', () => {
  let formula: TransformerSizingFormula;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformerSizingFormula],
    }).compile();
    formula = module.get<TransformerSizingFormula>(TransformerSizingFormula);
  });

  it('has correct definition', () => {
    const def = formula.definition;
    expect(def.id).toBe('transformer-sizing-iec-60076');
    expect(def.standards[0].code).toContain('IEC 60076');
  });

  it('selects correct transformer for 320kVA load', () => {
    const result = formula.calculate({ connectedLoad: 320, demandFactor: 0.8, futureGrowth: 1.15, primaryVoltage: 11000, secondaryVoltage: 400 });
    expect(result.outputs.requiredKva).toBeGreaterThan(250);
    expect(result.outputs.selectedKva).toBeGreaterThanOrEqual(result.outputs.requiredKva);
    expect(result.outputs.loadingPercent).toBeGreaterThan(0);
    expect(result.outputs.loadingPercent).toBeLessThan(100);
  });

  it('selects nearest standard rating', () => {
    const result = formula.calculate({ connectedLoad: 100, demandFactor: 0.8, futureGrowth: 1.1, primaryVoltage: 11000, secondaryVoltage: 400 });
    expect(result.outputs.selectedKva).toBeGreaterThan(0);
    expect([50, 100, 160, 200, 250, 315, 400, 500, 630, 800, 1000]).toContain(result.outputs.selectedKva);
  });

  it('scales with load', () => {
    const small = formula.calculate({ connectedLoad: 100, demandFactor: 0.8, futureGrowth: 1.15, primaryVoltage: 11000, secondaryVoltage: 400 });
    const large = formula.calculate({ connectedLoad: 500, demandFactor: 0.8, futureGrowth: 1.15, primaryVoltage: 11000, secondaryVoltage: 400 });
    expect(large.outputs.selectedKva).toBeGreaterThan(small.outputs.selectedKva);
  });

  it('includes intermediate values', () => {
    const result = formula.calculate({ connectedLoad: 320, demandFactor: 0.8, futureGrowth: 1.15, primaryVoltage: 11000, secondaryVoltage: 400 });
    const names = result.intermediates.map((i) => i.name);
    expect(names).toContain('demandLoad');
    expect(names).toContain('requiredRaw');
    expect(names).toContain('coolingFactor');
  });

  it('is deterministic', () => {
    const inputs = { connectedLoad: 500, demandFactor: 0.75, futureGrowth: 1.2, primaryVoltage: 20000, secondaryVoltage: 400 };
    expect(formula.calculate(inputs).outputs).toEqual(formula.calculate(inputs).outputs);
  });
});
