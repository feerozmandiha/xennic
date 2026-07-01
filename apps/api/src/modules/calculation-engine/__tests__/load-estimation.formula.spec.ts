import { Test, TestingModule } from '@nestjs/testing';
import { LoadEstimationFormula } from '../domain/formulas/load-estimation.formula.js';

describe('LoadEstimationFormula', () => {
  let formula: LoadEstimationFormula;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoadEstimationFormula],
    }).compile();
    formula = module.get<LoadEstimationFormula>(LoadEstimationFormula);
  });

  it('has correct definition', () => {
    const def = formula.definition;
    expect(def.id).toBe('load-estimation-iec-60364');
    expect(def.standards.some((s) => s.code.includes('IEC 60364'))).toBe(true);
    expect(def.standards.some((s) => s.code.includes('ISIRI'))).toBe(true);
    expect(def.standards.some((s) => s.code.includes('Tavanir'))).toBe(true);
  });

  it('estimates load for residential building', () => {
    const result = formula.calculate({ buildingType: 0, totalArea: 200, unitCount: 1 });
    expect(result.outputs.connectedLoad).toBeGreaterThan(0);
    expect(result.outputs.demandLoad).toBeGreaterThan(0);
    expect(result.outputs.demandLoad).toBeLessThanOrEqual(result.outputs.connectedLoad);
    expect(result.outputs.diversityFactor).toBeGreaterThan(0);
    expect(result.outputs.diversityFactor).toBeLessThanOrEqual(1);
  });

  it('estimates load for commercial building', () => {
    const result = formula.calculate({ buildingType: 1, totalArea: 1000, unitCount: 5 });
    expect(result.outputs.connectedLoad).toBeGreaterThan(0);
    expect(result.outputs.lightingLoad).toBeGreaterThan(0);
    expect(result.outputs.socketLoad).toBeGreaterThan(0);
  });

  it('applies diversity for multiple units', () => {
    const single = formula.calculate({ buildingType: 0, totalArea: 500, unitCount: 1 });
    const multi = formula.calculate({ buildingType: 0, totalArea: 500, unitCount: 10 });
    expect(multi.outputs.diversityFactor).toBeLessThan(single.outputs.diversityFactor);
  });

  it('includes HVAC and miscellaneous loads', () => {
    const base = formula.calculate({ buildingType: 0, totalArea: 500, unitCount: 1 });
    const withHvac = formula.calculate({ buildingType: 0, totalArea: 500, unitCount: 1, hvacLoad: 50, elevatorLoad: 20, emergencyLoad: 10 });
    expect(withHvac.outputs.connectedLoad).toBeGreaterThan(base.outputs.connectedLoad);
  });

  it('industrial building has higher diversity factor', () => {
    const res = formula.calculate({ buildingType: 0, totalArea: 500, unitCount: 1 });
    const ind = formula.calculate({ buildingType: 2, totalArea: 500, unitCount: 1 });
    expect(ind.outputs.diversityFactor).toBeGreaterThan(res.outputs.diversityFactor);
  });

  it('includes intermediate values', () => {
    const result = formula.calculate({ buildingType: 0, totalArea: 300, unitCount: 2 });
    const names = result.intermediates.map((i) => i.name);
    expect(names).toContain('lightingLoad');
    expect(names).toContain('socketLoad');
    expect(names).toContain('connectedLoadTotal');
    expect(names).toContain('diversityBasic');
  });

  it('is deterministic', () => {
    const inputs = { buildingType: 1, totalArea: 2000, unitCount: 10, hvacLoad: 100, elevatorLoad: 30, emergencyLoad: 20 };
    expect(formula.calculate(inputs).outputs).toEqual(formula.calculate(inputs).outputs);
  });
});
