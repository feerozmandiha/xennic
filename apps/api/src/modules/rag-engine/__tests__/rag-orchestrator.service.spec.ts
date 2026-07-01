import { Test, TestingModule } from '@nestjs/testing';
import { RagOrchestratorService } from '../application/services/rag-orchestrator.service.js';
import { EvidenceChainService } from '../application/services/evidence-chain.service.js';
import type { IHybridRetrievalService } from '../domain/interfaces/hybrid-retrieval.interface.js';
import type { ICitationEngine } from '../domain/interfaces/citation-engine.interface.js';
import type { IContextBuilder } from '../domain/interfaces/context-builder.interface.js';
import type { IPromptBuilder } from '../domain/interfaces/prompt-builder.interface.js';
import type { IResponseValidator } from '../domain/interfaces/response-validator.interface.js';
import type { IConflictResolver } from '../domain/interfaces/conflict-resolver.interface.js';
import type { IConfidenceEngine } from '../domain/interfaces/confidence-engine.interface.js';
import type { IEngineeringGuardrails } from '../domain/interfaces/engineering-guardrails.interface.js';

describe('RagOrchestratorService', () => {
  let service: RagOrchestratorService;
  let retrievalMock: jest.Mocked<IHybridRetrievalService>;
  let citationMock: jest.Mocked<ICitationEngine>;
  let contextMock: jest.Mocked<IContextBuilder>;
  let promptMock: jest.Mocked<IPromptBuilder>;
  let validatorMock: jest.Mocked<IResponseValidator>;
  let conflictMock: jest.Mocked<IConflictResolver>;
  let confidenceMock: jest.Mocked<IConfidenceEngine>;
  let guardrailsMock: jest.Mocked<IEngineeringGuardrails>;

  const mockChunk = {
    chunkId: 'c1', knowledgeObjectId: 'ws-1-ko-1', content: 'evidence content', score: 0.9,
    denseScore: 0.9, sparseScore: 0.7,
    metadata: { title: 'Doc', xid: 'XID-1', tier: 'gold' as any, language: 'en', version: 1, status: 'active' as any, authorityScore: 0.85, taxonomy: [], ontology: [] },
    provenance: { sourceDocument: 'doc.pdf', section: '2.1', page: 5 },
  };

  const mockCitation = {
    statement: 'evidence', confidence: 0.9, authorityScore: 0.85, sourceTier: 'gold' as any,
    citationChain: ['XID-1'],
    evidence: { documentXid: 'XID-1', documentTitle: 'Doc', version: 1, section: '2.1', page: 5 },
  };

  beforeEach(async () => {
    retrievalMock = {
      retrieve: jest.fn().mockResolvedValue([mockChunk]),
      denseSearch: jest.fn(),
      sparseSearch: jest.fn(),
      fuseResults: jest.fn(),
    };
    citationMock = {
      generateCitations: jest.fn().mockResolvedValue([mockCitation]),
      validateCitation: jest.fn(),
      buildCitationChain: jest.fn(),
    };
    contextMock = {
      build: jest.fn().mockResolvedValue({
        nodes: [{ content: 'evidence content', tier: 2 as any, chunkId: 'c1', tokenCount: 10, knowledgeObjectId: 'ws-1-ko-1', sourceTier: 'gold' as any }],
        totalTokens: 10, tierDistribution: { '2': 1 }, deduplicated: true,
      }),
      prioritizeByTier: jest.fn(),
      deduplicate: jest.fn(),
      estimateTokens: jest.fn(),
      getTierLevel: jest.fn(),
    };
    promptMock = {
      build: jest.fn().mockResolvedValue({
        system: '', constraints: '', evidence: '', knowledge: '', question: 'Q', outputRules: '', fullPrompt: 'prompt',
      }),
      buildSystemContext: jest.fn(),
      buildConstraints: jest.fn(),
      buildEvidenceSection: jest.fn(),
      buildKnowledgeSection: jest.fn(),
      buildOutputRules: jest.fn(),
      sanitizePrompt: jest.fn(),
    };
    validatorMock = {
      validate: jest.fn().mockResolvedValue({ valid: true, checks: {} as any, errors: [] }),
      checkCitationCompleteness: jest.fn(),
      checkUnsupportedClaims: jest.fn(),
      checkConflictingStandards: jest.fn(),
      checkSupersededDocuments: jest.fn(),
      checkWorkspaceIsolation: jest.fn(),
      checkHallucination: jest.fn(),
    };
    conflictMock = {
      resolve: jest.fn().mockResolvedValue({ resolved: true, conflicts: [], preferredSource: 'c1', explanation: '' }),
      getPriorityScore: jest.fn(),
      explainPriority: jest.fn(),
    };
    confidenceMock = {
      calculate: jest.fn().mockResolvedValue({ overall: 0.85, factors: { authorityScore: 0.85, evidenceCoverage: 1, agreement: 1, chunkQuality: 0.9, retrievalScore: 0.9, versionStatus: 1 } }),
      calculateAuthorityScore: jest.fn(),
      calculateEvidenceCoverage: jest.fn(),
      calculateAgreement: jest.fn(),
      calculateChunkQuality: jest.fn(),
      calculateRetrievalScore: jest.fn(),
      calculateVersionStatusScore: jest.fn(),
    };
    guardrailsMock = {
      checkResponse: jest.fn().mockResolvedValue({ allowed: true, reasons: [] }),
      checkEvidencePresence: jest.fn(),
      checkOutdatedDocuments: jest.fn(),
      checkUnresolvableConflicts: jest.fn(),
      checkWorkspaceMismatch: jest.fn(),
      checkInvalidCitations: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RagOrchestratorService,
        EvidenceChainService,
        { provide: 'IHybridRetrievalService', useValue: retrievalMock },
        { provide: 'ICitationEngine', useValue: citationMock },
        { provide: 'IContextBuilder', useValue: contextMock },
        { provide: 'IPromptBuilder', useValue: promptMock },
        { provide: 'IResponseValidator', useValue: validatorMock },
        { provide: 'IConflictResolver', useValue: conflictMock },
        { provide: 'IConfidenceEngine', useValue: confidenceMock },
        { provide: 'IEngineeringGuardrails', useValue: guardrailsMock },
      ],
    }).compile();
    service = module.get<RagOrchestratorService>(RagOrchestratorService);
  });

  it('executes full RAG pipeline successfully', async () => {
    const result = await service.query({ question: 'What is X?', workspaceId: 'ws-1' });
    expect(result.answer).toBeTruthy();
    expect(result.citations).toHaveLength(1);
    expect(result.confidence.overall).toBeGreaterThan(0);
    expect(result.traceId).toBeTruthy();
    expect(result.metrics.retrievalLatency).toBeGreaterThanOrEqual(0);
    expect(result.metrics.totalLatency).toBeGreaterThanOrEqual(0);
  });

  it('includes evidence chain when requested', async () => {
    const result = await service.query({ question: 'Q', workspaceId: 'ws-1', options: { includeEvidenceChain: true } });
    expect(result.evidenceChain).toBeDefined();
    expect(result.evidenceChain!.traceId).toBeTruthy();
  });

  it('excludes evidence chain by default', async () => {
    const result = await service.query({ question: 'Q', workspaceId: 'ws-1' });
    expect(result.evidenceChain).toBeUndefined();
  });

  it('returns rejection when guardrails fail', async () => {
    guardrailsMock.checkResponse.mockResolvedValue({ allowed: false, reasons: ['No evidence found'], recommendation: 'Broaden search' });
    const result = await service.query({ question: 'Q', workspaceId: 'ws-1' });
    expect(result.answer).toContain('rejected');
    expect(result.citations).toHaveLength(0);
    expect(result.metrics.rejectedCount).toBe(1);
  });

  it('returns validation error when response fails validation', async () => {
    validatorMock.validate.mockResolvedValue({
      valid: false, checks: {} as any,
      errors: [{ code: 'INCOMPLETE_CITATIONS', message: 'Citations missing' }],
    });
    const result = await service.query({ question: 'Q', workspaceId: 'ws-1' });
    expect(result.answer).toContain('Validation failed');
  });

  it('handles errors gracefully', async () => {
    retrievalMock.retrieve.mockRejectedValue(new Error('Retrieval failed'));
    const result = await service.query({ question: 'Q', workspaceId: 'ws-1' });
    expect(result.answer).toContain('Error processing query');
    expect(result.traceId).toBeTruthy();
  });

  it('generates unique trace IDs per query', async () => {
    const r1 = await service.query({ question: 'Q1', workspaceId: 'ws-1' });
    const r2 = await service.query({ question: 'Q2', workspaceId: 'ws-1' });
    expect(r1.traceId).not.toBe(r2.traceId);
  });

  it('passes filters through to retrieval', async () => {
    await service.query({ question: 'Q', workspaceId: 'ws-1', filters: { tiers: ['gold'], languages: ['en'], versionStatus: 'active' }, options: { topK: 5 } });
    expect(retrievalMock.retrieve).toHaveBeenCalledWith(
      expect.objectContaining({ filters: expect.objectContaining({ tiers: ['gold'] }) }),
      expect.objectContaining({ topK: 5 }),
    );
  });
});
