export interface GraphMetricsData {
  id: string;
  nodeId: string;
  confidence: number;
  freshness: number;
  authority: number;
  completeness: number;
  accessCount: number;
  lastAccessedAt: Date | null;
  computedAt: Date;
  updatedAt: Date;
}

export class KnowledgeGraphMetrics {
  constructor(
    public readonly id: string,
    public readonly nodeId: string,
    public _confidence: number,
    public _freshness: number,
    public _authority: number,
    public _completeness: number,
    public _accessCount: number,
    public _lastAccessedAt: Date | null,
    public readonly computedAt: Date,
    public updatedAt: Date,
  ) {}

  static create(data: {
    nodeId: string;
    confidence?: number;
    freshness?: number;
    authority?: number;
    completeness?: number;
  }): KnowledgeGraphMetrics {
    const now = new Date();
    return new KnowledgeGraphMetrics(
      crypto.randomUUID(),
      data.nodeId,
      data.confidence ?? 0.5,
      data.freshness ?? 0.5,
      data.authority ?? 0.5,
      data.completeness ?? 0.5,
      0,
      null,
      now,
      now,
    );
  }

  static reconstitute(data: GraphMetricsData): KnowledgeGraphMetrics {
    return new KnowledgeGraphMetrics(
      data.id,
      data.nodeId,
      data.confidence,
      data.freshness,
      data.authority,
      data.completeness,
      data.accessCount,
      data.lastAccessedAt,
      data.computedAt,
      data.updatedAt,
    );
  }

  get confidence(): number {
    return this._confidence;
  }
  get freshness(): number {
    return this._freshness;
  }
  get authority(): number {
    return this._authority;
  }
  get completeness(): number {
    return this._completeness;
  }
  get accessCount(): number {
    return this._accessCount;
  }
  get lastAccessedAt(): Date | null {
    return this._lastAccessedAt;
  }

  updateScores(data: {
    confidence?: number;
    freshness?: number;
    authority?: number;
    completeness?: number;
  }): void {
    if (data.confidence !== undefined) this._confidence = Math.max(0, Math.min(1, data.confidence));
    if (data.freshness !== undefined) this._freshness = Math.max(0, Math.min(1, data.freshness));
    if (data.authority !== undefined) this._authority = Math.max(0, Math.min(1, data.authority));
    if (data.completeness !== undefined)
      this._completeness = Math.max(0, Math.min(1, data.completeness));
    this.updatedAt = new Date();
  }

  recordAccess(): void {
    this._accessCount += 1;
    this._lastAccessedAt = new Date();
    this.updatedAt = new Date();
  }

  compositeScore(): number {
    return (this._confidence + this._freshness + this._authority + this._completeness) / 4;
  }

  toJSON(): GraphMetricsData {
    return {
      id: this.id,
      nodeId: this.nodeId,
      confidence: this._confidence,
      freshness: this._freshness,
      authority: this._authority,
      completeness: this._completeness,
      accessCount: this._accessCount,
      lastAccessedAt: this._lastAccessedAt,
      computedAt: this.computedAt,
      updatedAt: this.updatedAt,
    };
  }
}

export type GraphMetricsType = KnowledgeGraphMetrics;
