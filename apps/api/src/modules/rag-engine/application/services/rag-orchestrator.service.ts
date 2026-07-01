import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IHybridRetrievalService } from '../../domain/interfaces/hybrid-retrieval.interface.js';
import type { ICitationEngine } from '../../domain/interfaces/citation-engine.interface.js';
import type { IEvidenceChainService } from '../../domain/interfaces/evidence-chain.interface.js';
import type { IContextBuilder } from '../../domain/interfaces/context-builder.interface.js';
import type { IPromptBuilder } from '../../domain/interfaces/prompt-builder.interface.js';
import type { IResponseValidator } from '../../domain/interfaces/response-validator.interface.js';
import type { IConflictResolver } from '../../domain/interfaces/conflict-resolver.interface.js';
import type { IConfidenceEngine } from '../../domain/interfaces/confidence-engine.interface.js';
import type { IEngineeringGuardrails } from '../../domain/interfaces/engineering-guardrails.interface.js';
import type { RagQuery, RagResponse, RagMetrics, RetrievalChunk } from '../../domain/types/rag.types.js';
import { EvidenceChainService } from './evidence-chain.service.js';

@Injectable()
export class RagOrchestratorService {
  private readonly logger = new Logger(RagOrchestratorService.name);

  constructor(
    @Inject('IHybridRetrievalService') private readonly retrieval: IHybridRetrievalService,
    @Inject('ICitationEngine') private readonly citationEngine: ICitationEngine,
    private readonly evidenceChain: EvidenceChainService,
    @Inject('IContextBuilder') private readonly contextBuilder: IContextBuilder,
    @Inject('IPromptBuilder') private readonly promptBuilder: IPromptBuilder,
    @Inject('IResponseValidator') private readonly validator: IResponseValidator,
    @Inject('IConflictResolver') private readonly conflictResolver: IConflictResolver,
    @Inject('IConfidenceEngine') private readonly confidenceEngine: IConfidenceEngine,
    @Inject('IEngineeringGuardrails') private readonly guardrails: IEngineeringGuardrails,
  ) {}

  async query(query: RagQuery): Promise<RagResponse> {
    const traceId = this.evidenceChain.getTraceId();
    const metrics: RagMetrics = {
      retrievalLatency: 0,
      rankingLatency: 0,
      contextLatency: 0,
      generationLatency: 0,
      validationLatency: 0,
      totalLatency: 0,
      citationCount: 0,
      retrievedChunksCount: 0,
      promptSize: 0,
      rejectedCount: 0,
    };
    const startTime = Date.now();

    try {
      const t0 = Date.now();
      const retrieved = await this.retrieval.retrieve(query, {
        topK: query.options?.topK ?? 10,
        rrfK: query.options?.rrfK ?? 60,
        denseWeight: query.options?.denseWeight ?? 0.5,
        sparseWeight: query.options?.sparseWeight ?? 0.5,
      });
      metrics.retrievalLatency = Date.now() - t0;
      metrics.retrievedChunksCount = retrieved.length;

      const guardrailCheck = await this.guardrails.checkResponse(
        { answer: '', citations: [], confidence: { overall: 0, factors: {} as any }, metrics: metrics as any, traceId },
        query,
        retrieved,
      );

      if (!guardrailCheck.allowed) {
        metrics.rejectedCount = 1;
        return {
          answer: `Query rejected: ${guardrailCheck.reasons.join('; ')}`,
          citations: [],
          confidence: { overall: 0, factors: { authorityScore: 0, evidenceCoverage: 0, agreement: 0, chunkQuality: 0, retrievalScore: 0, versionStatus: 0 } },
          metrics: metrics as any,
          traceId,
        };
      }

      const t1 = Date.now();
      const rankingScores: Record<string, number> = {};
      for (const chunk of retrieved) {
        rankingScores[chunk.chunkId] = chunk.score;
      }
      metrics.rankingLatency = Date.now() - t1;

      const t2 = Date.now();
      const context = await this.contextBuilder.build(retrieved, query.options?.maxTokens);
      metrics.contextLatency = Date.now() - t2;

      const t3 = Date.now();
      const prompt = await this.promptBuilder.build(query, context);
      metrics.promptSize = prompt.fullPrompt.length;
      metrics.generationLatency = Date.now() - t3;

      const selectedEvidence = context.nodes.map((n) => retrieved.find((r) => r.chunkId === n.chunkId)).filter(Boolean) as RetrievalChunk[];

      const firstEvidence = selectedEvidence.length > 0 ? selectedEvidence[0]!.content.slice(0, 200) : 'insufficient evidence is available';
      const placeholderAnswer = `Based on the retrieved evidence, here is the answer to "${query.question}".\n\nThe relevant sources indicate that ${firstEvidence}`;

      const statements = placeholderAnswer.match(/[^.!?]+[.!?]/g) ?? [placeholderAnswer];

      const t4 = Date.now();
      const citations = await this.citationEngine.generateCitations(statements, selectedEvidence);
      metrics.citationCount = citations.length;
      metrics.generationLatency += Date.now() - t4;

      const t5 = Date.now();
      const confidence = await this.confidenceEngine.calculate(
        selectedEvidence,
        citations,
        selectedEvidence.map((c) => c.score),
      );
      metrics.validationLatency = Date.now() - t5;

      const response: RagResponse = {
        answer: placeholderAnswer,
        citations,
        confidence,
        evidenceChain: query.options?.includeEvidenceChain ? this.evidenceChain.create({
          traceId,
          question: query.question,
          retrievedChunks: retrieved,
          rankingScores,
          selectedEvidence,
          reasoningReferences: [],
          generatedAnswer: placeholderAnswer,
          citations,
          finalConfidence: confidence.overall,
          timestamps: {
            retrieval: metrics.retrievalLatency,
            ranking: metrics.rankingLatency,
            contextBuilding: metrics.contextLatency,
            generation: metrics.generationLatency,
            validation: metrics.validationLatency,
          },
        }) : undefined,
        metrics: {
          ...metrics,
          totalLatency: Date.now() - startTime,
        } as any,
        traceId,
      };

      const validation = await this.validator.validate(query, response);
      if (!validation.valid) {
        this.logger.warn(`Response validation failed for trace ${traceId}: ${validation.errors.map((e) => e.message).join(', ')}`);
        return {
          ...response,
          answer: `Validation failed: ${validation.errors.map((e) => `${e.code}: ${e.message}`).join('; ')}`,
          confidence: { overall: 0, factors: response.confidence.factors },
        };
      }

      metrics.totalLatency = Date.now() - startTime;
      return {
        ...response,
        metrics: { ...metrics, totalLatency: Date.now() - startTime } as any,
      };
    } catch (error) {
      this.logger.error(`RAG query failed: ${(error as Error).message}`, (error as Error).stack);
      metrics.totalLatency = Date.now() - startTime;
      return {
        answer: `Error processing query: ${(error as Error).message}`,
        citations: [],
        confidence: { overall: 0, factors: { authorityScore: 0, evidenceCoverage: 0, agreement: 0, chunkQuality: 0, retrievalScore: 0, versionStatus: 0 } },
        metrics: metrics as any,
        traceId,
      };
    }
  }
}
