import { Injectable } from '@nestjs/common';
import type { WorkflowDefinition } from '../domain/workflow-definition.entity.js';
import type { WorkflowStep } from '../domain/workflow-definition.entity.js';
import type { IWorkflowValidator, ValidationResult, ValidationError } from '../domain/workflow-validator.interface.js';

@Injectable()
export class WorkflowValidatorService implements IWorkflowValidator {
  validate(definition: WorkflowDefinition): ValidationResult {
    const errors: ValidationError[] = [];

    if (!definition.name || definition.name.trim().length === 0) {
      errors.push({
        path: 'name',
        message: 'Workflow name is required',
        severity: 'error',
      });
    }

    if (!definition.steps || definition.steps.length === 0) {
      errors.push({
        path: 'steps',
        message: 'Workflow must have at least one step',
        severity: 'error',
      });
      return { valid: false, errors };
    }

    const stepIds = new Set<string>();
    const stepMap = new Map<string, WorkflowStep>();

    for (let i = 0; i < definition.steps.length; i++) {
      const step = definition.steps[i];

      if (!step) {
        continue;
      }

      if (!step.id || step.id.trim().length === 0) {
        errors.push({
          path: `steps[${i}].id`,
          message: 'Step id is required',
          severity: 'error',
        });
        continue;
      }

      if (stepIds.has(step.id)) {
        errors.push({
          path: `steps[${i}].id`,
          message: `Duplicate step id "${step.id}"`,
          severity: 'error',
        });
      }
      stepIds.add(step.id);
      stepMap.set(step.id, step);

      if (!step.name || step.name.trim().length === 0) {
        errors.push({
          path: `steps[${i}].name`,
          message: 'Step name is required',
          severity: 'error',
        });
      }

      if (!step.type) {
        errors.push({
          path: `steps[${i}].type`,
          message: 'Step type is required',
          severity: 'error',
        });
      }

      if (step.type === 'conditional' && (!step.config || !step.config.condition)) {
        errors.push({
          path: `steps[${i}].config`,
          message: 'Conditional step must have a condition in config',
          severity: 'error',
        });
      }

      if (step.retryConfig != null) {
        if (step.retryConfig.maxRetries < 0) {
          errors.push({
            path: `steps[${i}].retryConfig.maxRetries`,
            message: 'maxRetries must be a non-negative number',
            severity: 'error',
          });
        }
        if (step.retryConfig.backoffMs < 0) {
          errors.push({
            path: `steps[${i}].retryConfig.backoffMs`,
            message: 'backoffMs must be a non-negative number',
            severity: 'error',
          });
        }
      }

      if (step.timeoutMs != null && step.timeoutMs < 0) {
        errors.push({
          path: `steps[${i}].timeoutMs`,
          message: 'timeoutMs must be a non-negative number',
          severity: 'error',
        });
      }
    }

    for (let i = 0; i < definition.steps.length; i++) {
      const step = definition.steps[i];

      if (!step) {
        continue;
      }

      if (step.next) {
        for (const nextId of step.next) {
          if (!stepMap.has(nextId)) {
            errors.push({
              path: `steps[${i}].next`,
              message: `Step "${step.id}" references non-existent next step "${nextId}"`,
              severity: 'error',
            });
          }
        }
      }

      if (step.onFailure) {
        if (!stepMap.has(step.onFailure)) {
          errors.push({
            path: `steps[${i}].onFailure`,
            message: `Step "${step.id}" references non-existent onFailure step "${step.onFailure}"`,
            severity: 'error',
          });
        }
      }
    }

    const cycleErrors = this.detectCycles(definition.steps);
    errors.push(...cycleErrors);

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
    };
  }

  private detectCycles(steps: WorkflowStep[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const adjacency = new Map<string, string[]>();

    for (const step of steps) {
      adjacency.set(step.id, step.next ?? []);
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string, path: string[]): boolean => {
      if (recStack.has(nodeId)) {
        const cyclePath = [...path.slice(path.indexOf(nodeId)), nodeId].join(' -> ');
        errors.push({
          path: `steps[${steps.findIndex(s => s.id === nodeId)}].next`,
          message: `Circular dependency detected: ${cyclePath}`,
          severity: 'error',
        });
        return true;
      }

      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);

      for (const neighbour of adjacency.get(nodeId) ?? []) {
        dfs(neighbour, path);
      }

      path.pop();
      recStack.delete(nodeId);
      return false;
    };

    for (const step of steps) {
      if (!visited.has(step.id)) {
        dfs(step.id, []);
      }
    }

    return errors;
  }
}
