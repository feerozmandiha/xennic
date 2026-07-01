export const PIPELINE_EVENTS = {
  DOCUMENT_UPLOADED: 'knowledge.document.uploaded',
  DOCUMENT_PARSED: 'knowledge.document.parsed',
  DOCUMENT_CLASSIFIED: 'knowledge.document.classified',
  ENTITIES_EXTRACTED: 'knowledge.document.entities.extracted',
  ONTOLOGY_RESOLVED: 'knowledge.document.ontology.resolved',
  DOCUMENT_NORMALIZED: 'knowledge.document.normalized',
  DOCUMENT_VALIDATED: 'knowledge.document.validated',
  CHUNKS_CREATED: 'knowledge.document.chunks.created',
  EMBEDDINGS_GENERATED: 'knowledge.document.embeddings.generated',
  DOCUMENT_PUBLISHED: 'knowledge.document.published',
  DOCUMENT_FAILED: 'knowledge.document.failed',
} as const;

export type PipelineEventType = (typeof PIPELINE_EVENTS)[keyof typeof PIPELINE_EVENTS];

export interface PipelineEventPayload {
  documentId: string;
  workspaceId: string;
  checksum: string;
  timestamp: string;
}

export interface DocumentParsedPayload extends PipelineEventPayload {
  content: string;
  metadata: Record<string, unknown>;
}

export interface EntitiesExtractedPayload extends PipelineEventPayload {
  entities: ExtractedEntity[];
  relationships: ExtractedRelationship[];
}

export interface OntologyResolvedPayload extends PipelineEventPayload {
  concepts: ResolvedConcept[];
}

export interface ValidationResultPayload extends PipelineEventPayload {
  passed: boolean;
  scores: QualityScores;
  errors: string[];
}

export interface PublishedPayload extends PipelineEventPayload {
  vectorCount: number;
  storagePath: string;
}

export interface ExtractedEntity {
  id: string;
  type: EntityType;
  value: string;
  confidence: number;
  position?: { start: number; end: number };
  metadata: Record<string, unknown>;
}

export interface ExtractedRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  confidence: number;
}

export interface ResolvedConcept {
  conceptId: string;
  label: string;
  confidence: number;
  parentIds: string[];
  synonyms: string[];
}

export interface QualityScores {
  contentScore: number;
  standardScore: number;
  semanticScore: number;
  overallScore: number;
}

export type EntityType =
  | 'standard'
  | 'regulation'
  | 'equipment'
  | 'parameter'
  | 'formula'
  | 'unit'
  | 'material';

export interface NormalizedDocument {
  documentId: string;
  workspaceId: string;
  cleanContent: string;
  normalizedUnits: NormalizedUnit[];
  standardizedTerms: StandardizedTerm[];
  metadata: Record<string, unknown>;
}

export interface NormalizedUnit {
  original: string;
  normalized: string;
  system: 'si' | 'imperial' | 'mixed';
  confidence: number;
}

export interface StandardizedTerm {
  original: string;
  canonical: string;
  confidence: number;
}
