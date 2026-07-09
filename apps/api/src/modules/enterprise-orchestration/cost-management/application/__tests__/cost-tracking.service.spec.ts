import { Test, TestingModule } from '@nestjs/testing';
import { CostTrackingService } from '../cost-tracking.service.js';
import { InMemoryCostRepository } from '../../testing/adapters/in-memory-cost-repository.js';

describe('CostTrackingService', () => {
  let service: CostTrackingService;
  let repository: any;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CostTrackingService,
        { provide: 'ICostRepository', useClass: InMemoryCostRepository },
      ],
    }).compile();

    service = module.get(CostTrackingService);
    repository = module.get('ICostRepository');
  });

  describe('recordProviderCost', () => {
    it('should record a provider cost entry', async () => {
      const entry = await service.recordProviderCost('exec-1', 'openai', 'gpt-4', 1000, 0.03, 250, {
        region: 'us-east',
      });

      expect(entry.id).toBeDefined();
      expect(entry.workflowExecutionId).toBe('exec-1');
      expect(entry.sourceType).toBe('provider');
      expect(entry.sourceId).toBe('openai:gpt-4');
      expect(entry.amount).toBe(0.03);
      expect(entry.tokens).toBe(1000);
      expect(entry.latency).toBe(250);
      expect(entry.metadata).toMatchObject({
        provider: 'openai',
        model: 'gpt-4',
        region: 'us-east',
      });
    });
  });

  describe('recordSkillCost', () => {
    it('should record a skill cost entry', async () => {
      const entry = await service.recordSkillCost('exec-1', 'skill-1', 500, 0.01, 100);

      expect(entry.sourceType).toBe('skill');
      expect(entry.sourceId).toBe('skill-1');
      expect(entry.amount).toBe(0.01);
      expect(entry.tokens).toBe(500);
      expect(entry.latency).toBe(100);
    });
  });

  describe('recordToolCost', () => {
    it('should record a tool cost entry', async () => {
      const entry = await service.recordToolCost('exec-1', 'tool-1', 0.005);

      expect(entry.sourceType).toBe('tool');
      expect(entry.sourceId).toBe('tool-1');
      expect(entry.amount).toBe(0.005);
      expect(entry.costType).toBe('api_call');
    });
  });

  describe('recordWorkflowCost', () => {
    it('should record a workflow cost entry', async () => {
      const entry = await service.recordWorkflowCost('exec-1', 0.1);

      expect(entry.sourceType).toBe('workflow');
      expect(entry.sourceId).toBe('exec-1');
      expect(entry.amount).toBe(0.1);
      expect(entry.costType).toBe('compute');
    });
  });

  describe('getExecutionCost', () => {
    it('should return aggregated ResourceUsage', async () => {
      await service.recordProviderCost('exec-2', 'anthropic', 'claude-3', 2000, 0.06, 300);
      await service.recordProviderCost('exec-2', 'anthropic', 'claude-3', 1000, 0.03, 150);
      await service.recordSkillCost('exec-2', 'skill-2', 800, 0.02, 200);

      const usage = await service.getExecutionCost('exec-2');

      expect(usage.totalTokens).toBe(3800);
      expect(usage.totalCost).toBe(0.11);
      expect(usage.totalCalls).toBe(3);
      expect(usage.totalLatency).toBe(650);
      expect(usage.avgLatency).toBeCloseTo(216.67, 1);
      expect(usage.byProvider['anthropic:claude-3']).toBeDefined();
      expect(usage.byProvider['anthropic:claude-3'].tokens).toBe(3000);
      expect(usage.byProvider['anthropic:claude-3'].cost).toBe(0.09);
      expect(usage.byProvider['anthropic:claude-3'].calls).toBe(2);
      expect(usage.bySkill['skill-2'].tokens).toBe(800);
    });

    it('should return empty ResourceUsage for unknown execution', async () => {
      const usage = await service.getExecutionCost('nonexistent');

      expect(usage.totalTokens).toBe(0);
      expect(usage.totalCost).toBe(0);
      expect(usage.totalCalls).toBe(0);
    });
  });

  describe('getTopCosts', () => {
    it('should return entries sorted by cost descending', async () => {
      await service.recordProviderCost('exec-a', 'openai', 'gpt-4', 1000, 0.1);
      await service.recordProviderCost('exec-b', 'anthropic', 'claude-3', 2000, 0.5);
      await service.recordProviderCost('exec-c', 'google', 'gemini', 500, 0.02);

      const top = await service.getTopCosts(2);
      expect(top).toHaveLength(2);
      expect(top[0]!.amount).toBe(0.5);
      expect(top[1]!.amount).toBe(0.1);
    });
  });
});
