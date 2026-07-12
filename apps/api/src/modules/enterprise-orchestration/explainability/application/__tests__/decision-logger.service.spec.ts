import { Test, TestingModule } from '@nestjs/testing';
import { DecisionLoggerService } from '../decision-logger.service.js';
import { InMemoryExplainabilityRepository } from '../../testing/adapters/in-memory-explainability-repository.js';

describe('DecisionLoggerService', () => {
  let service: DecisionLoggerService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecisionLoggerService,
        { provide: 'IExplainabilityRepository', useClass: InMemoryExplainabilityRepository },
      ],
    }).compile();

    service = module.get(DecisionLoggerService);
  });

  describe('log', () => {
    it('should log a decision', async () => {
      const result = await service.log(
        'exec-1',
        'step-1',
        'tool_selection',
        'Selected tool Alpha',
        'Alpha had highest accuracy score',
        ['Beta', 'Gamma'],
        0.85,
        'user-1',
      );

      expect(result.id).toBeDefined();
      expect(result.workflowExecutionId).toBe('exec-1');
      expect(result.stepId).toBe('step-1');
      expect(result.decisionType).toBe('tool_selection');
      expect(result.decision).toBe('Selected tool Alpha');
      expect(result.rationale).toBe('Alpha had highest accuracy score');
      expect(result.alternatives).toEqual(['Beta', 'Gamma']);
      expect(result.confidence).toBe(0.85);
      expect(result.actor).toBe('user-1');
    });

    it('should log a decision without optional fields', async () => {
      const result = await service.log(
        'exec-1',
        'step-1',
        'policy',
        'Policy P1 applied',
        'Default policy matched',
      );

      expect(result.alternatives).toEqual([]);
      expect(result.confidence).toBeNull();
      expect(result.actor).toBeNull();
    });
  });

  describe('getLog', () => {
    it('should return decisions for an execution', async () => {
      await service.log('exec-1', 'step-1', 'routing', 'Routed to agent A', 'Agent A has capacity');
      await service.log('exec-1', 'step-2', 'policy', 'Policy applied', 'Matched policy P1');

      const result = await service.getLog('exec-1');
      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
    });

    it('should return empty for nonexistent execution', async () => {
      const result = await service.getLog('nonexistent');
      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });
  });

  describe('getDecisionsByType', () => {
    it('should filter by decision type', async () => {
      await service.log('exec-1', 'step-1', 'routing', 'Routed', 'Capacity');
      await service.log('exec-1', 'step-2', 'policy', 'Policy', 'Matched');

      const result = await service.getDecisionsByType('exec-1', 'policy');
      expect(result).toHaveLength(1);
      expect(result[0].decisionType).toBe('policy');
    });
  });

  describe('getFullReport', () => {
    it('should return full report with all decisions', async () => {
      await service.log('exec-1', 'step-1', 'tool_selection', 'Selected X', 'Best score');
      await service.log('exec-1', 'step-2', 'policy', 'Policy Y', 'Default');

      const report = await service.getFullReport('exec-1');
      expect(report.executionId).toBe('exec-1');
      expect(report.total).toBe(2);
      expect(report.decisions).toHaveLength(2);
    });
  });
});
