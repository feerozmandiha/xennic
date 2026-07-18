import type { RelationType } from '../value-objects/relation-type.vo.js';

export interface OntologyRelationProperties {
  [key: string]: unknown;
}

export interface OntologyRelationData {
  id: string;
  ontologyId: string;
  sourceUri: string;
  targetUri: string;
  relation: RelationType;
  properties: OntologyRelationProperties;
  createdAt: Date;
}

export class OntologyRelation {
  constructor(
    public readonly id: string,
    public readonly ontologyId: string,
    public readonly sourceUri: string,
    public readonly targetUri: string,
    public readonly relation: RelationType,
    public _properties: OntologyRelationProperties,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    ontologyId: string;
    sourceUri: string;
    targetUri: string;
    relation: RelationType;
    properties?: OntologyRelationProperties;
  }): OntologyRelation {
    return new OntologyRelation(
      crypto.randomUUID(),
      data.ontologyId,
      data.sourceUri,
      data.targetUri,
      data.relation,
      data.properties ?? {},
      new Date(),
    );
  }

  static reconstitute(data: OntologyRelationData): OntologyRelation {
    return new OntologyRelation(
      data.id,
      data.ontologyId,
      data.sourceUri,
      data.targetUri,
      data.relation,
      data.properties,
      data.createdAt,
    );
  }

  get properties(): OntologyRelationProperties {
    return this._properties;
  }

  toJSON(): OntologyRelationData {
    return {
      id: this.id,
      ontologyId: this.ontologyId,
      sourceUri: this.sourceUri,
      targetUri: this.targetUri,
      relation: this.relation,
      properties: this._properties,
      createdAt: this.createdAt,
    };
  }
}
