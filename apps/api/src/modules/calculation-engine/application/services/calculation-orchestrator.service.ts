import { Injectable, Inject, Logger } from '@nestjs/common';
import { randomUUID, createHash } from 'node:crypto';
import type { IFormulaRegistry, IFormula } from '../../domain/interfaces/formula-registry.interface.js';
import type { IValidationEngine } from '../../domain/interfaces/validation-engine.interface.js';
import type { ISensitivityAnalyzer } from '../../domain/interfaces/sensitivity-analyzer.interface.js';
import type { IUncertaintyAnalyzer } from '../../domain/interfaces/uncertainty-analyzer.interface.js';
import type { ICalculationAudit } from '../../domain/interfaces/calculation-audit.interface.js';
import type { IEngineeringUnits } from '../../domain/interfaces/engineering-units.interface.js';
import type { CalculationEngineQuery, CalculationEngineResponse, CalculationResult, AuditRecord, ExecutionTraceEntry, SensitivityResult, UncertaintyResult, ValidationResult, IntermediateValue, StandardReference } from '../../domain/types/calculation.types.js';

@Injectable()
export class CalculationOrchestratorService {
  private readonly logger = new Logger(CalculationOrchestratorService.name);

  constructor(
    @Inject('IFormulaRegistry') private readonly registry: IFormulaRegistry,
    @Inject('IValidationEngine') private readonly validation: IValidationEngine,
    @Inject('ISensitivityAnalyzer') private readonly sensitivity: ISensitivityAnalyzer,
    @Inject('IUncertaintyAnalyzer') private readonly uncertainty: IUncertaintyAnalyzer,
    @Inject('ICalculationAudit') private readonly audit: ICalculationAudit,
    @Inject('IEngineeringUnits') private readonly units: IEngineeringUnits,
  ) {}

  async execute(query: CalculationEngineQuery): Promise<CalculationEngineResponse> {
    const executionId = randomUUID();
    const startTime = Date.now();
    const trace: ExecutionTraceEntry[] = [];

    try {
      const formula = this.registry.get(query.formulaId);
      if (!formula) {
        return { success: false, error: `Formula '${query.formulaId}' not found` };
      }

      const definition = formula.definition;

      // Step 1: Validate inputs
      trace.push({ step: 1, operation: 'validate-inputs', input: query.inputs, output: {}, duration: 0 });
      const inputChecks = this.validation.validateInputs(definition, query.inputs);
      const inputErrors = inputChecks.filter((c) => c.severity === 'error');
      if (inputErrors.length > 0) {
        return {
          success: false,
          error: `Input validation failed: ${inputErrors.map((e) => e.message).join('; ')}`,
        };
      }

      // Step 2: Execute calculation
      trace.push({ step: 2, operation: 'calculate', input: query.inputs, output: {}, duration: 0 });
      const calcResult = formula.calculate(query.inputs);

      // Step 3: Validate outputs
      trace.push({ step: 3, operation: 'validate-outputs', input: calcResult.outputs, output: {}, duration: 0 });
      const validation = this.validation.validateAll(definition, query.inputs, calcResult.outputs);
      trace.push({ step: 3, duration: 0, operation: 'validation-result', input: {}, output: { passed: validation.passed } });

      // Step 4: Sensitivity analysis
      let sensitivityResults: SensitivityResult[] | undefined;
      if (query.options?.sensitivityAnalysis) {
        trace.push({ step: 4, operation: 'sensitivity-analysis', input: { variation: query.options.sensitivityVariation ?? 10 }, output: {}, duration: 0 });
        sensitivityResults = this.sensitivity.analyze(formula, query.inputs, query.options.sensitivityVariation ?? 10);
      }

      // Step 5: Uncertainty analysis
      let uncertaintyResult: UncertaintyResult | undefined;
      if (query.options?.uncertaintyAnalysis) {
        trace.push({ step: 5, operation: 'uncertainty-analysis', input: { confidenceLevel: query.options.confidenceLevel ?? 0.95 }, output: {}, duration: 0 });
        const uncertainties: Record<string, number> = {};
        for (const param of definition.inputs) {
          const val = query.inputs[param.name];
          if (val !== undefined && param.min !== undefined && param.max !== undefined) {
            uncertainties[param.name] = (param.max - param.min) * 0.05; // 5% of range as uncertainty
          } else if (val !== undefined) {
            uncertainties[param.name] = val * 0.02; // 2% default
          }
        }
        uncertaintyResult = this.uncertainty.analyze(formula, query.inputs, uncertainties, query.options.confidenceLevel ?? 0.95);
      }

      // Step 6: Format inputs/outputs with units
      const formatVal = (name: string, value: number): { value: number; unit: string } => {
        const param = definition.inputs.find((p) => p.name === name);
        return { value, unit: param?.unit ?? '' };
      };
      const formatOut = (name: string, value: number): { value: number; unit: string } => {
        const outDef = definition.outputs.find((o) => o.name === name);
        return { value, unit: outDef?.unit ?? '' };
      };

      const inputs = Object.fromEntries(Object.entries(query.inputs).map(([k, v]) => [k, formatVal(k, v)]));
      const outputs = Object.fromEntries(Object.entries(calcResult.outputs).map(([k, v]) => [k, formatOut(k, v)]));

      // Step 7: Build audit
      const auditRecord: AuditRecord = {
        executionId,
        formulaId: definition.id,
        formulaVersion: definition.version,
        inputs,
        intermediates: calcResult.intermediates,
        outputs,
        standards: definition.standards,
        unitConversions: [],
        executionTrace: trace,
        timestamp: startTime,
        duration: Date.now() - startTime,
        checksum: '',
      };

      const finalized = await this.audit.finalize(executionId, auditRecord);

      const result: CalculationResult = {
        id: executionId,
        formulaId: definition.id,
        formulaName: definition.name,
        formulaVersion: definition.version,
        inputs,
        outputs,
        intermediates: calcResult.intermediates,
        standardReferences: definition.standards,
        validation,
        sensitivity: sensitivityResults,
        uncertainty: uncertaintyResult,
        audit: finalized,
        timestamp: startTime,
        duration: Date.now() - startTime,
        checksum: finalized.checksum,
      };

      this.logger.debug(`Calculation ${executionId} completed in ${result.duration}ms`);

      return { success: true, data: result };
    } catch (error) {
      this.logger.error(`Calculation ${executionId} failed: ${(error as Error).message}`);
      return { success: false, error: (error as Error).message };
    }
  }
}
