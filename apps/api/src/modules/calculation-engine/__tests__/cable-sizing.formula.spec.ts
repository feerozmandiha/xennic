import { Test, TestingModule } from '@nestjs/testing';
import { CableSizingFormula } from '../domain/formulas/cable-sizing.formula.js';

describe('CableSizingFormula', () => {
  let formula: CableSizingFormula;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CableSizingFormula],
    }).compile();
    formula = module.get<CableSizingFormula>(CableSizingFormula);
  });

  it('has correct definition metadata', () => {
    const def = formula.definition;
    expect(def.id).toBe('cable-sizing-iec-60364-5-52');
    expect(def.category).toBe('cable_sizing');
    expect(def.status).toBe('active');
    expect(def.standards.length).toBeGreaterThanOrEqual(1);
    expect(def.standards[0].code).toContain('IEC 60364');
  });

  it('selects correct cable for 100A load', () => {
    const result = formula.calculate({ loadCurrent: 100, cableLength: 50, ambientTemp: 30, conductorMaterial: 0, installationMethod: 0, circuitsGrouped: 1 });
    expect(result.outputs.selectedCsa).toBe(25);
    expect(result.outputs.verdict).toBe(1);
    expect(result.outputs.voltageDropPercent).toBeLessThan(4);
    expect(result.intermediates.length).toBeGreaterThan(0);
  });

  it('selects correct cable for 200A load', () => {
    const result = formula.calculate({ loadCurrent: 200, cableLength: 100, ambientTemp: 30, conductorMaterial: 0, installationMethod: 1, circuitsGrouped: 1 });
    expect(result.outputs.selectedCsa).toBeGreaterThanOrEqual(70);
  });

  it('selects larger cable for elevated temperature', () => {
    const normal = formula.calculate({ loadCurrent: 150, cableLength: 50, ambientTemp: 30, conductorMaterial: 0, installationMethod: 0, circuitsGrouped: 1 });
    const hot = formula.calculate({ loadCurrent: 150, cableLength: 50, ambientTemp: 45, conductorMaterial: 0, installationMethod: 0, circuitsGrouped: 1 });
    expect(hot.outputs.selectedCsa).toBeGreaterThanOrEqual(normal.outputs.selectedCsa);
  });

  it('selects larger cable for grouped circuits', () => {
    const single = formula.calculate({ loadCurrent: 150, cableLength: 50, ambientTemp: 30, conductorMaterial: 0, installationMethod: 0, circuitsGrouped: 1 });
    const grouped = formula.calculate({ loadCurrent: 150, cableLength: 50, ambientTemp: 30, conductorMaterial: 0, installationMethod: 0, circuitsGrouped: 5 });
    expect(grouped.outputs.selectedCsa).toBeGreaterThanOrEqual(single.outputs.selectedCsa);
  });

  it('selects aluminum cable', () => {
    const result = formula.calculate({ loadCurrent: 100, cableLength: 50, ambientTemp: 30, conductorMaterial: 1, installationMethod: 0, circuitsGrouped: 1 });
    expect(result.outputs.selectedCsa).toBeGreaterThan(0);
  });

  it('returns zero verdict for excesive voltage drop', () => {
    const result = formula.calculate({ loadCurrent: 400, cableLength: 500, ambientTemp: 25, conductorMaterial: 0, installationMethod: 0, circuitsGrouped: 1 });
    expect(result.outputs.voltageDropPercent).toBeGreaterThan(4);
    expect(result.outputs.verdict).toBe(0);
  });

  it('includes intermediate values explaining calculation', () => {
    const result = formula.calculate({ loadCurrent: 100, cableLength: 50, ambientTemp: 35, conductorMaterial: 0, installationMethod: 0, circuitsGrouped: 2 });
    expect(result.intermediates.length).toBeGreaterThanOrEqual(5);
    const names = result.intermediates.map((i) => i.name);
    expect(names).toContain('tempDeratingFactor');
    expect(names).toContain('groupingDeratingFactor');
    expect(names).toContain('totalDeratingFactor');
    expect(names).toContain('requiredCapacity');
  });

  it('is deterministic', () => {
    const inputs = { loadCurrent: 150, cableLength: 75, ambientTemp: 30, conductorMaterial: 0, installationMethod: 0, circuitsGrouped: 1 };
    const r1 = formula.calculate(inputs);
    const r2 = formula.calculate(inputs);
    expect(r1.outputs).toEqual(r2.outputs);
  });
});
