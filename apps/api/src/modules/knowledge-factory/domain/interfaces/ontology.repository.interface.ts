import type { OntologyEntityProps, OntologyRelationshipProps, OntologySynonymProps } from '../ontology.types.js';

export interface IOntologyRepository {
  saveEntity(entity: OntologyEntityProps): Promise<void>;
  updateEntity(entity: OntologyEntityProps): Promise<void>;
  deleteEntity(id: string): Promise<void>;
  findEntityByIri(iri: string): Promise<OntologyEntityProps | null>;
  findEntityByCanonicalId(canonicalId: string): Promise<OntologyEntityProps | null>;
  findEntityByLabel(label: string): Promise<OntologyEntityProps[]>;
  getSynonyms(entityId: string): Promise<OntologySynonymProps[]>;
  addSynonym(synonym: OntologySynonymProps): Promise<void>;
  removeSynonym(id: string): Promise<void>;
  saveRelationship(rel: OntologyRelationshipProps): Promise<void>;
  getRelationships(entityId: string): Promise<OntologyRelationshipProps[]>;
}
