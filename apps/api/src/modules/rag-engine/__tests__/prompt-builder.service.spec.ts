import { Test, TestingModule } from '@nestjs/testing';
import { PromptBuilder } from '../application/services/prompt-builder.service.js';

describe('PromptBuilder', () => {
  let service: PromptBuilder;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromptBuilder],
    }).compile();
    service = module.get<PromptBuilder>(PromptBuilder);
  });

  it('builds complete prompt with all sections', async () => {
    const context = {
      nodes: [{ content: 'test evidence', tier: 1 as any, chunkId: 'c1', tokenCount: 3, knowledgeObjectId: 'ko-1', sourceTier: 'platinum' as any }],
      totalTokens: 3, tierDistribution: { '1': 1 }, deduplicated: true,
    };
    const prompt = await service.build({ question: 'What is X?', workspaceId: 'ws-1' }, context);
    expect(prompt.system).toContain('Engineering Evidence Engine');
    expect(prompt.constraints).toContain('Engineering Constraints');
    expect(prompt.evidence).toContain('c1');
    expect(prompt.knowledge).toContain('ko-1');
    expect(prompt.question).toBe('What is X?');
    expect(prompt.outputRules).toContain('Output Rules');
    expect(prompt.fullPrompt).toContain('[REDACTED]');
  });

  it('includes tier filters in constraints', async () => {
    const context = { nodes: [], totalTokens: 0, tierDistribution: {}, deduplicated: true };
    const prompt = await service.build({ question: 'Q', workspaceId: 'ws-1', filters: { tiers: ['platinum', 'gold'] } }, context);
    expect(prompt.constraints).toContain('platinum, gold');
  });

  it('includes language filters in constraints', async () => {
    const context = { nodes: [], totalTokens: 0, tierDistribution: {}, deduplicated: true };
    const prompt = await service.build({ question: 'Q', workspaceId: 'ws-1', filters: { languages: ['fa', 'en'] } }, context);
    expect(prompt.constraints).toContain('fa, en');
  });

  it('includes versionStatus in constraints', async () => {
    const context = { nodes: [], totalTokens: 0, tierDistribution: {}, deduplicated: true };
    const prompt = await service.build({ question: 'Q', workspaceId: 'ws-1', filters: { versionStatus: 'active' } }, context);
    expect(prompt.constraints).toContain('active');
  });

  it('includes minAuthorityScore in constraints', async () => {
    const context = { nodes: [], totalTokens: 0, tierDistribution: {}, deduplicated: true };
    const prompt = await service.build({ question: 'Q', workspaceId: 'ws-1', filters: { minAuthorityScore: 0.5 } }, context);
    expect(prompt.constraints).toContain('0.5');
  });

  it('sanitizePrompt redacts sensitive sections', () => {
    const prompt = {
      system: 'system instruction', constraints: 'constraint text', evidence: 'evidence text',
      knowledge: 'knowledge text', question: 'Q', outputRules: 'rules text', fullPrompt: 'system section and knowledge section and constraints section',
    };
    const sanitized = service.sanitizePrompt(prompt);
    expect(sanitized.fullPrompt).not.toContain('system');
    expect(sanitized.fullPrompt).not.toContain('knowledge');
  });

  it('builds knowledge section with token total', async () => {
    const context = {
      nodes: [{ content: 'content', tier: 2 as any, chunkId: 'c1', tokenCount: 5, knowledgeObjectId: 'ko-1', sourceTier: 'gold' as any }],
      totalTokens: 5, tierDistribution: { '2': 1 }, deduplicated: true,
    };
    const prompt = await service.build({ question: 'Q', workspaceId: 'ws-1' }, context);
    expect(prompt.knowledge).toContain('Total tokens: 5');
  });
});
