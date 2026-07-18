export interface ITraversalResult {
  nodeId: string;
  distance: number;
  path: string[];
  edgeTypes: string[];
}

export interface ISubgraphResult {
  nodeIds: string[];
  edgeCount: number;
  communities: string[][];
}

export interface ICitationPath {
  sourceId: string;
  targetId: string;
  path: string[];
  totalWeight: number;
}

export interface IGraphTraversalRepository {
  shortestPath(
    sourceId: string,
    targetId: string,
    maxDepth: number,
  ): Promise<ITraversalResult | null>;
  allPaths(
    sourceId: string,
    targetId: string,
    maxDepth: number,
    maxPaths: number,
  ): Promise<ITraversalResult[]>;
  ancestors(
    nodeId: string,
    maxDepth: number,
  ): Promise<{ nodeId: string; distance: number; edgeType: string }[]>;
  descendants(
    nodeId: string,
    maxDepth: number,
  ): Promise<{ nodeId: string; distance: number; edgeType: string }[]>;
  neighbors(
    nodeId: string,
    direction: 'in' | 'out' | 'both',
    edgeType?: string,
  ): Promise<{ nodeId: string; edgeType: string; weight: number }[]>;
  subgraph(nodeIds: string[]): Promise<{ nodes: any[]; edges: any[] }>;
  connectedComponents(workspaceId: string): Promise<string[][]>;
  citationPaths(
    workspaceId: string,
    sourceEntityType: string,
    targetEntityType: string,
    maxDepth: number,
  ): Promise<ICitationPath[]>;
  dependencySubgraph(
    nodeId: string,
    direction: 'upstream' | 'downstream' | 'both',
    maxDepth: number,
  ): Promise<{ nodes: string[]; edges: any[] }>;
  semanticExpansion(
    nodeId: string,
    maxDepth: number,
    edgeTypeWeight: Record<string, number>,
  ): Promise<{ nodeId: string; score: number }[]>;
}
