import { ValidationEngine } from '../application/services/validation-engine.service.js';
import type { FormulaDefinition } from '../domain/types/calculation.types.js';

describe('ValidationEngine', () => {
  let service: ValidationEngine;
  const mockFormula: FormulaDefinition = {
    id: 'test', name: 'Test', description: '', version: '1.0',
    category: 'voltage_drop' as any, status: 'active', standards: [],
    inputs: [
      { name: 'current', label: 'Current', unit: 'A', description: '', min: 0, max: 1000, required: true },
      { name: 'length', label: 'Length', unit: 'm', description: '', min: 0, max: 10000, required: true },
      { name: 'voltage', label: 'Voltage', unit: 'V', description: '', min: 0, max: 100000, required: true },
      { name: 'powerFactor', label: 'Power Factor', unit: '', description: '', min: 0, max: 1, defaultValue: 0.85, required: false },
    ],
    outputs: [
      { name: 'voltageDrop', label: 'Voltage Drop', unit: 'V', description: '' },
      { name: 'verdict', label: 'Verdict', unit: '', description: '1=pass, 0=fail' },
    ],
    createdAt: new Date(),
  };

  beforeEach(() => {
    service = new ValidationEngine();
  });

  it('passes valid inputs', () => {
    const checks = service.validateInputs(mockFormula, { current: 100, length: 50, voltage: 400 });
    expect(checks.every((c) => c.passed)).toBe(true);
  });

  it('fails missing required input', () => {
    const checks = service.validateInputs(mockFormula, { current: 100 });
    const errors = checks.filter((c) => !c.passed);
    expect(errors.length).toBeGreaterThanOrEqual(2);
    expect(errors.some((e) => e.name.includes('length'))).toBe(true);
    expect(errors.some((e) => e.name.includes('voltage'))).toBe(true);
  });

  it('fails input below minimum', () => {
    const checks = service.validateInputs(mockFormula, { current: -1, length: 50, voltage: 400 });
    expect(checks.filter((c) => !c.passed).length).toBeGreaterThan(0);
  });

  it('fails input above maximum', () => {
    const checks = service.validateInputs(mockFormula, { current: 100, length: 50, voltage: 999999 });
    expect(checks.filter((c) => !c.passed).length).toBeGreaterThan(0);
  });

  it('fails NaN input', () => {
    const checks = service.validateInputs(mockFormula, { current: NaN, length: 50, voltage: 400 });
    expect(checks.filter((c) => !c.passed).length).toBeGreaterThan(0);
  });

  it('passes valid outputs', () => {
    const checks = service.validateOutputs(mockFormula, { voltageDrop: 5, verdict: 1 }, {});
    expect(checks.every((c) => c.passed)).toBe(true);
  });

  it('fails missing output', () => {
    const checks = service.validateOutputs(mockFormula, { voltageDrop: 5 }, {});
    expect(checks.filter((c) => !c.passed).length).toBeGreaterThan(0);
  });

  it('fails NaN output', () => {
    const checks = service.validateOutputs(mockFormula, { voltageDrop: NaN, verdict: 1 }, {});
    expect(checks.filter((c) => !c.passed).length).toBeGreaterThan(0);
  });

  it('fails verdict output with invalid value', () => {
    const checks = service.validateOutputs(mockFormula, { voltageDrop: 5, verdict: 2 }, {});
    expect(checks.filter((c) => !c.passed).length).toBeGreaterThan(0);
  });

  it('checks physical consistency: voltage drop cannot exceed 100%', () => {
    expect(service.checkPhysicalConsistency({}, { voltageDropPercent: 150 })).toBe(false);
  });

  it('checks physical consistency: power factor cannot exceed 1', () => {
    expect(service.checkPhysicalConsistency({ currentPf: 0.9 }, { correctedPf: 1.2 })).toBe(false);
  });

  it('checks physical consistency: valid PF passes', () => {
    expect(service.checkPhysicalConsistency({ currentPf: 0.8, targetPf: 0.95 }, { correctedPf: 0.95 })).toBe(true);
  });

  it('validates all returns passed=true for valid data', () => {
    const result = service.validateAll(mockFormula, { current: 100, length: 50, voltage: 400 }, { voltageDrop: 5, verdict: 1 });
    expect(result.passed).toBe(true);
    expect(result.physicalConsistency).toBe(true);
  });

  it('validates all returns passed=false for invalid inputs', () => {
    const result = service.validateAll(mockFormula, { current: -1, length: 50, voltage: 400 }, { voltageDrop: 5, verdict: 1 });
    expect(result.passed).toBe(false);
  });
});
