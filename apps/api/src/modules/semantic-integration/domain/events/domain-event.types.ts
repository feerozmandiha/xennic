import { randomUUID } from 'node:crypto';

export enum EventType {
  DocumentUploaded = 'DocumentUploaded',
  DocumentClassified = 'DocumentClassified',
  DocumentParsed = 'DocumentParsed',
  DocumentNormalized = 'DocumentNormalized',
  DocumentChunked = 'DocumentChunked',
  EmbeddingsGenerated = 'EmbeddingsGenerated',
  DocumentPublished = 'DocumentPublished',
  KnowledgeArticlePublished = 'KnowledgeArticlePublished',
  KnowledgeArticleArchived = 'KnowledgeArticleArchived',
  GraphNodeCreated = 'GraphNodeCreated',
  GraphEdgesCreated = 'GraphEdgesCreated',
  OntologyUpdated = 'OntologyUpdated',
  MetricsCalculated = 'MetricsCalculated',
  SearchIndexUpdated = 'SearchIndexUpdated',
}

export const EVENT_VERSIONS: Record<EventType, number> = {
  [EventType.DocumentUploaded]: 1,
  [EventType.DocumentClassified]: 1,
  [EventType.DocumentParsed]: 1,
  [EventType.DocumentNormalized]: 1,
  [EventType.DocumentChunked]: 1,
  [EventType.EmbeddingsGenerated]: 1,
  [EventType.DocumentPublished]: 1,
  [EventType.KnowledgeArticlePublished]: 1,
  [EventType.KnowledgeArticleArchived]: 1,
  [EventType.GraphNodeCreated]: 1,
  [EventType.GraphEdgesCreated]: 1,
  [EventType.OntologyUpdated]: 1,
  [EventType.MetricsCalculated]: 1,
  [EventType.SearchIndexUpdated]: 1,
};

export interface DomainEventMetadata {
  userId?: string;
  workspaceId: string;
  retryCount: number;
}

export interface DomainEvent<T = unknown> {
  readonly eventId: string;
  readonly eventType: EventType;
  readonly eventVersion: number;
  readonly correlationId: string;
  readonly causationId: string;
  readonly tracingId: string;
  readonly timestamp: string;
  readonly source: string;
  readonly data: T;
  readonly metadata: DomainEventMetadata;
}

export interface DocumentPublishedPayload {
  documentId: string;
  workspaceId: string;
  knowledgeId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  documentType: string;
  classification: Record<string, unknown>;
  chunkCount: number;
  createdBy: string | null;
}

export interface KnowledgeArticlePublishedPayload {
  articleId: string;
  workspaceId: string;
  slug: string;
  title: string;
  language: string;
  visibility: string;
  version: number;
  readingTime: number | null;
  difficulty: string | null;
  authorId: string | null;
  publishedAt: string;
  contentProperties: string[];
}

export interface KnowledgeArticleArchivedPayload {
  articleId: string;
  workspaceId: string;
  archivedAt: string;
}

export interface GraphNodeCreatedPayload {
  nodeId: string;
  workspaceId: string;
  entityId: string;
  entityType: string;
  type: string;
  label: string | null;
}

export interface GraphEdgesCreatedPayload {
  nodeId: string;
  workspaceId: string;
  edgeCount: number;
  edgeIds: string[];
}

export interface MetricsCalculatedPayload {
  nodeId: string;
  workspaceId: string;
  confidence: number;
  freshness: number;
  authority: number;
  completeness: number;
  compositeScore: number;
}

export interface SearchIndexUpdatedPayload {
  entityType: string;
  entityId: string;
  workspaceId: string;
}

export interface DocumentUploadedPayload {
  documentId: string;
  workspaceId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdBy: string | null;
}

export interface DocumentClassifiedPayload {
  documentId: string;
  workspaceId: string;
  classification: Record<string, unknown>;
}

export interface DocumentParsedPayload {
  documentId: string;
  workspaceId: string;
}

export interface DocumentNormalizedPayload {
  documentId: string;
  workspaceId: string;
}

export interface DocumentChunkedPayload {
  documentId: string;
  workspaceId: string;
  chunkCount: number;
}

export interface EmbeddingsGeneratedPayload {
  documentId: string;
  workspaceId: string;
  embeddingCount: number;
}

export interface OntologyUpdatedPayload {
  ontologyId: string;
  workspaceId: string;
  action: 'created' | 'updated' | 'deleted';
}

export type EventPayloads = {
  [EventType.DocumentUploaded]: DocumentUploadedPayload;
  [EventType.DocumentClassified]: DocumentClassifiedPayload;
  [EventType.DocumentParsed]: DocumentParsedPayload;
  [EventType.DocumentNormalized]: DocumentNormalizedPayload;
  [EventType.DocumentChunked]: DocumentChunkedPayload;
  [EventType.EmbeddingsGenerated]: EmbeddingsGeneratedPayload;
  [EventType.DocumentPublished]: DocumentPublishedPayload;
  [EventType.KnowledgeArticlePublished]: KnowledgeArticlePublishedPayload;
  [EventType.KnowledgeArticleArchived]: KnowledgeArticleArchivedPayload;
  [EventType.GraphNodeCreated]: GraphNodeCreatedPayload;
  [EventType.GraphEdgesCreated]: GraphEdgesCreatedPayload;
  [EventType.OntologyUpdated]: OntologyUpdatedPayload;
  [EventType.MetricsCalculated]: MetricsCalculatedPayload;
  [EventType.SearchIndexUpdated]: SearchIndexUpdatedPayload;
};

export function createDomainEvent<T extends EventType>(
  eventType: T,
  data: EventPayloads[T],
  metadata: DomainEventMetadata,
  causation?: { causationId: string; tracingId: string },
): DomainEvent<EventPayloads[T]> {
  return Object.freeze({
    eventId: randomUUID(),
    eventType,
    eventVersion: EVENT_VERSIONS[eventType],
    correlationId: causation?.causationId ?? randomUUID(),
    causationId: causation?.causationId ?? randomUUID(),
    tracingId: causation?.tracingId ?? randomUUID(),
    timestamp: new Date().toISOString(),
    source: 'semantic-integration',
    data: Object.freeze({ ...(data as any) }) as EventPayloads[T],
    metadata: Object.freeze({ ...(metadata as any) }) as DomainEventMetadata,
  });
}
