import { Test, TestingModule } from '@nestjs/testing';
import { EvidenceChainService } from '../application/services/evidence-chain.service.js';

describe('EvidenceChainService', () => {
  let service: EvidenceChainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvidenceChainService],
    }).compile();
    service = module.get<EvidenceChainService>(EvidenceChainService);
  });

  it('creates an evidence chain with all fields', () => {
    const chain = service.create({
      traceId: 'trace-1', question: 'What is X?', retrievedChunks: [], rankingScores: {},
      selectedEvidence: [], reasoningReferences: [], generatedAnswer: 'Answer',
      citations: [{ statement: 'X is Y', confidence: 0.9, authorityScore: 0.85, sourceTier: 'gold' as any, citationChain: ['XID-1'], evidence: { documentXid: 'XID-1', documentTitle: 'Doc', version: 1 } }],
      finalConfidence: 0.85,
      timestamps: { retrieval: 10, ranking: 5, contextBuilding: 3, generation: 20, validation: 2 },
    });
    expect(chain.traceId).toBe('trace-1');
    expect(chain.finalConfidence).toBe(0.85);
  });

  it('generates unique trace IDs', () => {
    const id1 = service.getTraceId();
    const id2 = service.getTraceId();
    expect(id1).not.toBe(id2);
  });

  it('verifies a valid chain returns true', () => {
    const chain = service.create({
      traceId: 'trace-2', question: 'Q?', retrievedChunks: [{ chunkId: 'c1', knowledgeObjectId: 'ko-1', content: 'test', score: 0.8, metadata: {} as any, provenance: undefined }],
      rankingScores: { c1: 0.8 }, selectedEvidence: [{ chunkId: 'c1', knowledgeObjectId: 'ko-1', content: 'test', score: 0.8, metadata: {} as any }],
      reasoningReferences: [], generatedAnswer: 'A',
      citations: [{ statement: 'A', confidence: 0.9, authorityScore: 0.85, sourceTier: 'gold' as any, citationChain: ['XID-1'], evidence: { documentXid: 'XID-1', documentTitle: 'Doc', version: 1 } }],
      finalConfidence: 0.85,
      timestamps: { retrieval: 10, ranking: 5, contextBuilding: 3, generation: 20, validation: 2 },
    });
    expect(service.verifyChain(chain)).toBe(true);
  });

  it('verifies invalid chain returns false', () => {
    const chain = service.create({
      traceId: '', question: '', retrievedChunks: [], rankingScores: {}, selectedEvidence: [],
      reasoningReferences: [], generatedAnswer: '',
      citations: [], finalConfidence: 0,
      timestamps: { retrieval: 0, ranking: 0, contextBuilding: 0, generation: 0, validation: 0 },
    });
    expect(service.verifyChain(chain)).toBe(false);
  });

  it('rejects chain with invalid citations', () => {
    const chain = service.create({
      traceId: 't1', question: 'Q', retrievedChunks: [{ chunkId: 'c1', knowledgeObjectId: 'ko-1', content: 't', score: 1, metadata: {} as any }],
      rankingScores: {}, selectedEvidence: [{ chunkId: 'c1', knowledgeObjectId: 'ko-1', content: 't', score: 1, metadata: {} as any }],
      reasoningReferences: [], generatedAnswer: 'A',
      citations: [{ statement: '', confidence: -1, authorityScore: 0, sourceTier: 'bronze' as any, citationChain: [], evidence: { documentXid: '', documentTitle: '', version: 0 } }],
      finalConfidence: 0,
      timestamps: { retrieval: 1, ranking: 1, contextBuilding: 1, generation: 1, validation: 1 },
    });
    expect(service.verifyChain(chain)).toBe(false);
  });
});
