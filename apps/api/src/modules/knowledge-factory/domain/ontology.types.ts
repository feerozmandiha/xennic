export interface OntologyEntityProps {
  id: string;
  iri: string;
  canonicalId: string;
  label: string;
  description?: string;
  entityType?: string;
  confidence: number;
  evidence: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OntologySynonymProps {
  id: string;
  entityId: string;
  alias: string;
  language: string;
  isPreferred: boolean;
}

export interface OntologyRelationshipProps {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: string;
  confidence: number;
  evidence: Record<string, unknown>;
  createdAt: Date;
}

export interface TaxonomyNodeProps {
  id: string;
  parentId?: string;
  slug: string;
  name: string;
  nameEn?: string;
  level: number;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  children?: TaxonomyNodeProps[];
}
