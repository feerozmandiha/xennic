import { Module } from '@nestjs/common';
import { WorkspaceModule } from '../workspace/workspace.module.js';
import { CalculationEngineController } from './presentation/controllers/calculation-engine.controller.js';
import { CalculationOrchestratorService } from './application/services/calculation-orchestrator.service.js';
import { EngineeringUnits } from './application/services/engineering-units.service.js';
import { FormulaRegistry } from './application/services/formula-registry.service.js';
import { ValidationEngine } from './application/services/validation-engine.service.js';
import { SensitivityAnalyzer } from './application/services/sensitivity-analyzer.service.js';
import { UncertaintyAnalyzer } from './application/services/uncertainty-analyzer.service.js';
import { CalculationAudit } from './application/services/calculation-audit.service.js';
import { CableSizingFormula } from './domain/formulas/cable-sizing.formula.js';
import { VoltageDropFormula } from './domain/formulas/voltage-drop.formula.js';
import { ShortCircuitFormula } from './domain/formulas/short-circuit.formula.js';
import { TransformerSizingFormula } from './domain/formulas/transformer-sizing.formula.js';
import { GroundingFormula } from './domain/formulas/grounding.formula.js';
import { ProtectionCoordinationFormula } from './domain/formulas/protection-coordination.formula.js';
import { HarmonicFormula } from './domain/formulas/harmonic.formula.js';
import { PowerFactorFormula } from './domain/formulas/power-factor.formula.js';
import { LoadEstimationFormula } from './domain/formulas/load-estimation.formula.js';

@Module({
  imports: [WorkspaceModule],
  controllers: [CalculationEngineController],
  providers: [
    { provide: 'IEngineeringUnits', useClass: EngineeringUnits },
    EngineeringUnits,
    { provide: 'IFormulaRegistry', useClass: FormulaRegistry },
    FormulaRegistry,
    { provide: 'IValidationEngine', useClass: ValidationEngine },
    ValidationEngine,
    { provide: 'ISensitivityAnalyzer', useClass: SensitivityAnalyzer },
    SensitivityAnalyzer,
    { provide: 'IUncertaintyAnalyzer', useClass: UncertaintyAnalyzer },
    UncertaintyAnalyzer,
    { provide: 'ICalculationAudit', useClass: CalculationAudit },
    CalculationAudit,
    CalculationOrchestratorService,
    CableSizingFormula,
    VoltageDropFormula,
    ShortCircuitFormula,
    TransformerSizingFormula,
    GroundingFormula,
    ProtectionCoordinationFormula,
    HarmonicFormula,
    PowerFactorFormula,
    LoadEstimationFormula,
  ],
  exports: [
    'IEngineeringUnits', 'IFormulaRegistry', 'IValidationEngine',
    'ISensitivityAnalyzer', 'IUncertaintyAnalyzer', 'ICalculationAudit',
    CalculationOrchestratorService,
  ],
})
export class CalculationEngineModule {}
