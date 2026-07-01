import { Test, TestingModule } from '@nestjs/testing';
import { ContextBuilder } from '../application/services/context-builder.service.js';

describe('ContextBuilder', () => {
  let service: ContextBuilder;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContextBuilder],
    }).compile();
    service = module.get<ContextBuilder>(ContextBuilder);
  });

  it('prioritizes chunks by tier (platinum first)', () => {
    const chunks = [
      { chunkId: 'c1', knowledgeObjectId: 'ko-1', content: 'bronze content', score: 0.5, metadata: { title: '', xid: '', tier: 'bronze' as any, language: 'en', version: 1, status: 'active' as any, authorityScore: 0, taxonomy: [], ontology: [] } },
      { chunkId: 'c2', knowledgeObjectId: 'ko-1', content: 'platinum content', score: 0.6, metadata: { title: '', xid: '', tier: 'platinum' as any, language: 'en', version: 1, status: 'active' as any, authorityScore: 0, taxonomy: [], ontology: [] } },
      { chunkId: 'c3', knowledgeObjectId: 'ko-1', content: 'gold content', score: 0.7, metadata: { title: '', xid: '', tier: 'gold' as any, language: 'en', version: 1, status: 'active' as any, authorityScore: 0, taxonomy: [], ontology: [] } },
    ];
    const nodes = service.prioritizeByTier(chunks);
    expect(nodes[0].sourceTier).toBe('platinum');
    expect(nodes[1].sourceTier).toBe('gold');
    expect(nodes[2].sourceTier).toBe('bronze');
  });

  it('deduplicates overlapping chunks', () => {
    const nodes = [
      { content: 'a', tier: 1 as any, chunkId: 'c1', tokenCount: 5, knowledgeObjectId: 'ko-1', sourceTier: 'platinum' as any },
      { content: 'a', tier: 1 as any, chunkId: 'c1', tokenCount: 5, knowledgeObjectId: 'ko-1', sourceTier: 'platinum' as any },
      { content: 'b', tier: 2 as any, chunkId: 'c2', tokenCount: 5, knowledgeObjectId: 'ko-1', sourceTier: 'gold' as any },
    ];
    const deduped = service.deduplicate(nodes);
    expect(deduped).toHaveLength(2);
  });

  it('build respects token budget', async () => {
    const chunks = Array.from({ length: 20 }, (_, i) => ({
      chunkId: `c${i}`, knowledgeObjectId: 'ko-1', content: 'word '.repeat(50), score: 0.5 + i * 0.01,
      metadata: { title: '', xid: '', tier: 'silver' as any, language: 'en', version: 1, status: 'active' as any, authorityScore: 0, taxonomy: [], ontology: [] },
    }));
    const context = await service.build(chunks, 500);
    expect(context.totalTokens).toBeLessThanOrEqual(500);
    expect(context.nodes.length).toBeLessThan(chunks.length);
    expect(context.deduplicated).toBe(true);
  });

  it('build returns tierDistribution', async () => {
    const chunks = [
      { chunkId: 'c1', knowledgeObjectId: 'ko-1', content: 'test', score: 0.5, metadata: { title: '', xid: '', tier: 'platinum' as any, language: 'en', version: 1, status: 'active' as any, authorityScore: 0, taxonomy: [], ontology: [] } },
      { chunkId: 'c2', knowledgeObjectId: 'ko-1', content: 'test', score: 0.5, metadata: { title: '', xid: '', tier: 'gold' as any, language: 'en', version: 1, status: 'active' as any, authorityScore: 0, taxonomy: [], ontology: [] } },
    ];
    const context = await service.build(chunks, 500);
    expect(context.tierDistribution['1']).toBe(1);
    expect(context.tierDistribution['2']).toBe(1);
  });

  it('estimateTokens calculates roughly text length / 4', () => {
    expect(service.estimateTokens('hello world')).toBe(3);
    expect(service.estimateTokens('')).toBe(0);
  });

  it('getTierLevel maps correctly', () => {
    expect(service.getTierLevel('platinum')).toBe(1);
    expect(service.getTierLevel('gold')).toBe(2);
    expect(service.getTierLevel('silver')).toBe(3);
    expect(service.getTierLevel('bronze')).toBe(4);
    expect(service.getTierLevel('unknown')).toBe(4);
  });
});
