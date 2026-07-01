import { Test, TestingModule } from '@nestjs/testing';
import { ProtectionCoordinationFormula } from '../domain/formulas/protection-coordination.formula.js';

describe('ProtectionCoordinationFormula', () => {
  let formula: ProtectionCoordinationFormula;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProtectionCoordinationFormula],
    }).compile();
    formula = module.get<ProtectionCoordinationFormula>(ProtectionCoordinationFormula);
  });

  it('has correct definition', () => {
    const def = formula.definition;
    expect(def.id).toBe('protection-coordination-iec-60947');
    expect(def.standards[0].code).toContain('IEC 60947');
  });

  it('calculates pickup setting above load current', () => {
    const result = formula.calculate({ faultCurrent: 5000, loadCurrent: 100, deviceType: 0, cableCsa: 25, cableMaterial: 0 });
    expect(result.outputs.pickupSetting).toBeGreaterThan(100);
    expect(result.outputs.pickupSetting).toBeLessThan(200);
  });

  it('sets instantaneous pickup for MCCB', () => {
    const result = formula.calculate({ faultCurrent: 5000, loadCurrent: 100, deviceType: 0, cableCsa: 25, cableMaterial: 0 });
    expect(result.outputs.instantaneousPickup).toBeGreaterThan(result.outputs.pickupSetting);
  });

  it('cable protection verdict depends on cable size', () => {
    const thin = formula.calculate({ faultCurrent: 10000, loadCurrent: 100, deviceType: 0, cableCsa: 4, cableMaterial: 0 });
    const thick = formula.calculate({ faultCurrent: 10000, loadCurrent: 100, deviceType: 0, cableCsa: 95, cableMaterial: 0 });
    expect(thin.outputs.cableProtectionSafe).toBeLessThan(thick.outputs.cableProtectionSafe);
  });

  it('selective coordination has larger interval than cascaded', () => {
    const sel = formula.calculate({ faultCurrent: 5000, loadCurrent: 100, deviceType: 4, cableCsa: 25, cableMaterial: 0, coordinationType: 0 });
    const casc = formula.calculate({ faultCurrent: 5000, loadCurrent: 100, deviceType: 4, cableCsa: 25, cableMaterial: 0, coordinationType: 1 });
    expect(sel.outputs.coordinationInterval).toBeGreaterThan(casc.outputs.coordinationInterval);
  });

  it('includes intermediate values', () => {
    const result = formula.calculate({ faultCurrent: 5000, loadCurrent: 100, deviceType: 0, cableCsa: 25, cableMaterial: 0 });
    expect(result.intermediates.length).toBeGreaterThanOrEqual(3);
    const names = result.intermediates.map((i) => i.name);
    expect(names).toContain('pickupSettingRaw');
    expect(names).toContain('instantaneousPickup');
  });

  it('is deterministic', () => {
    const inputs = { faultCurrent: 10000, loadCurrent: 200, deviceType: 2, cableCsa: 95, cableMaterial: 0, coordinationType: 0 };
    expect(formula.calculate(inputs).outputs).toEqual(formula.calculate(inputs).outputs);
  });
});
