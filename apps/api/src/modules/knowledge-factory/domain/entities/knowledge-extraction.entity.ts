export class KnowledgeExtraction {
  constructor(
    public readonly id: string,
    public readonly documentId: string,
    public readonly method: string,
    public readonly text: string,
    public confidence: number | null,
    public language: string | null,
    public metadata: unknown,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    documentId: string;
    method: string;
    text: string;
    confidence?: number | null;
    language?: string | null;
    metadata?: unknown;
  }): KnowledgeExtraction {
    return new KnowledgeExtraction(
      crypto.randomUUID(),
      data.documentId,
      data.method,
      data.text,
      data.confidence ?? null,
      data.language ?? null,
      data.metadata ?? {},
      new Date(),
    );
  }

  get isHighConfidence(): boolean {
    return (this.confidence ?? 0) >= 0.85;
  }

  get wordCount(): number {
    return this.text.split(/\s+/).filter(Boolean).length;
  }
}
