export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface GraphSearchResult {
  id: string;
  label: string | null;
  type: string;
  entityType: string;
  entityId: string;
  score: number;
  neighbors: number;
  citations: number;
}

export interface RelatedGraphNode {
  id: string;
  label: string | null;
  type: string;
  entityType: string;
  entityId: string;
  relevance: number;
  connection: string | null;
}

export interface GraphNeighbor {
  nodeId: string;
  edgeType: string;
  weight: number;
}

export interface GraphTraversalItem {
  nodeId: string;
  distance: number;
  edgeType: string;
}

export interface GraphEdge {
  id?: string;
  sourceId?: string;
  targetId?: string;
  source?: string;
  target?: string;
  type?: string;
  weight?: number;
  properties?: Record<string, unknown>;
}

export interface GraphNode {
  id: string;
  label?: string | null;
  type?: string;
  entityType?: string;
  entityId?: string;
  properties?: Record<string, unknown>;
}

export interface GraphSubgraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ShortestPathResult {
  path: string[];
  edges?: GraphEdge[];
  distance?: number;
  cost?: number;
}

export interface ProvenanceItem {
  nodeId: string;
  label?: string | null;
  relation?: string;
  source?: string;
  depth?: number;
  distance?: number;
  [key: string]: unknown;
}

export interface ProvenanceResult {
  nodeId?: string;
  provenance?: ProvenanceItem[];
  root?: GraphNode;
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  chain?: ProvenanceItem[];
  [key: string]: unknown;
}

export interface ConflictResult {
  superseded: Array<{
    nodeId: string;
    supersededBy: string[];
    conflictType: string;
  }>;
  equivalents: Array<{
    nodeId: string;
    equivalentNodes: string[];
    conflictType: string;
  }>;
}

export interface DependencyResult {
  nodes: string[];
  edges: GraphEdge[];
}

export interface CitationExpansion {
  targetId: string;
  depth: number;
  path: string[];
  confidence: number;
}

export interface CitationGraphItem {
  id: string;
  source: { id: string; label: string | null };
  target: { id: string; label: string | null };
  context: string | null;
  location: string | null;
  method: string;
  confidence: number;
}

export interface NodeMetrics {
  nodeId: string;
  confidence: number;
  freshness: number;
  authority: number;
  completeness: number;
  compositeScore: number;
  accessCount: number;
  lastAccessedAt: string | null;
  computedAt: string;
  updatedAt: string;
}

export type WorkspaceMetric = 'confidence' | 'freshness' | 'authority' | 'completeness';

export interface RankedNode {
  nodeId: string;
  score: number;
  label: string | null;
}

export interface CompletenessAnalysis {
  average: number;
  nodes: number;
  completeNodes: number;
  incompleteNodes: number;
}

export interface FreshnessResult {
  nodeId: string;
  stale: boolean;
  daysSinceUpdate: number;
}

export interface ConnectedComponentsResult {
  components: string[][];
  count: number;
}

export interface ConfidenceRecomputeResult {
  computed: number;
  results: unknown[];
}

export interface KnowledgeCluster {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  nodeIds: string[];
  properties: {
    algorithm?: string;
    threshold?: number;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DuplicateAnalysis {
  nodeId: string;
  duplicates: string[];
  nearDuplicates: string[];
  confidence: number;
}

export interface Ontology {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  version: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OntologyClass {
  id: string;
  ontologyId: string;
  uri: string;
  label: string;
  description: string | null;
  parentId: string | null;
  properties: Record<string, unknown>;
  sortOrder: number;
  isAbstract: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaxonomyGroup {
  ontology: { id: string; name: string; version: string };
  classes: Array<{
    id: string;
    uri: string;
    label: string;
    parentId: string | null;
    isAbstract: boolean;
  }>;
}

export interface NodeClassification {
  nodeId: string;
  classUri: string;
  label: string;
  confidence: number;
}

export interface NodeInvestigation {
  metrics: NodeMetrics | null;
  neighbors: GraphNeighbor[];
  related: RelatedGraphNode[];
  ancestors: GraphTraversalItem[];
  descendants: GraphTraversalItem[];
  provenance: ProvenanceResult | ProvenanceItem[];
  dependencies: DependencyResult;
  conflicts: ConflictResult;
  duplicates: DuplicateAnalysis;
  citations: CitationExpansion[];
}
