export class KnowledgeDocumentChunk {
  constructor(
    public readonly id: string,
    public readonly documentId: string,
    public readonly chunkIndex: number,
    public readonly text: string,
    public readonly tokenCount: number,
    public readonly pageNumber: number | null,
    public readonly section: string | null,
    public metadata: Record<string, unknown>,
    public embeddingId: string | null,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    documentId: string;
    chunkIndex: number;
    text: string;
    tokenCount: number;
    pageNumber?: number | null;
    section?: string | null;
    metadata?: Record<string, unknown>;
  }): KnowledgeDocumentChunk {
    return new KnowledgeDocumentChunk(
      crypto.randomUUID(),
      data.documentId,
      data.chunkIndex,
      data.text,
      data.tokenCount,
      data.pageNumber ?? null,
      data.section ?? null,
      data.metadata ?? {},
      null,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    documentId: string;
    chunkIndex: number;
    text: string;
    tokenCount: number;
    pageNumber: number | null;
    section: string | null;
    metadata: Record<string, unknown>;
    embeddingId: string | null;
    createdAt: Date;
  }): KnowledgeDocumentChunk {
    return new KnowledgeDocumentChunk(
      data.id,
      data.documentId,
      data.chunkIndex,
      data.text,
      data.tokenCount,
      data.pageNumber,
      data.section,
      data.metadata,
      data.embeddingId,
      data.createdAt,
    );
  }

  linkEmbedding(embeddingId: string): void {
    this.metadata = { ...this.metadata, embeddingId };
    this.embeddingId = embeddingId;
  }

  get preview(): string {
    return this.text.slice(0, 200) + (this.text.length > 200 ? '...' : '');
  }
}
