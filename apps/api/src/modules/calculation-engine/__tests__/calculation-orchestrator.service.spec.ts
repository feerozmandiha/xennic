import { Test, TestingModule } from '@nestjs/testing';
import { CalculationOrchestratorService } from '../application/services/calculation-orchestrator.service.js';
import { CableSizingFormula } from '../domain/formulas/cable-sizing.formula.js';
import { VoltageDropFormula } from '../domain/formulas/voltage-drop.formula.js';
import { ShortCircuitFormula } from '../domain/formulas/short-circuit.formula.js';
import { TransformerSizingFormula } from '../domain/formulas/transformer-sizing.formula.js';
import { GroundingFormula } from '../domain/formulas/grounding.formula.js';
import { ProtectionCoordinationFormula } from '../domain/formulas/protection-coordination.formula.js';
import { HarmonicFormula } from '../domain/formulas/harmonic.formula.js';
import { PowerFactorFormula } from '../domain/formulas/power-factor.formula.js';
import { LoadEstimationFormula } from '../domain/formulas/load-estimation.formula.js';
import { FormulaRegistry } from '../application/services/formula-registry.service.js';
import { EngineeringUnits } from '../application/services/engineering-units.service.js';
import { ValidationEngine } from '../application/services/validation-engine.service.js';
import { SensitivityAnalyzer } from '../application/services/sensitivity-analyzer.service.js';
import { UncertaintyAnalyzer } from '../application/services/uncertainty-analyzer.service.js';
import { CalculationAudit } from '../application/services/calculation-audit.service.js';

