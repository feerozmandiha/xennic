import { Test, TestingModule } from '@nestjs/testing';
import { CostAnalysisService } from '../cost-analysis.service.js';
import { CostTrackingService } from '../cost-tracking.service.js';
import { InMemoryCostRepository } from '../../../testing/adapters/in-memory-cost-repository.js';

describe('CostAnalysisService', () => {
  let analysisService: CostAnalysisService;
  let trackingService: CostTrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CostAnalysisService,
        CostTrackingService,
        { provide: 'ICostRepository', useClass: InMemoryCostRepository },
      ],
    }).compile();

    analysisService = module.get(CostAnalysisService);
    trackingService = module.get(CostTrackingService);
  });

  describe('analyzeExecution', () => {
    it('should return cost breakdown by source type', async () => {
      await trackingService.recordProviderCost('exec-1', 'openai', 'gpt-4', 1000, 0.06, 200);
      await trackingService.recordProviderCost('exec-1', 'anthropic', 'claude-3', 2000, 0.10, 300);
      await trackingService.recordSkillCost('exec-1', 'skill-1', 500, 0.02, 100);
      await trackingService.recordToolCost('exec-1', 'tool-1', 0.01);

      const breakdown = await analysisService.analyzeExecution('exec-1');

      expect(breakdown).toHaveLength(3);
      expect(breakdown[0]!.sourceType).toBe('provider');
      expect(breakdown[0]!.totalCost).toBe(0.16);
      expect(breakdown[0]!.totalTokens).toBe(3000);
      expect(breakdown[0]!.totalCalls).toBe(2);
      expect(breakdown[0]!.percentage).toBeCloseTo(84.21, 1);
    });

    it('should return empty array for unknown execution', async () => {
      const breakdown = await analysisService.analyzeExecution('nonexistent');
      expect(breakdown).toHaveLength(0);
    });
  });

  describe('compareExecutions', () => {
    it('should compare multiple executions', async () => {
      await trackingService.recordProviderCost('exec-a', 'openai', 'gpt-4', 1000, 0.06, 200);
      await trackingService.recordProviderCost('exec-b', 'anthropic', 'claude-3', 2000, 0.10, 300);

      const comparison = await analysisService.compareExecutions(['exec-a', 'exec-b']);

      expect(comparison).toHaveLength(2);
      expect(comparison[0]!.executionId).toBe('exec-a');
      expect(comparison[0]!.totalCost).toBe(0.06);
      expect(comparison[1]!.executionId).toBe('exec-b');
      expect(comparison[1]!.totalCost).toBe(0.10);
    });
  });

  describe('getTopCostExecutions', () => {
    it('should return most expensive entries', async () => {
      await trackingService.recordProviderCost('exec-x', 'openai', 'gpt-4', 1000, 0.50);
      await trackingService.recordProviderCost('exec-y', 'openai', 'gpt-4', 1000, 0.30);
      await trackingService.recordProviderCost('exec-z', 'openai', 'gpt-4', 1000, 0.10);

      const top = await analysisService.getTopCostExecutions(2);
      expect(top).toHaveLength(2);
      expect(top[0]!.amount).toBe(0.50);
      expect(top[1]!.amount).toBe(0.30);
    });
  });

  describe('getCostBreakdown', () => {
    it('should return pie-chart ready breakdown', async () => {
      await trackingService.recordProviderCost('exec-3', 'openai', 'gpt-4', 1000, 0.06, 200);
      await trackingService.recordSkillCost('exec-3', 'skill-1', 500, 0.02, 100);

      const breakdown = await analysisService.getCostBreakdown('exec-3');

      expect(breakdown).toHaveLength(2);
      expect(breakdown[0]!.label).toContain('provider:openai:gpt-4');
      expect(breakdown[0]!.value).toBe(0.06);
      expect(breakdown[0]!.percentage).toBeCloseTo(75, 0);
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost from workflow definition', async () => {
      const estimate = await analysisService.estimateCost({
        steps: [
          { type: 'provider', id: 'p1', estimatedTokens: 1000, estimatedCost: 0.05 },
          { type: 'skill', id: 's1', estimatedTokens: 500, estimatedCost: 0.02 },
          { type: 'tool', id: 't1', estimatedCost: 0.01 },
        ],
      });

      expect(estimate.estimatedCost).toBe(0.08);
      expect(estimate.estimatedTokens).toBe(1500);
      expect(estimate.estimatedDuration).toBe(8000);
      expect(estimate.confidence).toBeGreaterThan(0);
    });

    it('should return zero estimate for empty workflow', async () => {
      const estimate = await analysisService.estimateCost({ steps: [] });

      expect(estimate.estimatedCost).toBe(0);
      expect(estimate.estimatedTokens).toBe(0);
      expect(estimate.estimatedDuration).toBe(0);
      expect(estimate.confidence).toBe(0);
    });
  });
});
