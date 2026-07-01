import { Test, TestingModule } from '@nestjs/testing';
import { CitationEngineService } from '../application/services/citation-engine.service.js';

describe('CitationEngineService', () => {
  let service: CitationEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CitationEngineService],
    }).compile();
    service = module.get<CitationEngineService>(CitationEngineService);
  });

  it('generates citations for statements with evidence', async () => {
    const statements = ['The transformer rating is 100 MVA.', 'The voltage level is 230 kV.'];
    const evidence = [{
      chunkId: 'chunk-1', knowledgeObjectId: 'ko-1', content: 'The transformer rating is 100 MVA and voltage level is 230 kV.', score: 0.9,
      metadata: { title: 'Transformer Spec', xid: 'XID-001', tier: 'gold' as any, language: 'en', version: 2, status: 'active' as any, authorityScore: 0.85, taxonomy: ['standard'], ontology: [] },
      provenance: { sourceDocument: 'spec.pdf', section: '3.1', page: 5, paragraph: 2 },
    }];
    const citations = await service.generateCitations(statements, evidence);
    expect(citations).toHaveLength(2);
    expect(citations[0].evidence.documentXid).toBe('XID-001');
    expect(citations[0].evidence.section).toBe('3.1');
    expect(citations[0].evidence.page).toBe(5);
    expect(citations[0].confidence).toBeGreaterThan(0);
    expect(citations[0].citationChain).toContain('The transformer rating is 100 MVA.');
  });

  it('returns empty citations for no evidence', async () => {
    const citations = await service.generateCitations(['Some claim.'], []);
    expect(citations).toHaveLength(0);
  });

  it('validates a valid citation', () => {
    const valid = service.validateCitation({
      statement: 'test', confidence: 0.8, authorityScore: 0.9, sourceTier: 'gold' as any, citationChain: ['XID-1'],
      evidence: { documentXid: 'XID-1', documentTitle: 'Doc', version: 1 },
    });
    expect(valid).toBe(true);
  });

  it('rejects citation missing documentXid', () => {
    const valid = service.validateCitation({
      statement: 'test', confidence: 0.8, authorityScore: 0.9, sourceTier: 'gold' as any, citationChain: [],
      evidence: { documentXid: '', documentTitle: 'Doc', version: 1 },
    });
    expect(valid).toBe(false);
  });

  it('builds citation chains', () => {
    const citations = [
      { statement: 's1', confidence: 0.8, authorityScore: 0.9, sourceTier: 'gold' as any, citationChain: [], evidence: { documentXid: 'XID-1', documentTitle: 'D1', version: 1 } },
      { statement: 's2', confidence: 0.7, authorityScore: 0.8, sourceTier: 'silver' as any, citationChain: [], evidence: { documentXid: 'XID-1', documentTitle: 'D1', version: 1 } },
      { statement: 's3', confidence: 0.6, authorityScore: 0.7, sourceTier: 'bronze' as any, citationChain: [], evidence: { documentXid: 'XID-2', documentTitle: 'D2', version: 1 } },
    ];
    const chains = service.buildCitationChain(citations);
    expect(chains).toHaveLength(2);
    expect(chains[0]).toHaveLength(2);
    expect(chains[1]).toHaveLength(1);
  });
});
