import type { WorkflowDefinition } from './workflow-definition.entity.js';

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface IWorkflowValidator {
  validate(definition: WorkflowDefinition): ValidationResult;
}
