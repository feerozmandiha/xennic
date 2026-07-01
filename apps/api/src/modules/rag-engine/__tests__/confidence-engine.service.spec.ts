import { Test, TestingModule } from '@nestjs/testing';
import { ConfidenceEngine } from '../application/services/confidence-engine.service.js';

function makeChunk(score: number, authorityScore: number, tier: any, status = 'active') {
  return {
    chunkId: 'c1', knowledgeObjectId: 'ko-1', content: 'test', score,
    metadata: { title: '', xid: '', tier, language: 'en', version: 1, status: status as any, authorityScore, taxonomy: [], ontology: [] },
  };
}

describe('ConfidenceEngine', () => {
  let service: ConfidenceEngine;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfidenceEngine],
    }).compile();
    service = module.get<ConfidenceEngine>(ConfidenceEngine);
  });

  it('calculates overall confidence with all factors', async () => {
    const chunks = [makeChunk(0.9, 0.85, 'gold')];
    const citations = [
      { statement: 'test', confidence: 0.9, authorityScore: 0.85, sourceTier: 'gold' as any, citationChain: ['XID-1'], evidence: { documentXid: 'XID-1', documentTitle: 'Doc', version: 1 } },
    ];
    const result = await service.calculate(chunks, citations, [0.9]);
    expect(result.overall).toBeGreaterThan(0);
    expect(result.overall).toBeLessThanOrEqual(1);
    expect(result.factors.authorityScore).toBe(0.85);
    expect(result.factors.versionStatus).toBe(1);
  });

  it('authorityScore averages chunk authority', () => {
    const chunks = [makeChunk(0.5, 0.8, 'gold'), makeChunk(0.5, 0.6, 'silver')];
    expect(service.calculateAuthorityScore(chunks)).toBe(0.7);
  });

  it('evidenceCoverage is ratio of citations to expected', () => {
    expect(service.calculateEvidenceCoverage([{} as any, {} as any], 4)).toBe(0.5);
    expect(service.calculateEvidenceCoverage([], 0)).toBe(0);
  });

  it('agreement is 1 for single chunk', () => {
    expect(service.calculateAgreement([makeChunk(0.5, 0.5, 'gold')])).toBe(1);
  });

  it('agreement is 1 when all same tier', () => {
    const chunks = [makeChunk(0.5, 0.5, 'gold'), makeChunk(0.5, 0.5, 'gold')];
    expect(service.calculateAgreement(chunks)).toBe(1);
  });

  it('agreement is 0.7 for mixed tiers', () => {
    const chunks = [makeChunk(0.5, 0.5, 'gold'), makeChunk(0.5, 0.5, 'bronze')];
    expect(service.calculateAgreement(chunks)).toBe(0.7);
  });

  it('chunkQuality averages normalized scores', () => {
    const chunks = [makeChunk(0.5, 0.5, 'gold'), makeChunk(1.5, 0.5, 'gold')];
    const q = service.calculateChunkQuality(chunks);
    expect(q).toBeGreaterThan(0);
  });

  it('retrievalScore averages and clamps to 1', () => {
    expect(service.calculateRetrievalScore([0.5, 0.7, 0.3])).toBeCloseTo(0.5, 1);
  });

  it('versionStatusScore is 1 for all active', () => {
    const chunks = [makeChunk(0.5, 0.5, 'gold', 'active'), makeChunk(0.5, 0.5, 'gold', 'active')];
    expect(service.calculateVersionStatusScore(chunks)).toBe(1);
  });

  it('versionStatusScore is lower for superseded', () => {
    const chunks = [makeChunk(0.5, 0.5, 'gold', 'superseded')];
    expect(service.calculateVersionStatusScore(chunks)).toBe(0.3);
  });

  it('versionStatusScore is 0 for withdrawn', () => {
    const chunks = [makeChunk(0.5, 0.5, 'gold', 'withdrawn')];
    expect(service.calculateVersionStatusScore(chunks)).toBe(0);
  });

  it('returns 0 for empty inputs', async () => {
    const result = await service.calculate([], [], []);
    expect(result.overall).toBe(0);
  });
});
