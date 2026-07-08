import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ICALCULATION_REPOSITORY } from '../ports/calculation-repository.interface.js';
import type { ICalculationRepository } from '../ports/calculation-repository.interface.js';
import { IRESULT_REPOSITORY } from '../ports/result-repository.interface.js';
import type { IResultRepository } from '../ports/result-repository.interface.js';
import { CalculationResultEntity } from '../../domain/entities/calculation-result.entity.js';
import { DslDefinition } from '../../domain/value-objects/dsl-definition.value-object.js';
import { DslRuntime, type DslExecutionContext } from '../../infrastructure/engines/dsl-runtime.js';
import { ValidationEngine } from '../../infrastructure/engines/validation-engine.js';
import { AuditService } from './audit.service.js';
import { CertificateService } from './certificate.service.js';
import { UnitConversionService } from './unit-conversion.service.js';
import { PluginRegistry } from '../../infrastructure/plugin-registry.js';

@Injectable()
export class CalculationExecutionService {
  private readonly logger = new Logger(CalculationExecutionService.name);
  private readonly ENGINE_VERSION = '1.0.0';

  constructor(
    @Inject(ICALCULATION_REPOSITORY)
    private readonly calcRepo: ICalculationRepository,
    @Inject(IRESULT_REPOSITORY)
    private readonly resultRepo: IResultRepository,
    private readonly dslRuntime: DslRuntime,
    private readonly validationEngine: ValidationEngine,
    private readonly auditService: AuditService,
    private readonly certificateService: CertificateService,
    private readonly unitConversionService: UnitConversionService,
    private readonly pluginRegistry: PluginRegistry,
  ) {}

  async execute(data: {
    definitionId: string;
    inputs: Record<string, unknown>;
    workspaceId: string;
    userId: string;
    correlationId?: string;
    validateOnly?: boolean;
    skipAiReview?: boolean;
    skipCertificate?: boolean;
  }) {
    const definition = await this.calcRepo.findDefinitionById(data.definitionId);
    if (!definition) throw new NotFoundException(`Definition ${data.definitionId} not found`);
    if (!definition.enabled) throw new BadRequestException(`Definition '${definition.name}' is disabled`);

    const version = await this.calcRepo.findActiveVersion(data.definitionId);
    if (!version) throw new BadRequestException(`No active version for definition '${definition.name}'`);

    const dsl = version.dslDefinition;

    const executionPath: string[] = [];
    const startTime = Date.now();

    // Stage 1: Input Validation
    executionPath.push('input-validation');
    const inputValidation = this.validationEngine.validateInputs(data.inputs, dsl.inputs);
    if (inputValidation.hasErrors()) {
      const auditEntry = await this.auditService.logExecution({
        workspaceId: data.workspaceId, userId: data.userId, action: 'validate', entityType: 'definition',
        entityId: data.definitionId, formulaVersion: version.version, errorMessage: inputValidation.errors[0]?.message, correlationId: data.correlationId,
      });
      throw new BadRequestException({ message: 'Input validation failed', errors: inputValidation.errors, auditId: auditEntry.id });
    }

    if (data.validateOnly) {
      return { valid: true, warnings: inputValidation.warnings };
    }

    const result = CalculationResultEntity.create({
      workspaceId: data.workspaceId, definitionId: data.definitionId, versionId: version.id,
      userId: data.userId, inputs: data.inputs, engineVersion: this.ENGINE_VERSION, correlationId: data.correlationId,
    });

    try {
      // Stage 2: Unit Normalization
      executionPath.push('unit-normalization');
      const normalizedInputs: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data.inputs)) {
        const inputDef = dsl.inputs.find(i => i.name === key);
        if (inputDef?.unit && typeof value === 'object' && value !== null) {
          const iv = value as { value: number; unit: string };
          normalizedInputs[key] = this.unitConversionService.normalize(iv.value, iv.unit);
        } else {
          normalizedInputs[key] = value;
        }
      }

      // Stage 3: Formula Execution
      executionPath.push('formula-execution');
      const execResult = await this.dslRuntime.execute(dsl, {
        definitionId: data.definitionId,
        versionId: version.id,
        inputs: normalizedInputs,
        workspaceId: data.workspaceId,
        userId: data.userId,
        correlationId: data.correlationId,
      });

      result.complete(execResult.outputs, Date.now() - startTime);

      if (execResult.errors.length > 0) {
        result.fail(execResult.errors.join('; '), Date.now() - startTime);
        await this.resultRepo.save(result);
        await this.auditService.logExecution({
          workspaceId: data.workspaceId, userId: data.userId, action: 'run', entityType: 'result',
          entityId: result.id, inputs: data.inputs, outputs: execResult.outputs, formulaVersion: version.version,
          errorMessage: execResult.errors.join('; '), executionPath, durationMs: result.durationMs ?? 0, correlationId: data.correlationId,
        });
        throw new BadRequestException({ message: 'Formula execution failed', errors: execResult.errors, resultId: result.id });
      }

      // Stage 4: Result Validation
      executionPath.push('result-validation');
      const dslValidations = this.validationEngine.validateAgainstDslRules(normalizedInputs, dsl.validations);

      // Stage 5: AI Review (skippable)
      executionPath.push('ai-review');
      if (dsl.aiReview && !data.skipAiReview) {
        // AI review integration handled via Provider Management
        result.setAiReview({ provider: 'pending', status: 'skipped' }, 0);
      }

      // Stage 6: Certification (skippable)
      executionPath.push('certification');
      let certificate = null;
      if (dsl.certificate && !data.skipCertificate) {
        certificate = await this.certificateService.generateCertificate({
          resultId: result.id, definition, version, inputs: data.inputs,
          outputs: execResult.outputs, userId: data.userId, workspaceId: data.workspaceId,
        });
      }

      // Stage 7: Persistence
      executionPath.push('persistence');
      await this.resultRepo.save(result);

      // Stage 8: Audit
      executionPath.push('audit');
      await this.auditService.logExecution({
        workspaceId: data.workspaceId, userId: data.userId, action: 'run', entityType: 'result',
        entityId: result.id, inputs: data.inputs, outputs: execResult.outputs, formulaVersion: version.version,
        executionPath, durationMs: result.durationMs ?? 0, correlationId: data.correlationId,
      });

      return {
        resultId: result.id,
        outputs: execResult.outputs,
        durationMs: result.durationMs,
        formulaCount: execResult.formulaCount,
        certificateId: certificate?.certificateId ?? null,
        warnings: dslValidations.warnings,
        executionPath,
      };
    } catch (error) {
      if (result.status === 'pending') {
        result.fail(error instanceof Error ? error.message : 'Execution failed', Date.now() - startTime);
        await this.resultRepo.save(result);
        await this.auditService.logExecution({
          workspaceId: data.workspaceId, userId: data.userId, action: 'run', entityType: 'result',
          entityId: result.id, inputs: data.inputs, formulaVersion: version.version,
          errorMessage: error instanceof Error ? error.message : 'Unknown error', executionPath,
          durationMs: Date.now() - startTime, correlationId: data.correlationId,
        });
      }
      throw error;
    }
  }

  async getResult(id: string): Promise<CalculationResultEntity> {
    const result = await this.resultRepo.findById(id);
    if (!result) throw new NotFoundException(`Result ${id} not found`);
    return result;
  }

  async getResultsByWorkspace(workspaceId: string, options?: { page?: number; limit?: number; definitionId?: string }) {
    return this.resultRepo.findByWorkspaceId(workspaceId, options);
  }
}
