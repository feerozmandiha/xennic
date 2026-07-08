export interface KnowledgeClusterData {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  nodeIds: string[];
  properties: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class KnowledgeCluster {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public _name: string,
    public _description: string | null,
    public _nodeIds: string[],
    public _properties: Record<string, unknown>,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(data: {
    workspaceId: string;
    name: string;
    description?: string | null;
    nodeIds: string[];
    properties?: Record<string, unknown>;
  }): KnowledgeCluster {
    return new KnowledgeCluster(
      crypto.randomUUID(),
      data.workspaceId,
      data.name,
      data.description ?? null,
      data.nodeIds,
      data.properties ?? {},
      new Date(),
      new Date(),
    );
  }

  static reconstitute(data: KnowledgeClusterData): KnowledgeCluster {
    return new KnowledgeCluster(
      data.id,
      data.workspaceId,
      data.name,
      data.description,
      data.nodeIds,
      data.properties,
      data.createdAt,
      data.updatedAt,
    );
  }

  get name(): string { return this._name; }
  get description(): string | null { return this._description; }
  get nodeIds(): string[] { return this._nodeIds; }
  get properties(): Record<string, unknown> { return this._properties; }

  update(data: { name?: string; description?: string | null; nodeIds?: string[]; properties?: Record<string, unknown> }): void {
    if (data.name !== undefined) this._name = data.name;
    if (data.description !== undefined) this._description = data.description;
    if (data.nodeIds !== undefined) this._nodeIds = data.nodeIds;
    if (data.properties !== undefined) this._properties = data.properties;
    this.updatedAt = new Date();
  }

  toJSON(): KnowledgeClusterData {
    return {
      id: this.id,
      workspaceId: this.workspaceId,
      name: this._name,
      description: this._description,
      nodeIds: this._nodeIds,
      properties: this._properties,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
