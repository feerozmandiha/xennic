export interface DocumentSimilarityData {
  id: string;
  workspaceId: string;
  sourceId: string;
  targetId: string;
  similarity: number;
  method: string;
  computedAt: Date;
}

export class DocumentSimilarity {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly sourceId: string,
    public readonly targetId: string,
    public _similarity: number,
    public readonly method: string,
    public readonly computedAt: Date,
  ) {}

  static create(data: {
    workspaceId: string;
    sourceId: string;
    targetId: string;
    similarity: number;
    method: string;
  }): DocumentSimilarity {
    return new DocumentSimilarity(
      crypto.randomUUID(),
      data.workspaceId,
      data.sourceId,
      data.targetId,
      data.similarity,
      data.method,
      new Date(),
    );
  }

  static reconstitute(data: DocumentSimilarityData): DocumentSimilarity {
    return new DocumentSimilarity(
      data.id,
      data.workspaceId,
      data.sourceId,
      data.targetId,
      data.similarity,
      data.method,
      data.computedAt,
    );
  }

  get similarity(): number {
    return this._similarity;
  }

  toJSON(): DocumentSimilarityData {
    return {
      id: this.id,
      workspaceId: this.workspaceId,
      sourceId: this.sourceId,
      targetId: this.targetId,
      similarity: this._similarity,
      method: this.method,
      computedAt: this.computedAt,
    };
  }
}
