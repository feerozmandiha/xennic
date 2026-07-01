export type TierLevel = 1 | 2 | 3 | 4;
export type KnowledgeTier = 'platinum' | 'gold' | 'silver' | 'bronze';
export type VersionStatus = 'active' | 'superseded' | 'deprecated' | 'withdrawn' | 'archived';

export interface RagQuery {
  question: string;
  workspaceId: string;
  filters?: {
    tiers?: KnowledgeTier[];
    languages?: string[];
    categoryIds?: string[];
    ontologyEntityIds?: string[];
    versionStatus?: VersionStatus;
    dateFrom?: string;
    dateTo?: string;
    minAuthorityScore?: number;
  };
  options?: {
    maxTokens?: number;
    topK?: number;
    includeEvidenceChain?: boolean;
    includeCitations?: boolean;
    rrfK?: number;
    denseWeight?: number;
    sparseWeight?: number;
  };
}

export interface RetrievalChunk {
  chunkId: string;
  knowledgeObjectId: string;
  content: string;
  score: number;
  denseScore?: number;
  sparseScore?: number;
  metadata: {
    title: string;
    xid: string;
    tier: KnowledgeTier;
    language: string;
    version: number;
    status: VersionStatus;
    authorityScore: number;
    taxonomy: string[];
    ontology: string[];
  };
  provenance?: {
    sourceDocument: string;
    section?: string;
    page?: number;
    paragraph?: number;
  };
}

export interface Citation {
  statement: string;
  evidence: {
    documentXid: string;
    documentTitle: string;
    version: number;
    section?: string;
    page?: number;
    chunkId?: string;
    paragraph?: number;
  };
  confidence: number;
  authorityScore: number;
  sourceTier: KnowledgeTier;
  citationChain: string[];
}

export interface EvidenceChain {
  traceId: string;
  question: string;
  retrievedChunks: RetrievalChunk[];
  rankingScores: Record<string, number>;
  selectedEvidence: RetrievalChunk[];
  reasoningReferences: string[];
  generatedAnswer: string;
  citations: Citation[];
  finalConfidence: number;
  timestamps: {
    retrieval: number;
    ranking: number;
    contextBuilding: number;
    generation: number;
    validation: number;
  };
}

export interface ContextNode {
  content: string;
  tier: TierLevel;
  chunkId: string;
  tokenCount: number;
  knowledgeObjectId: string;
  sourceTier: KnowledgeTier;
}

export interface RagContext {
  nodes: ContextNode[];
  totalTokens: number;
  tierDistribution: Record<string, number>;
  deduplicated: boolean;
}

export interface RagPrompt {
  system: string;
  constraints: string;
  evidence: string;
  knowledge: string;
  question: string;
  outputRules: string;
  fullPrompt: string;
}

export interface CheckResult {
  passed: boolean;
  details?: string;
}

export interface ValidationError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  checks: {
    citationCompleteness: CheckResult;
    unsupportedClaims: CheckResult;
    conflictingStandards: CheckResult;
    supersededDocuments: CheckResult;
    workspaceIsolation: CheckResult;
    hallucinationDetection: CheckResult;
  };
  errors: ValidationError[];
}

export interface Conflict {
  standards: string[];
  conflictingClaims: string[];
  resolution: string;
}

export interface ConflictResolution {
  resolved: boolean;
  conflicts: Conflict[];
  preferredSource: string;
  explanation: string;
}

export interface ConfidenceFactors {
  authorityScore: number;
  evidenceCoverage: number;
  agreement: number;
  chunkQuality: number;
  retrievalScore: number;
  versionStatus: number;
}

export interface ConfidenceScore {
  overall: number;
  factors: ConfidenceFactors;
}

export interface GuardrailResult {
  allowed: boolean;
  reasons: string[];
  recommendation?: string;
}

export interface RagResponse {
  answer: string;
  citations: Citation[];
  confidence: ConfidenceScore;
  evidenceChain?: EvidenceChain;
  metrics: {
    retrievalLatency: number;
    rankingLatency: number;
    contextLatency: number;
    generationLatency: number;
    validationLatency: number;
    totalLatency: number;
    citationCount: number;
    retrievedChunksCount: number;
  };
  traceId: string;
}

export interface RagMetrics {
  retrievalLatency: number;
  rankingLatency: number;
  contextLatency: number;
  generationLatency: number;
  validationLatency: number;
  totalLatency: number;
  citationCount: number;
  retrievedChunksCount: number;
  promptSize: number;
  rejectedCount: number;
}
