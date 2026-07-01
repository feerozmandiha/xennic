import type { TaxonomyNodeProps } from '../ontology.types.js';

export interface ITaxonomyRepository {
  getByLevel(level: number, workspaceId?: string): Promise<TaxonomyNodeProps[]>;
  getChildren(parentId: string): Promise<TaxonomyNodeProps[]>;
  getParent(nodeId: string): Promise<TaxonomyNodeProps | null>;
  getAncestors(nodeId: string): Promise<TaxonomyNodeProps[]>;
  getDescendants(nodeId: string): Promise<TaxonomyNodeProps[]>;
  findById(id: string): Promise<TaxonomyNodeProps | null>;
  findBySlug(slug: string): Promise<TaxonomyNodeProps | null>;
  create(node: TaxonomyNodeProps): Promise<void>;
  update(node: TaxonomyNodeProps): Promise<void>;
}
