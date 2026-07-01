import { Test, TestingModule } from '@nestjs/testing';
import { ShortCircuitFormula } from '../domain/formulas/short-circuit.formula.js';

describe('ShortCircuitFormula', () => {
  let formula: ShortCircuitFormula;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShortCircuitFormula],
    }).compile();
    formula = module.get<ShortCircuitFormula>(ShortCircuitFormula);
  });

  it('has correct definition', () => {
    const def = formula.definition;
    expect(def.id).toBe('short-circuit-iec-60909');
    expect(def.standards[0].code).toContain('IEC 60909');
  });

  it('calculates three-phase fault current', () => {
    const result = formula.calculate({ sourceVoltage: 11000, sourceMva: 500, cableLength: 0, faultType: 0 });
    expect(result.outputs.initialSymmetricalCurrent).toBeGreaterThan(10);
    expect(result.outputs.initialSymmetricalCurrent).toBeLessThan(50);
    expect(result.outputs.peakCurrent).toBeGreaterThan(result.outputs.initialSymmetricalCurrent);
    expect(result.outputs.dcComponent).toBeGreaterThan(0);
  });

  it('includes cable impedance in calculation', () => {
    const noCable = formula.calculate({ sourceVoltage: 400, sourceMva: 500, cableLength: 0, faultType: 0 });
    const withCable = formula.calculate({ sourceVoltage: 400, sourceMva: 500, cableLength: 100, cableResistance: 0.387, cableReactance: 0.08, faultType: 0 });
    expect(withCable.outputs.initialSymmetricalCurrent).toBeLessThan(noCable.outputs.initialSymmetricalCurrent);
  });

  it('includes transformer impedance', () => {
    const noTr = formula.calculate({ sourceVoltage: 400, sourceMva: 500, cableLength: 0, faultType: 0 });
    const withTr = formula.calculate({ sourceVoltage: 400, sourceMva: 500, cableLength: 0, transformerPower: 1000, transformerImpedance: 5, faultType: 0 });
    expect(withTr.outputs.initialSymmetricalCurrent).toBeLessThan(noTr.outputs.initialSymmetricalCurrent);
  });

  it('calculates line-to-line fault', () => {
    const threePhase = formula.calculate({ sourceVoltage: 400, sourceMva: 500, cableLength: 0, faultType: 0 });
    const ll = formula.calculate({ sourceVoltage: 400, sourceMva: 500, cableLength: 0, faultType: 1 });
    expect(ll.outputs.initialSymmetricalCurrent).toBeLessThan(threePhase.outputs.initialSymmetricalCurrent);
  });

  it('peak current follows κ√2 × Ik', () => {
    const result = formula.calculate({ sourceVoltage: 11000, sourceMva: 500, cableLength: 0, faultType: 0 });
    expect(result.outputs.peakCurrent).toBeGreaterThan(result.outputs.initialSymmetricalCurrent * 1.2);
    expect(result.outputs.peakCurrent).toBeLessThan(result.outputs.initialSymmetricalCurrent * 3);
  });

  it('includes intermediate values', () => {
    const result = formula.calculate({ sourceVoltage: 400, sourceMva: 500, cableLength: 50, cableResistance: 0.387, cableReactance: 0.08, faultType: 0 });
    const names = result.intermediates.map((i) => i.name);
    expect(names).toContain('baseVoltage');
    expect(names).toContain('sourceImpedance');
    expect(names).toContain('totalImpedance');
    expect(names).toContain('xOverR');
    expect(names).toContain('kappaFactor');
  });

  it('is deterministic', () => {
    const inputs = { sourceVoltage: 11000, sourceMva: 350, cableLength: 10, cableResistance: 0.524, cableReactance: 0.08, faultType: 0 };
    expect(formula.calculate(inputs).outputs).toEqual(formula.calculate(inputs).outputs);
  });
});
