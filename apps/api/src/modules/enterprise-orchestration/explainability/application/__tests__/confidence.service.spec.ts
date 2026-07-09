import { Test, TestingModule } from '@nestjs/testing';
import { ConfidenceService } from '../confidence.service.js';
import { InMemoryExplainabilityRepository } from '../../testing/adapters/in-memory-explainability-repository.js';

describe('ConfidenceService', () => {
  let service: ConfidenceService;
  let repository: any;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfidenceService,
        { provide: 'IExplainabilityRepository', useClass: InMemoryExplainabilityRepository },
      ],
    }).compile();

    service = module.get(ConfidenceService);
    repository = module.get('IExplainabilityRepository');
  });

  describe('recordConfidence', () => {
    it('should record a confidence score', async () => {
      const result = await service.recordConfidence('exec-1', 'step-1', 0.85, [
        { name: 'data_quality', weight: 0.5, value: 0.9, description: 'Quality of input data' },
        {
          name: 'model_accuracy',
          weight: 0.5,
          value: 0.8,
          description: 'Historical model accuracy',
        },
      ]);

      expect(result.id).toBeDefined();
      expect(result.executionId).toBe('exec-1');
      expect(result.stepId).toBe('step-1');
      expect(result.score).toBe(0.85);
      expect(result.factors).toHaveLength(2);
    });

    it('should throw for invalid score', async () => {
      await expect(service.recordConfidence('exec-1', 'step-1', 1.5, [])).rejects.toThrow(
        'Confidence score must be between 0 and 1',
      );

      await expect(service.recordConfidence('exec-1', 'step-1', -0.1, [])).rejects.toThrow(
        'Confidence score must be between 0 and 1',
      );
    });
  });

  describe('getConfidence', () => {
    it('should return all confidence scores for an execution', async () => {
      await service.recordConfidence('exec-1', 'step-1', 0.9, []);
      await service.recordConfidence('exec-1', 'step-2', 0.7, []);

      const result = await service.getConfidence('exec-1');
      expect(result).toHaveLength(2);
    });

    it('should return empty for nonexistent execution', async () => {
      const result = await service.getConfidence('nonexistent');
      expect(result).toHaveLength(0);
    });
  });

  describe('getConfidenceSummary', () => {
    it('should return summary with avg, min, max, byStep', async () => {
      await service.recordConfidence('exec-1', 'step-1', 0.9, [
        { name: 'factor_a', weight: 1, value: 0.9, description: 'A' },
      ]);
      await service.recordConfidence('exec-1', 'step-2', 0.5, [
        { name: 'factor_b', weight: 1, value: 0.5, description: 'B' },
      ]);
      await service.recordConfidence('exec-1', 'step-1', 0.8, [
        { name: 'factor_c', weight: 1, value: 0.8, description: 'C' },
      ]);

      const summary = await service.getConfidenceSummary('exec-1');
      expect(summary.avg).toBeCloseTo(0.73, 1);
      expect(summary.min).toBe(0.5);
      expect(summary.max).toBe(0.9);
      expect(summary.byStep['step-1']).toHaveLength(2);
      expect(summary.byStep['step-2']).toHaveLength(1);
    });

    it('should return zeros for empty execution', async () => {
      const summary = await service.getConfidenceSummary('nonexistent');
      expect(summary.avg).toBe(0);
      expect(summary.min).toBe(0);
      expect(summary.max).toBe(0);
      expect(summary.byStep).toEqual({});
    });
  });

  describe('getLowConfidenceSteps', () => {
    it('should return steps below threshold', async () => {
      await service.recordConfidence('exec-1', 'step-1', 0.9, []);
      await service.recordConfidence('exec-1', 'step-2', 0.4, [
        { name: 'noise', weight: 1, value: 0.4, description: 'High noise' },
      ]);
      await service.recordConfidence('exec-1', 'step-3', 0.6, []);

      const low = await service.getLowConfidenceSteps('exec-1', 0.5);
      expect(low).toHaveLength(1);
      expect(low[0].stepId).toBe('step-2');
      expect(low[0].score).toBe(0.4);
    });

    it('should return empty when all above threshold', async () => {
      await service.recordConfidence('exec-1', 'step-1', 0.9, []);
      await service.recordConfidence('exec-1', 'step-2', 0.8, []);

      const low = await service.getLowConfidenceSteps('exec-1', 0.5);
      expect(low).toHaveLength(0);
    });
  });
});
