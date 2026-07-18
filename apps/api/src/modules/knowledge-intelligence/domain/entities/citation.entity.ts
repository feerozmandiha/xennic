export interface CitationData {
  id: string;
  workspaceId: string;
  sourceId: string;
  targetId: string;
  context: string | null;
  location: string | null;
  method: 'explicit' | 'implicit' | 'inferred';
  confidence: number;
  createdAt: Date;
}

export class KnowledgeCitation {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly sourceId: string,
    public readonly targetId: string,
    public _context: string | null,
    public _location: string | null,
    public readonly method: 'explicit' | 'implicit' | 'inferred',
    public _confidence: number,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    workspaceId: string;
    sourceId: string;
    targetId: string;
    context?: string | null;
    location?: string | null;
    method: 'explicit' | 'implicit' | 'inferred';
    confidence?: number;
  }): KnowledgeCitation {
    return new KnowledgeCitation(
      crypto.randomUUID(),
      data.workspaceId,
      data.sourceId,
      data.targetId,
      data.context ?? null,
      data.location ?? null,
      data.method,
      data.confidence ?? 1.0,
      new Date(),
    );
  }

  static reconstitute(data: CitationData): KnowledgeCitation {
    return new KnowledgeCitation(
      data.id,
      data.workspaceId,
      data.sourceId,
      data.targetId,
      data.context,
      data.location,
      data.method,
      data.confidence,
      data.createdAt,
    );
  }

  get context(): string | null {
    return this._context;
  }
  get location(): string | null {
    return this._location;
  }
  get confidence(): number {
    return this._confidence;
  }

  toJSON(): CitationData {
    return {
      id: this.id,
      workspaceId: this.workspaceId,
      sourceId: this.sourceId,
      targetId: this.targetId,
      context: this._context,
      location: this._location,
      method: this.method,
      confidence: this._confidence,
      createdAt: this.createdAt,
    };
  }
}
