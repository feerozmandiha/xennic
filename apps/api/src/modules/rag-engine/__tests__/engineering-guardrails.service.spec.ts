import { Test, TestingModule } from '@nestjs/testing';
import { EngineeringGuardrails } from '../application/services/engineering-guardrails.service.js';

describe('EngineeringGuardrails', () => {
  let service: EngineeringGuardrails;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EngineeringGuardrails],
    }).compile();
    service = module.get<EngineeringGuardrails>(EngineeringGuardrails);
  });

  it('allows response with valid evidence and citations', async () => {
    const evidence = [{ chunkId: 'c1', knowledgeObjectId: 'ws-1-ko-1', content: 'test', score: 0.9, metadata: { title: '', xid: '', tier: 'gold' as any, language: 'en', version: 1, status: 'active' as any, authorityScore: 0.85, taxonomy: [], ontology: [] } }];
    const response = {
      answer: 'test',
      citations: [{ statement: 'test', confidence: 0.9, authorityScore: 0.85, sourceTier: 'gold' as any, citationChain: ['XID-1'], evidence: { documentXid: 'XID-1', documentTitle: 'Doc', version: 1 } }],
      confidence: { overall: 0.85, factors: {} as any },
      evidenceChain: { selectedEvidence: evidence },
      metrics: {} as any,
      traceId: 't1',
    };
    const result = await service.checkResponse(response, { question: 'Q', workspaceId: 'ws-1' }, evidence);
    expect(result.allowed).toBe(true);
  });

  it('rejects when no evidence found', () => {
    const result = service.checkEvidencePresence([]);
    expect(result.allowed).toBe(false);
    expect(result.reasons[0]).toContain('No evidence');
  });

  it('rejects when all documents are outdated', () => {
    const outdated = [
      { chunkId: 'c1', knowledgeObjectId: 'ko-1', content: 'test', score: 0.5, metadata: { title: '', xid: '', tier: 'gold' as any, language: 'en', version: 1, status: 'superseded' as any, authorityScore: 0.5, taxonomy: [], ontology: [] } },
    ];
    const result = service.checkOutdatedDocuments(outdated);
    expect(result.allowed).toBe(false);
  });

  it('allows when at least some documents are active', () => {
    const mixed = [
      { chunkId: 'c1', knowledgeObjectId: 'ko-1', content: 'test', score: 0.5, metadata: { title: '', xid: '', tier: 'gold' as any, language: 'en', version: 1, status: 'active' as any, authorityScore: 0.5, taxonomy: [], ontology: [] } },
      { chunkId: 'c2', knowledgeObjectId: 'ko-1', content: 'test', score: 0.5, metadata: { title: '', xid: '', tier: 'gold' as any, language: 'en', version: 1, status: 'superseded' as any, authorityScore: 0.5, taxonomy: [], ontology: [] } },
    ];
    const result = service.checkOutdatedDocuments(mixed);
    expect(result.allowed).toBe(true);
  });

  it('rejects empty response', () => {
    const result = service.checkUnresolvableConflicts({ answer: '', citations: [], confidence: { overall: 0, factors: {} as any }, metrics: {} as any, traceId: 't1' });
    expect(result.allowed).toBe(false);
  });

  it('rejects response with conflict indicators', () => {
    const result = service.checkUnresolvableConflicts({ answer: 'The sources conflict on voltage level', citations: [], confidence: { overall: 0.5, factors: {} as any }, metrics: {} as any, traceId: 't1' });
    expect(result.allowed).toBe(false);
  });

  it('rejects workspace mismatch', () => {
    const response = {
      answer: 'test', citations: [], confidence: { overall: 0, factors: {} as any },
      evidenceChain: { selectedEvidence: [{ chunkId: 'c1', knowledgeObjectId: 'other-ws-ko-1', content: 'test', score: 0.9, metadata: {} as any }] },
      metrics: {} as any, traceId: 't1',
    };
    const result = service.checkWorkspaceMismatch(response, { question: 'Q', workspaceId: 'ws-1' });
    expect(result.allowed).toBe(false);
  });

  it('allows workspace match', () => {
    const response = {
      answer: 'test', citations: [], confidence: { overall: 0, factors: {} as any },
      evidenceChain: { selectedEvidence: [{ chunkId: 'c1', knowledgeObjectId: 'ws-1-ko-1', content: 'test', score: 0.9, metadata: {} as any }] },
      metrics: {} as any, traceId: 't1',
    };
    const result = service.checkWorkspaceMismatch(response, { question: 'Q', workspaceId: 'ws-1' });
    expect(result.allowed).toBe(true);
  });

  it('rejects without evidence chain (not workspace check)', () => {
    const response = { answer: 'test', citations: [], confidence: { overall: 0, factors: {} as any }, metrics: {} as any, traceId: 't1' };
    const result = service.checkWorkspaceMismatch(response as any, { question: 'Q', workspaceId: 'ws-1' });
    expect(result.allowed).toBe(true);
  });

  it('rejects response with no citations', () => {
    const response = { answer: 'test', citations: [], confidence: { overall: 0, factors: {} as any }, metrics: {} as any, traceId: 't1' };
    const result = service.checkInvalidCitations(response as any);
    expect(result.allowed).toBe(false);
  });

  it('rejects response with incomplete citations', () => {
    const response = {
      answer: 'test',
      citations: [{ statement: 'test', confidence: 0.9, authorityScore: 0.85, sourceTier: 'gold' as any, citationChain: [], evidence: { documentXid: '', documentTitle: '', version: 1 } }],
      confidence: { overall: 0, factors: {} as any }, metrics: {} as any, traceId: 't1',
    };
    const result = service.checkInvalidCitations(response as any);
    expect(result.allowed).toBe(false);
  });
});
