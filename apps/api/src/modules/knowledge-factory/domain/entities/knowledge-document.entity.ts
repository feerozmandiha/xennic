import {
  type DocumentStatus,
  DOCUMENT_STATUSES,
  VALID_STATUS_TRANSITIONS,
  DocumentStatusTransitionError,
} from '../value-objects/document-status.vo.js';

export class KnowledgeDocument {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly filename: string,
    public readonly originalName: string,
    public readonly mimeType: string,
    public readonly sizeBytes: number,
    public readonly storagePath: string | null,
    public readonly documentType: string,
    public _status: DocumentStatus,
    public _classification: unknown,
    public _metadata: unknown,
    private _errorMessage: string | null,
    private _retryCount: number,
    public publishedKnowledgeId: string | null,
    public readonly createdBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(data: {
    workspaceId: string;
    filename: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    storagePath?: string | null;
    documentType?: string;
    createdBy?: string | null;
    metadata?: unknown;
  }): KnowledgeDocument {
    const now = new Date();
    return new KnowledgeDocument(
      crypto.randomUUID(),
      data.workspaceId,
      data.filename,
      data.originalName,
      data.mimeType,
      data.sizeBytes,
      data.storagePath ?? null,
      data.documentType ?? 'pdf',
      DOCUMENT_STATUSES.UPLOADED,
      {},
      data.metadata ?? {},
      null,
      0,
      null,
      data.createdBy ?? null,
      now,
      now,
    );
  }

  static reconstitute(data: {
    id: string;
    workspaceId: string;
    filename: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    storagePath: string | null;
    documentType: string;
    status: string;
    classification: unknown;
    metadata: unknown;
    errorMessage: string | null;
    retryCount: number;
    publishedKnowledgeId: string | null;
    createdBy: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): KnowledgeDocument {
    return new KnowledgeDocument(
      data.id,
      data.workspaceId,
      data.filename,
      data.originalName,
      data.mimeType,
      data.sizeBytes,
      data.storagePath,
      data.documentType,
      data.status as DocumentStatus,
      data.classification,
      data.metadata,
      data.errorMessage,
      data.retryCount,
      data.publishedKnowledgeId,
      data.createdBy,
      data.createdAt,
      data.updatedAt,
    );
  }

  // ── Getters ──

  get status(): DocumentStatus {
    return this._status;
  }
  get classification(): unknown {
    return this._classification;
  }
  get metadata(): unknown {
    return this._metadata;
  }
  get errorMessage(): string | null {
    return this._errorMessage;
  }
  get retryCount(): number {
    return this._retryCount;
  }

  // ── Business Methods ──

  classify(result: unknown): void {
    this._transitionTo('classified');
    this._classification = result;
    this.updatedAt = new Date();
  }

  startParsing(): void {
    this._transitionTo('parsing');
    this.updatedAt = new Date();
  }

  markExtracted(): void {
    this._transitionTo('extracted');
    this.updatedAt = new Date();
  }

  markChunking(): void {
    this._transitionTo('chunking');
    this.updatedAt = new Date();
  }

  markEmbedding(): void {
    this._transitionTo('embedding');
    this.updatedAt = new Date();
  }

  markPublishing(): void {
    this._transitionTo('publishing');
    this.updatedAt = new Date();
  }

  publish(knowledgeId: string): void {
    this._transitionTo('published');
    this.publishedKnowledgeId = knowledgeId;
    this._errorMessage = null;
    this.updatedAt = new Date();
  }

  fail(error: string): void {
    this._status = 'failed';
    this._errorMessage = error;
    this.updatedAt = new Date();
  }

  retry(): void {
    if (this._retryCount >= 10) {
      throw new Error('Maximum retry count exceeded for document');
    }
    this._retryCount += 1;
    this._status = 'uploaded';
    this._errorMessage = null;
    this.updatedAt = new Date();
  }

  updateMetadata(metadata: unknown): void {
    this._metadata = metadata;
    this.updatedAt = new Date();
  }

  isProcessed(): boolean {
    return this._status === 'published';
  }

  isFailed(): boolean {
    return this._status === 'failed';
  }

  canRetry(): boolean {
    return this.isFailed() && this._retryCount < 10;
  }

  // ── Private ──

  private _transitionTo(target: DocumentStatus): void {
    const allowed = VALID_STATUS_TRANSITIONS[this._status];
    if (!allowed.includes(target)) {
      throw new DocumentStatusTransitionError(this._status, target);
    }
    this._status = target;
  }
}
