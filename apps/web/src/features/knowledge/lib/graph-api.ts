import { apiClient } from '@/lib/api/client';

export interface GraphNode {
  id: string;
  type: string;
  entity_type: string;
  entity_id: string;
  label: string;
  properties: any;
  confidence?: number;
  created_at: string;
}

export interface GraphEdge {
  id: string;
  source_id: string;
  target_id: string;
  edge_type: string;
  weight?: number;
  properties?: any;
}

export const graphApi = {
  getNeighbors: (nodeId: string, direction: 'in' | 'out' | 'both' = 'both') =>
    apiClient.get<{ success: boolean; data: { nodes: GraphNode[]; edges: GraphEdge[] } }>(
      `/knowledge-intelligence/graph/neighbors/${nodeId}?direction=${direction}`,
    ),

  getSubgraph: (nodeIds: string[]) =>
    apiClient.get<{ success: boolean; data: { nodes: GraphNode[]; edges: GraphEdge[] } }>(
      `/knowledge-intelligence/graph/subgraph?nodeIds=${nodeIds.join(',')}`,
    ),

  shortestPath: (sourceId: string, targetId: string) =>
    apiClient.get<{ success: boolean; data: any }>(
      `/knowledge-intelligence/graph/shortest-path/${sourceId}/${targetId}`,
    ),

  getProvenance: (nodeId: string) =>
    apiClient.get<{ success: boolean; data: any }>(
      `/knowledge-intelligence/graph/provenance/${nodeId}`,
    ),

  // Fallback: list all nodes via search (if graph empty, use knowledge list)
  listNodes: async (limit = 20) => {
    try {
      // Try to get nodes via metrics or search
      const res = await apiClient.get<{ success: boolean; data: any[] }>(
        `/knowledge-intelligence/graph/search?limit=${limit}`,
      );
      return res;
    } catch {
      // Fallback to public knowledge as nodes
      const res = await apiClient.get<{ success: boolean; data: any[] }>(
        `/public/knowledge?limit=${limit}`,
      );
      return {
        success: true,
        data: (res.data ?? []).map((k: any) => ({
          id: k.id,
          type: 'knowledge',
          entity_type: 'knowledge',
          entity_id: k.id,
          label: k.content?.title ?? k.slug,
          properties: { slug: k.slug, difficulty: k.difficulty },
          created_at: k.published_at ?? k.created_at,
        })),
      };
    }
  },
};
