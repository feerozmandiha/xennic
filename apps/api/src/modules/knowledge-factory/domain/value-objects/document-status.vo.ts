export const DOCUMENT_STATUSES = {
  UPLOADED: 'uploaded',
  CLASSIFIED: 'classified',
  PARSING: 'parsing',
  EXTRACTED: 'extracted',
  CHUNKING: 'chunking',
  EMBEDDING: 'embedding',
  PUBLISHING: 'publishing',
  PUBLISHED: 'published',
  FAILED: 'failed',
} as const;

export type DocumentStatus = typeof DOCUMENT_STATUSES[keyof typeof DOCUMENT_STATUSES];

export const VALID_STATUS_TRANSITIONS: Record<DocumentStatus, DocumentStatus[]> = {
  uploaded: ['classified'],
  classified: ['parsing', 'failed'],
  parsing: ['extracted', 'failed'],
  extracted: ['chunking', 'failed'],
  chunking: ['embedding', 'failed'],
  embedding: ['publishing', 'failed'],
  publishing: ['published', 'failed'],
  published: ['uploaded'],
  failed: ['uploaded'],
};

export class DocumentStatusTransitionError extends Error {
  constructor(from: DocumentStatus, to: DocumentStatus) {
    super(`Invalid status transition from "${from}" to "${to}".`);
    this.name = 'DocumentStatusTransitionError';
  }
}