describe('CalculationOrchestratorService', () => {
  let service: CalculationOrchestratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculationOrchestratorService,
        { provide: 'IFormulaRegistry', useClass: FormulaRegistry },
        FormulaRegistry,
        { provide: 'IEngineeringUnits', useClass: EngineeringUnits },
        EngineeringUnits,
        { provide: 'IValidationEngine', useClass: ValidationEngine },
        ValidationEngine,
        { provide: 'ISensitivityAnalyzer', useClass: SensitivityAnalyzer },
        SensitivityAnalyzer,
        { provide: 'IUncertaintyAnalyzer', useClass: UncertaintyAnalyzer },
        UncertaintyAnalyzer,
        { provide: 'ICalculationAudit', useClass: CalculationAudit },
        CalculationAudit,
        CableSizingFormula, VoltageDropFormula, ShortCircuitFormula,
        TransformerSizingFormula, GroundingFormula, ProtectionCoordinationFormula,
        HarmonicFormula, PowerFactorFormula, LoadEstimationFormula,
      ],
    }).compile();
    service = module.get<CalculationOrchestratorService>(CalculationOrchestratorService);
  });

  it('executes cable sizing formula and returns result', async () => {
    const result = await service.execute({
      formulaId: 'cable-sizing-iec-60364-5-52',
      inputs: { loadCurrent: 100, cableLength: 50, ambientTemp: 30, conductorMaterial: 0, installationMethod: 0, circuitsGrouped: 1 },
      workspaceId: 'ws-1',
    });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.formulaId).toBe('cable-sizing-iec-60364-5-52');
    expect(result.data!.outputs.selectedCsa).toBeDefined();
    expect(result.data!.validation.passed).toBe(true);
    expect(result.data!.standardReferences.length).toBeGreaterThan(0);
    expect(result.data!.audit.checksum).toBeTruthy();
  });

  it('executes voltage drop formula', async () => {
    const result = await service.execute({
      formulaId: 'voltage-drop-iec-60364-5-52-525',
      inputs: { current: 100, length: 50, resistance: 0.387, reactance: 0.08, voltage: 400, phaseCount: 3, powerFactor: 0.85 },
      workspaceId: 'ws-1',
    });
    expect(result.success).toBe(true);
    expect(result.data!.outputs.voltageDropPercent).toBeDefined();
  });

  it('executes short circuit formula', async () => {
    const result = await service.execute({
      formulaId: 'short-circuit-iec-60909',
      inputs: { sourceVoltage: 11000, sourceMva: 500, cableLength: 0, faultType: 0 },
      workspaceId: 'ws-1',
    });
    expect(result.success).toBe(true);
    expect(result.data!.outputs.initialSymmetricalCurrent).toBeDefined();
  });

  it('executes transformer sizing formula', async () => {
    const result = await service.execute({
      formulaId: 'transformer-sizing-iec-60076',
      inputs: { connectedLoad: 320, demandFactor: 0.8, futureGrowth: 1.15, primaryVoltage: 11000, secondaryVoltage: 400 },
      workspaceId: 'ws-1',
    });
    expect(result.success).toBe(true);
    expect(result.data!.outputs.selectedKva.value).toBeGreaterThanOrEqual(300);
  });

  it('executes grounding formula', async () => {
    const result = await service.execute({
      formulaId: 'grounding-ieee-80',
      inputs: { soilResistivity: 100, gridArea: 2500, faultCurrent: 5000, faultDuration: 0.5 },
      workspaceId: 'ws-1',
    });
    expect(result.success).toBe(true);
    expect(result.data!.outputs.gridResistance).toBeDefined();
  });

  it('executes protection coordination formula', async () => {
    const result = await service.execute({
      formulaId: 'protection-coordination-iec-60947',
      inputs: { faultCurrent: 5000, loadCurrent: 100, deviceType: 0, cableCsa: 25, cableMaterial: 0 },
      workspaceId: 'ws-1',
    });
    expect(result.success).toBe(true);
    expect(result.data!.outputs.pickupSetting).toBeDefined();
  });

  it('executes harmonic analysis formula', async () => {
    const result = await service.execute({
      formulaId: 'harmonic-ieee-519',
      inputs: { fundamentalCurrent: 100, h3: 3, h5: 5, h7: 2, h11: 1, h13: 0.5, voltageThd: 2, iscOverIl: 100, systemVoltage: 400 },
      workspaceId: 'ws-1',
    });
    expect(result.success).toBe(true);
    expect(result.data!.outputs.currentThd).toBeDefined();
  });

  it('executes power factor formula', async () => {
    const result = await service.execute({
      formulaId: 'power-factor-correction-ieee-519',
      inputs: { loadKva: 500, currentPf: 0.8, targetPf: 0.95, voltage: 400 },
      workspaceId: 'ws-1',
    });
    expect(result.success).toBe(true);
    expect(result.data!.outputs.requiredKvar.value).toBeGreaterThan(0);
  });

  it('executes load estimation formula', async () => {
    const result = await service.execute({
      formulaId: 'load-estimation-iec-60364',
      inputs: { buildingType: 0, totalArea: 200, unitCount: 1 },
      workspaceId: 'ws-1',
    });
    expect(result.success).toBe(true);
    expect(result.data!.outputs.connectedLoad.value).toBeGreaterThan(0);
  });

  it('returns error for unknown formula', async () => {
    const result = await service.execute({
      formulaId: 'nonexistent', inputs: {}, workspaceId: 'ws-1',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('returns error for invalid inputs', async () => {
    const result = await service.execute({
      formulaId: 'voltage-drop-iec-60364-5-52-525',
      inputs: { current: -1, length: 50, resistance: 0.387, voltage: 400 },
      workspaceId: 'ws-1',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('validation failed');
  });

  it('includes sensitivity analysis when requested', async () => {
    const result = await service.execute({
      formulaId: 'voltage-drop-iec-60364-5-52-525',
      inputs: { current: 100, length: 50, resistance: 0.387, voltage: 400, phaseCount: 3, powerFactor: 0.85 },
      workspaceId: 'ws-1',
      options: { sensitivityAnalysis: true, sensitivityVariation: 10 },
    });
    expect(result.success).toBe(true);
    expect(result.data!.sensitivity).toBeDefined();
    expect(result.data!.sensitivity!.length).toBeGreaterThan(0);
  });

  it('includes uncertainty analysis when requested', async () => {
    const result = await service.execute({
      formulaId: 'voltage-drop-iec-60364-5-52-525',
      inputs: { current: 100, length: 50, resistance: 0.387, voltage: 400, phaseCount: 3, powerFactor: 0.85 },
      workspaceId: 'ws-1',
      options: { uncertaintyAnalysis: true, confidenceLevel: 0.95 },
    });
    expect(result.success).toBe(true);
    expect(result.data!.uncertainty).toBeDefined();
    expect(result.data!.uncertainty!.outputs.length).toBeGreaterThan(0);
  });

  it('result includes full audit trail', async () => {
    const result = await service.execute({
      formulaId: 'cable-sizing-iec-60364-5-52',
      inputs: { loadCurrent: 100, cableLength: 50, ambientTemp: 30, conductorMaterial: 0, installationMethod: 0, circuitsGrouped: 1 },
      workspaceId: 'ws-1',
    });
    expect(result.data!.audit.executionId).toBeTruthy();
    expect(result.data!.audit.formulaId).toBe('cable-sizing-iec-60364-5-52');
    expect(result.data!.audit.inputs).toBeDefined();
    expect(result.data!.audit.outputs).toBeDefined();
    expect(result.data!.audit.standards.length).toBeGreaterThan(0);
    expect(result.data!.audit.executionTrace.length).toBeGreaterThan(0);
  });

  it('result is deterministic', async () => {
    const inputs = {
      formulaId: 'cable-sizing-iec-60364-5-52' as const,
      inputs: { loadCurrent: 150, cableLength: 75, ambientTemp: 30, conductorMaterial: 0, installationMethod: 0, circuitsGrouped: 1 },
      workspaceId: 'ws-1',
    };
    const r1 = await service.execute(inputs);
    const r2 = await service.execute(inputs);
    expect(r1.data!.outputs).toEqual(r2.data!.outputs);
    expect(r1.data!.audit.checksum).toBeDefined();
  });
});
