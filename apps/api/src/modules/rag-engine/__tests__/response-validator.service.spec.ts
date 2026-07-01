import { Test, TestingModule } from '@nestjs/testing';
import { ResponseValidator } from '../application/services/response-validator.service.js';

describe('ResponseValidator', () => {
  let service: ResponseValidator;

  const validResponse = {
    answer: 'The transformer rating is 100 MVA per the standard.',
    citations: [
      { statement: 'rating is 100 MVA', confidence: 0.9, authorityScore: 0.85, sourceTier: 'gold' as any, citationChain: ['XID-1'], evidence: { documentXid: 'XID-1', documentTitle: 'Standard IEC 60076', version: 2, section: '5.1', page: 10 } },
    ],
    confidence: { overall: 0.85, factors: {} as any },
    evidenceChain: {
      traceId: 't1', question: 'What is rating?', retrievedChunks: [], rankingScores: {},
      selectedEvidence: [{ chunkId: 'c1', knowledgeObjectId: 'ws-1-ko-1', content: 'test', score: 0.9, metadata: {} as any }],
      reasoningReferences: [], generatedAnswer: 'A', citations: [], finalConfidence: 0.85,
      timestamps: { retrieval: 1, ranking: 1, contextBuilding: 1, generation: 1, validation: 1 },
    },
    metrics: {} as any,
    traceId: 't1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseValidator],
    }).compile();
    service = module.get<ResponseValidator>(ResponseValidator);
  });

  it('passes valid response', async () => {
    const result = await service.validate({ question: 'Q', workspaceId: 'ws-1' }, validResponse);
    if (!result.valid) {
      console.error('Validation errors:', JSON.stringify(result.errors, null, 2));
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when citations are missing', async () => {
    const result = await service.validate({ question: 'Q', workspaceId: 'ws-1' }, { ...validResponse, citations: [] });
    expect(result.valid).toBe(false);
    expect(result.checks.citationCompleteness.passed).toBe(false);
  });

  it('fails when citation has no documentXid', async () => {
    const badCitations = [{ ...validResponse.citations[0], evidence: { documentXid: '', documentTitle: 'Doc', version: 1 } }];
    const result = await service.validate({ question: 'Q', workspaceId: 'ws-1' }, { ...validResponse, citations: badCitations });
    expect(result.valid).toBe(false);
  });

  it('detects unsupported claims', async () => {
    const manyClaims = 'The device is rated for 100A. It operates at 230V. It provides 50kW. It includes protection. It supports monitoring. It uses cooling.';
    const result = await service.validate({ question: 'Q', workspaceId: 'ws-1' }, { ...validResponse, answer: manyClaims });
    expect(result.valid).toBe(false);
  });

  it('detects conflicting standards', async () => {
    const conflicting = [
      { ...validResponse.citations[0] },
      { statement: 'other', confidence: 0.7, authorityScore: 0.6, sourceTier: 'silver' as any, citationChain: ['XID-2'], evidence: { documentXid: 'XID-2', documentTitle: 'Standard ISO 9001', version: 1 } },
      { statement: 'other2', confidence: 0.6, authorityScore: 0.5, sourceTier: 'bronze' as any, citationChain: ['XID-3'], evidence: { documentXid: 'XID-3', documentTitle: 'Standard IEEE 519', version: 1 } },
    ];
    const result = await service.validate({ question: 'Q', workspaceId: 'ws-1' }, { ...validResponse, citations: conflicting });
    expect(result.valid).toBe(false);
  });

  it('detects superseded documents', async () => {
    const superseded = [{ ...validResponse.citations[0], authorityScore: 0.1 }];
    const result = await service.validate({ question: 'Q', workspaceId: 'ws-1' }, { ...validResponse, citations: superseded });
    expect(result.valid).toBe(false);
  });

  it('detects workspace mismatch', async () => {
    const mismatched = {
      ...validResponse,
      evidenceChain: {
        ...validResponse.evidenceChain!,
        selectedEvidence: [{ chunkId: 'c1', knowledgeObjectId: 'other-ws-ko-1', content: 'test', score: 0.9, metadata: {} as any }],
      },
    };
    const result = await service.validate({ question: 'Q', workspaceId: 'ws-1' }, mismatched);
    expect(result.valid).toBe(false);
  });

  it('detects hallucination', async () => {
    const hallucinated = 'The quantum flux capacitor operates at 42 MHz and provides unlimited energy.';
    const result = await service.validate({ question: 'Q', workspaceId: 'ws-1' }, { ...validResponse, answer: hallucinated });
    expect(result.valid).toBe(false);
  });

  it('allows no evidenceChain for workspace check', async () => {
    const { evidenceChain: _, ...noChain } = validResponse;
    const result = await service.validate({ question: 'Q', workspaceId: 'ws-1' }, noChain as any);
    expect(result.checks.workspaceIsolation.passed).toBe(true);
  });

  it('passes hallucination check when all terms exist in citations', async () => {
    const safeAnswer = 'Standard IEC 60076 transformer rating 100 MVA';
    const result = await service.validate({ question: 'Q', workspaceId: 'ws-1' }, { ...validResponse, answer: safeAnswer });
    expect(result.checks.hallucinationDetection.passed).toBe(true);
  });
});
