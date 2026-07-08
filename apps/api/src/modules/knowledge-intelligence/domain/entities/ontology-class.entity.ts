
export interface OntologyClassProperties {
  [key: string]: unknown;
}

export interface OntologyClassData {
  id: string;
  ontologyId: string;
  parentId: string | null;
  uri: string;
  label: string;
  description: string | null;
  properties: OntologyClassProperties;
  sortOrder: number;
  isAbstract: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class OntologyClass {
  constructor(
    public readonly id: string,
    public readonly ontologyId: string,
    public _parentId: string | null,
    public readonly uri: string,
    public _label: string,
    public _description: string | null,
    public _properties: OntologyClassProperties,
    public _sortOrder: number,
    public _isAbstract: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(data: {
    ontologyId: string;
    uri: string;
    label: string;
    parentId?: string | null;
    description?: string | null;
    properties?: OntologyClassProperties;
    sortOrder?: number;
    isAbstract?: boolean;
  }): OntologyClass {
    return new OntologyClass(
      crypto.randomUUID(),
      data.ontologyId,
      data.parentId ?? null,
      data.uri,
      data.label,
      data.description ?? null,
      data.properties ?? {},
      data.sortOrder ?? 0,
      data.isAbstract ?? false,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(data: OntologyClassData): OntologyClass {
    return new OntologyClass(
      data.id,
      data.ontologyId,
      data.parentId,
      data.uri,
      data.label,
      data.description,
      data.properties,
      data.sortOrder,
      data.isAbstract,
      data.createdAt,
      data.updatedAt,
    );
  }

  get parentId(): string | null { return this._parentId; }
  get label(): string { return this._label; }
  get description(): string | null { return this._description; }
  get properties(): OntologyClassProperties { return this._properties; }
  get sortOrder(): number { return this._sortOrder; }
  get isAbstract(): boolean { return this._isAbstract; }

  update(data: { label?: string; description?: string | null; properties?: OntologyClassProperties; sortOrder?: number; isAbstract?: boolean }): void {
    if (data.label !== undefined) this._label = data.label;
    if (data.description !== undefined) this._description = data.description;
    if (data.properties !== undefined) this._properties = data.properties;
    if (data.sortOrder !== undefined) this._sortOrder = data.sortOrder;
    if (data.isAbstract !== undefined) this._isAbstract = data.isAbstract;
    this.updatedAt = new Date();
  }

  toJSON(): OntologyClassData {
    return {
      id: this.id,
      ontologyId: this.ontologyId,
      parentId: this._parentId,
      uri: this.uri,
      label: this._label,
      description: this._description,
      properties: this._properties,
      sortOrder: this._sortOrder,
      isAbstract: this._isAbstract,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
