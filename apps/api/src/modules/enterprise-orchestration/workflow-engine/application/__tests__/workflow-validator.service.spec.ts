import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowValidatorService } from '../workflow-validator.service.js';
import type { IWorkflowValidator, ValidationResult } from '../../domain/workflow-validator.interface.js';
import { WorkflowDefinition } from '../../domain/workflow-definition.entity.js';
import type { WorkflowStep } from '../../domain/workflow-definition.entity.js';

describe('WorkflowValidatorService', () => {
  let validator: IWorkflowValidator;

  const makeDefinition = (steps: WorkflowStep[]): WorkflowDefinition => {
    return WorkflowDefinition.reconstitute(
      'test-id',
      'test-workflow',
      'A test workflow',
      1,
      steps,
      [],
      null,
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
        updatedBy: null,
      },
      new Date(),
      new Date(),
      'draft',
    );
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: 'IWorkflowValidator', useClass: WorkflowValidatorService },
      ],
    }).compile();

    validator = module.get('IWorkflowValidator');
  });

  describe('valid definitions', () => {
    it('should pass for a valid linear workflow', () => {
      const steps: WorkflowStep[] = [
        {
          id: 'step-1',
          type: 'task',
          name: 'First',
          description: '',
          config: {},
          next: ['step-2'],
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
        {
          id: 'step-2',
          type: 'task',
          name: 'Second',
          description: '',
          config: {},
          next: null,
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
      ];

      const result: ValidationResult = validator.validate(makeDefinition(steps));
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for a parallel workflow', () => {
      const steps: WorkflowStep[] = [
        {
          id: 'fork',
          type: 'parallel',
          name: 'Fork',
          description: '',
          config: {},
          next: ['branch-a', 'branch-b'],
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
        {
          id: 'branch-a',
          type: 'task',
          name: 'Branch A',
          description: '',
          config: {},
          next: ['join'],
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
        {
          id: 'branch-b',
          type: 'task',
          name: 'Branch B',
          description: '',
          config: {},
          next: ['join'],
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
        {
          id: 'join',
          type: 'task',
          name: 'Join',
          description: '',
          config: {},
          next: null,
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
      ];

      const result = validator.validate(makeDefinition(steps));
      expect(result.valid).toBe(true);
    });
  });

  describe('missing next refs', () => {
    it('should detect references to non-existent steps', () => {
      const steps: WorkflowStep[] = [
        {
          id: 'step-1',
          type: 'task',
          name: 'First',
          description: '',
          config: {},
          next: ['ghost-step'],
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
      ];

      const result = validator.validate(makeDefinition(steps));
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path.includes('next'))).toBe(true);
    });

    it('should detect references to non-existent onFailure steps', () => {
      const steps: WorkflowStep[] = [
        {
          id: 'step-1',
          type: 'task',
          name: 'First',
          description: '',
          config: {},
          next: null,
          onFailure: 'missing-handler',
          retryConfig: null,
          timeoutMs: null,
        },
      ];

      const result = validator.validate(makeDefinition(steps));
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path.includes('onFailure'))).toBe(true);
    });
  });

  describe('duplicate step IDs', () => {
    it('should detect duplicate step ids', () => {
      const steps: WorkflowStep[] = [
        {
          id: 'dup-id',
          type: 'task',
          name: 'First',
          description: '',
          config: {},
          next: null,
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
        {
          id: 'dup-id',
          type: 'task',
          name: 'Second',
          description: '',
          config: {},
          next: null,
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
      ];

      const result = validator.validate(makeDefinition(steps));
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Duplicate'))).toBe(true);
    });
  });

  describe('circular dependencies', () => {
    it('should detect a simple cycle', () => {
      const steps: WorkflowStep[] = [
        {
          id: 'a',
          type: 'task',
          name: 'A',
          description: '',
          config: {},
          next: ['b'],
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
        {
          id: 'b',
          type: 'task',
          name: 'B',
          description: '',
          config: {},
          next: ['a'],
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
      ];

      const result = validator.validate(makeDefinition(steps));
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Circular'))).toBe(true);
    });

    it('should detect a self-loop', () => {
      const steps: WorkflowStep[] = [
        {
          id: 'self',
          type: 'task',
          name: 'Self',
          description: '',
          config: {},
          next: ['self'],
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
      ];

      const result = validator.validate(makeDefinition(steps));
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Circular'))).toBe(true);
    });
  });

  describe('required fields', () => {
    it('should reject empty name', () => {
      const steps: WorkflowStep[] = [
        {
          id: 'step-1',
          type: 'task',
          name: 'Only step',
          description: '',
          config: {},
          next: null,
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
      ];

      const def = WorkflowDefinition.reconstitute(
        'test-id',
        '',
        'desc',
        1,
        steps,
        [],
        null,
        {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'u',
          updatedBy: null,
        },
        new Date(),
        new Date(),
        'draft',
      );

      const result = validator.validate(def);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path === 'name')).toBe(true);
    });

    it('should reject empty steps', () => {
      const result = validator.validate(makeDefinition([]));
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.path === 'steps')).toBe(true);
    });
  });
});
