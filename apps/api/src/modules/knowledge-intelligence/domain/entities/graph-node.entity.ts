import type { NodeType } from '../value-objects/node-type.vo.js';
import type { EntityType } from '../value-objects/entity-type.vo.js';

export interface GraphNodeProperties {
  [key: string]: unknown;
}

export interface GraphNodeData {
  id: string;
  workspaceId: string;
  type: NodeType;
  entityType: EntityType;
  entityId: string;
  label: string | null;
  properties: GraphNodeProperties;
  embeddingId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class KnowledgeGraphNode {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly type: NodeType,
    public readonly entityType: EntityType,
    public readonly entityId: string,
    public _label: string | null,
    public _properties: GraphNodeProperties,
    public _embeddingId: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(data: {
    workspaceId: string;
    type: NodeType;
    entityType: EntityType;
    entityId: string;
    label?: string | null;
    properties?: GraphNodeProperties;
    embeddingId?: string | null;
  }): KnowledgeGraphNode {
    const now = new Date();
    return new KnowledgeGraphNode(
      crypto.randomUUID(),
      data.workspaceId,
      data.type,
      data.entityType,
      data.entityId,
      data.label ?? null,
      data.properties ?? {},
      data.embeddingId ?? null,
      now,
      now,
    );
  }

  static reconstitute(data: GraphNodeData): KnowledgeGraphNode {
    return new KnowledgeGraphNode(
      data.id,
      data.workspaceId,
      data.type,
      data.entityType,
      data.entityId,
      data.label,
      data.properties,
      data.embeddingId,
      data.createdAt,
      data.updatedAt,
    );
  }

  get label(): string | null { return this._label; }
  get properties(): GraphNodeProperties { return this._properties; }
  get embeddingId(): string | null { return this._embeddingId; }

  update(data: { label?: string | null; properties?: GraphNodeProperties; embeddingId?: string | null }): void {
    if (data.label !== undefined) this._label = data.label;
    if (data.properties !== undefined) this._properties = data.properties;
    if (data.embeddingId !== undefined) this._embeddingId = data.embeddingId;
    this.updatedAt = new Date();
  }

  setProperty(key: string, value: unknown): void {
    this._properties[key] = value;
    this.updatedAt = new Date();
  }

  toJSON(): GraphNodeData {
    return {
      id: this.id,
      workspaceId: this.workspaceId,
      type: this.type,
      entityType: this.entityType,
      entityId: this.entityId,
      label: this._label,
      properties: this._properties,
      embeddingId: this._embeddingId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export type GraphNodeType = KnowledgeGraphNode;
