import { Injectable } from '@nestjs/common';
import type { IValidationEngine } from '../../domain/interfaces/validation-engine.interface.js';
import type { ValidationResult, ValidationCheck, FormulaDefinition } from '../../domain/types/calculation.types.js';

@Injectable()
export class ValidationEngine implements IValidationEngine {
  validateInputs(formula: FormulaDefinition, inputs: Record<string, number>): ValidationCheck[] {
    const checks: ValidationCheck[] = [];

    for (const param of formula.inputs) {
      const value = inputs[param.name];

      if (param.required && (value === undefined || value === null)) {
        checks.push({
          name: `input-${param.name}-required`, passed: false,
          message: `${param.label} is required`, severity: 'error',
        });
        continue;
      }

      if (value === undefined || value === null) continue;

      if (param.min !== undefined && value < param.min) {
        checks.push({
          name: `input-${param.name}-min`, passed: false,
          message: `${param.label} (${value}) is below minimum (${param.min} ${param.unit})`,
          severity: 'error', value, min: param.min,
        });
      }

      if (param.max !== undefined && value > param.max) {
        checks.push({
          name: `input-${param.name}-max`, passed: false,
          message: `${param.label} (${value}) exceeds maximum (${param.max} ${param.unit})`,
          severity: 'error', value, max: param.max,
        });
      }

      // Physical plausibility checks
      if (value !== undefined && Number.isNaN(value)) {
        checks.push({
          name: `input-${param.name}-nan`, passed: false,
          message: `${param.label} is NaN`, severity: 'error',
        });
      }

      if (value !== undefined && !Number.isFinite(value)) {
        checks.push({
          name: `input-${param.name}-infinity`, passed: false,
          message: `${param.label} is infinite`, severity: 'error',
        });
      }
    }

    if (checks.length === 0) {
      checks.push({
        name: 'inputs-valid', passed: true,
        message: 'All inputs validated successfully', severity: 'info',
      });
    }

    return checks;
  }

  validateOutputs(formula: FormulaDefinition, outputs: Record<string, number>, _inputs: Record<string, number>): ValidationCheck[] {
    const checks: ValidationCheck[] = [];

    for (const out of formula.outputs) {
      const value = outputs[out.name];

      if (value === undefined || value === null) {
        checks.push({
          name: `output-${out.name}-missing`, passed: false,
          message: `Output ${out.label} was not produced`, severity: 'error',
        });
        continue;
      }

      if (Number.isNaN(value)) {
        checks.push({
          name: `output-${out.name}-nan`, passed: false,
          message: `${out.label} is NaN`, severity: 'error',
        });
      }

      if (!Number.isFinite(value)) {
        checks.push({
          name: `output-${out.name}-infinity`, passed: false,
          message: `${out.label} is infinite`, severity: 'error',
        });
      }

      if (out.name.toLowerCase().includes('verdict') || out.name.toLowerCase().includes('safe') || out.name.toLowerCase().includes('compliant')) {
        if (value !== 0 && value !== 1) {
          checks.push({
            name: `output-${out.name}-invalid`, passed: false,
            message: `${out.label} must be 0 or 1, got ${value}`, severity: 'warning',
          });
        }
      }

      // Range sanity for percentages
      if (out.unit === '%' && (value < -100 || value > 1000)) {
        checks.push({
          name: `output-${out.name}-range`, passed: false,
          message: `${out.label} (${value}%) is outside plausible range`,
          severity: 'warning', value,
        });
      }
    }

    if (checks.length === 0) {
      checks.push({
        name: 'outputs-valid', passed: true,
        message: 'All outputs validated successfully', severity: 'info',
      });
    }

    return checks;
  }

  checkPhysicalConsistency(inputs: Record<string, number>, outputs: Record<string, number>): boolean {
    // Voltage drop cannot exceed 100%
    if (outputs['voltageDropPercent'] !== undefined && outputs['voltageDropPercent'] > 100) return false;

    // Efficiency cannot exceed 1 (100%)
    if (outputs['efficiency'] !== undefined && outputs['efficiency'] > 1) return false;

    // Power factor cannot exceed 1
    if (outputs['correctedPf'] !== undefined && outputs['correctedPf'] > 1) return false;
    if (inputs['currentPf'] !== undefined && inputs['currentPf'] > 1) return false;
    if (inputs['targetPf'] !== undefined && inputs['targetPf'] > 1) return false;

    // Selected cable CSA should not be zero when load current > 0
    if (outputs['selectedCsa'] !== undefined && outputs['selectedCsa'] === 0 && (inputs['loadCurrent'] ?? 0) > 0) return false;

    // Fault current should increase with source MVA
    if (outputs['initialSymmetricalCurrent'] !== undefined && outputs['initialSymmetricalCurrent'] < 0) return false;

    // Short-circuit peak ≥ symmetrical (κ√2 ≥ 1)
    if (outputs['peakCurrent'] !== undefined && outputs['initialSymmetricalCurrent'] !== undefined) {
      if (outputs['peakCurrent'] < outputs['initialSymmetricalCurrent']) return false;
    }

    return true;
  }

  validateAll(formula: FormulaDefinition, inputs: Record<string, number>, outputs: Record<string, number>): ValidationResult {
    const inputChecks = this.validateInputs(formula, inputs);
    const outputChecks = this.validateOutputs(formula, outputs, inputs);
    const physicalConsistency = this.checkPhysicalConsistency(inputs, outputs);

    const inputErrors = inputChecks.filter((c) => c.severity === 'error');
    const outputErrors = outputChecks.filter((c) => c.severity === 'error');
    const passed = inputErrors.length === 0 && outputErrors.length === 0 && physicalConsistency;

    return { passed, inputChecks, outputChecks, physicalConsistency };
  }
}
