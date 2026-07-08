export interface IOntologyRepository {
  findById(id: string): Promise<any | null>;
  findBySlug(workspaceId: string, slug: string, version: string): Promise<any | null>;
  findAllByWorkspace(workspaceId: string): Promise<any[]>;
  create(ontology: { workspaceId: string; name: string; slug: string; version: string; description?: string | null }): Promise<any>;
  findClassByUri(ontologyId: string, uri: string): Promise<any | null>;
  findAllClasses(ontologyId: string): Promise<any[]>;
  findRelations(sourceUri: string, targetUri: string, relation?: string): Promise<any[]>;
  createClass(cls: { ontologyId: string; parentId?: string | null; uri: string; label: string; description?: string | null; properties?: Record<string, unknown>; sortOrder?: number; isAbstract?: boolean }): Promise<any>;
  createRelation(rel: { ontologyId: string; sourceUri: string; targetUri: string; relation: string; properties?: Record<string, unknown> }): Promise<any>;
}
