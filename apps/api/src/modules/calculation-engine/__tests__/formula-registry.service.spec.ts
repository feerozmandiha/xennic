import { Test, TestingModule } from '@nestjs/testing';
import { FormulaRegistry } from '../application/services/formula-registry.service.js';
import { CableSizingFormula } from '../domain/formulas/cable-sizing.formula.js';
import { VoltageDropFormula } from '../domain/formulas/voltage-drop.formula.js';
import { ShortCircuitFormula } from '../domain/formulas/short-circuit.formula.js';
import { TransformerSizingFormula } from '../domain/formulas/transformer-sizing.formula.js';
import { GroundingFormula } from '../domain/formulas/grounding.formula.js';
import { ProtectionCoordinationFormula } from '../domain/formulas/protection-coordination.formula.js';
import { HarmonicFormula } from '../domain/formulas/harmonic.formula.js';
import { PowerFactorFormula } from '../domain/formulas/power-factor.formula.js';
import { LoadEstimationFormula } from '../domain/formulas/load-estimation.formula.js';

describe('FormulaRegistry', () => {
  let service: FormulaRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormulaRegistry,
        CableSizingFormula, VoltageDropFormula, ShortCircuitFormula,
        TransformerSizingFormula, GroundingFormula, ProtectionCoordinationFormula,
        HarmonicFormula, PowerFactorFormula, LoadEstimationFormula,
      ],
    }).compile();
    service = module.get<FormulaRegistry>(FormulaRegistry);
  });

  it('registers all 9 built-in formulas', () => {
    const formulas = service.list();
    expect(formulas).toHaveLength(9);
  });

  it('returns formula by ID', () => {
    const formula = service.get('cable-sizing-iec-60364-5-52');
    expect(formula).toBeDefined();
    expect(formula!.definition.name).toContain('Cable Sizing');
  });

  it('returns null for unknown ID', () => {
    expect(service.get('nonexistent')).toBeNull();
  });

  it('finds formulas by category', () => {
    const formulas = service.find('harmonic');
    expect(formulas).toHaveLength(1);
    expect(formulas[0].definition.id).toBe('harmonic-ieee-519');
  });

  it('finds formulas by status', () => {
    const formulas = service.find(undefined, 'active');
    expect(formulas).toHaveLength(9);
  });

  it('finds formulas by standard', () => {
    const formulas = service.getByStandard('IEEE 519');
    expect(formulas.length).toBeGreaterThanOrEqual(2);
  });

  it('finds formulas by IEC standard', () => {
    const formulas = service.getByStandard('IEC 60364');
    expect(formulas.length).toBeGreaterThanOrEqual(2);
  });

  it('registers additional custom formula', () => {
    const custom = { definition: { id: 'custom-1', name: 'Custom', category: 'cable_sizing' as any, status: 'active' as any, version: '1.0', inputs: [], outputs: [], standards: [], createdAt: new Date() }, calculate: () => ({ outputs: {}, intermediates: [] }) };
    service.register(custom);
    expect(service.list()).toHaveLength(10);
    expect(service.get('custom-1')).toBeDefined();
  });

  it('all 9 formulas have unique IDs', () => {
    const ids = service.list().map((f) => f.id);
    expect(new Set(ids).size).toBe(9);
  });

  it('all 9 formulas reference at least one standard', () => {
    for (const f of service.list()) {
      expect(f.standards.length).toBeGreaterThanOrEqual(1);
    }
  });
});
