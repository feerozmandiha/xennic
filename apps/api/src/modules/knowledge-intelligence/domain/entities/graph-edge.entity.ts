import type { EdgeType } from '../value-objects/edge-type.vo.js';

export interface GraphEdgeProperties {
  [key: string]: unknown;
}

export interface GraphEdgeData {
  id: string;
  workspaceId: string;
  sourceId: string;
  targetId: string;
  type: EdgeType;
  weight: number;
  properties: GraphEdgeProperties;
  createdAt: Date;
  updatedAt: Date;
}

export class KnowledgeGraphEdge {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly sourceId: string,
    public readonly targetId: string,
    public readonly type: EdgeType,
    public _weight: number,
    public _properties: GraphEdgeProperties,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(data: {
    workspaceId: string;
    sourceId: string;
    targetId: string;
    type: EdgeType;
    weight?: number;
    properties?: GraphEdgeProperties;
  }): KnowledgeGraphEdge {
    const now = new Date();
    return new KnowledgeGraphEdge(
      crypto.randomUUID(),
      data.workspaceId,
      data.sourceId,
      data.targetId,
      data.type,
      data.weight ?? 1.0,
      data.properties ?? {},
      now,
      now,
    );
  }

  static reconstitute(data: GraphEdgeData): KnowledgeGraphEdge {
    return new KnowledgeGraphEdge(
      data.id,
      data.workspaceId,
      data.sourceId,
      data.targetId,
      data.type,
      data.weight,
      data.properties,
      data.createdAt,
      data.updatedAt,
    );
  }

  get weight(): number {
    return this._weight;
  }
  get properties(): GraphEdgeProperties {
    return this._properties;
  }

  updateWeight(weight: number): void {
    this._weight = weight;
    this.updatedAt = new Date();
  }

  setProperty(key: string, value: unknown): void {
    this._properties[key] = value;
    this.updatedAt = new Date();
  }

  toJSON(): GraphEdgeData {
    return {
      id: this.id,
      workspaceId: this.workspaceId,
      sourceId: this.sourceId,
      targetId: this.targetId,
      type: this.type,
      weight: this._weight,
      properties: this._properties,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export type GraphEdgeType = KnowledgeGraphEdge;
