import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IGraphTraversalRepository, ITraversalResult, ICitationPath } from '../../domain/interfaces/graph-traversal.repository.interface.js';

@Injectable()
export class GraphTraversalRepository implements IGraphTraversalRepository {
  private readonly logger = new Logger(GraphTraversalRepository.name);

  async shortestPath(sourceId: string, targetId: string, maxDepth: number): Promise<ITraversalResult | null> {
    const rows = await prisma.$queryRaw<any[]>`
      WITH RECURSIVE path AS (
        SELECT 
          source_id as current_node,
          ARRAY[source_id] as path,
          0 as depth,
          ARRAY[type] as edge_types,
          0.0 as total_weight
        FROM knowledge_graph_edges
        WHERE source_id = ${sourceId}
        
        UNION ALL
        
        SELECT 
          e.target_id,
          p.path || e.target_id,
          p.depth + 1,
          p.edge_types || e.type,
          p.total_weight + e.weight
        FROM knowledge_graph_edges e
        JOIN path p ON e.source_id = p.current_node
        WHERE p.depth < ${maxDepth}
          AND NOT e.target_id = ANY(p.path)
      )
      SELECT current_node, path, depth, edge_types, total_weight
      FROM path
      WHERE current_node = ${targetId}
      ORDER BY total_weight ASC, depth ASC
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      nodeId: row.current_node,
      distance: row.depth,
      path: row.path,
      edgeTypes: row.edge_types,
    };
  }

  async allPaths(sourceId: string, targetId: string, maxDepth: number, maxPaths: number): Promise<ITraversalResult[]> {
    const rows = await prisma.$queryRaw<any[]>`
      WITH RECURSIVE path AS (
        SELECT 
          source_id as current_node,
          ARRAY[source_id] as path,
          0 as depth,
          ARRAY[type] as edge_types,
          0.0 as total_weight
        FROM knowledge_graph_edges
        WHERE source_id = ${sourceId}
        
        UNION ALL
        
        SELECT 
          e.target_id,
          p.path || e.target_id,
          p.depth + 1,
          p.edge_types || e.type,
          p.total_weight + e.weight
        FROM knowledge_graph_edges e
        JOIN path p ON e.source_id = p.current_node
        WHERE p.depth < ${maxDepth}
          AND NOT e.target_id = ANY(p.path)
      )
      SELECT current_node, path, depth, edge_types, total_weight
      FROM path
      WHERE current_node = ${targetId}
      ORDER BY total_weight ASC, depth ASC
      LIMIT ${maxPaths}
    `;
    return rows.map((row) => ({
      nodeId: row.current_node,
      distance: row.depth,
      path: row.path,
      edgeTypes: row.edge_types,
    }));
  }

  async ancestors(nodeId: string, maxDepth: number): Promise<{ nodeId: string; distance: number; edgeType: string }[]> {
    const rows = await prisma.$queryRaw<any[]>`
      WITH RECURSIVE ancestors AS (
        SELECT 
          source_id as node_id,
          1 as distance,
          type as edge_type
        FROM knowledge_graph_edges
        WHERE target_id = ${nodeId}
        
        UNION ALL
        
        SELECT 
          e.source_id,
          a.distance + 1,
          e.type
        FROM knowledge_graph_edges e
        JOIN ancestors a ON e.target_id = a.node_id
        WHERE a.distance < ${maxDepth}
      )
      SELECT DISTINCT node_id, distance, edge_type
      FROM ancestors
      ORDER BY distance ASC
    `;
    return rows.map((r) => ({ nodeId: r.node_id, distance: r.distance, edgeType: r.edge_type }));
  }

  async descendants(nodeId: string, maxDepth: number): Promise<{ nodeId: string; distance: number; edgeType: string }[]> {
    const rows = await prisma.$queryRaw<any[]>`
      WITH RECURSIVE descendants AS (
        SELECT 
          target_id as node_id,
          1 as distance,
          type as edge_type
        FROM knowledge_graph_edges
        WHERE source_id = ${nodeId}
        
        UNION ALL
        
        SELECT 
          e.target_id,
          d.distance + 1,
          e.type
        FROM knowledge_graph_edges e
        JOIN descendants d ON e.source_id = d.node_id
        WHERE d.distance < ${maxDepth}
      )
      SELECT DISTINCT node_id, distance, edge_type
      FROM descendants
      ORDER BY distance ASC
    `;
    return rows.map((r) => ({ nodeId: r.node_id, distance: r.distance, edgeType: r.edge_type }));
  }

  async neighbors(nodeId: string, direction: 'in' | 'out' | 'both', edgeType?: string): Promise<{ nodeId: string; edgeType: string; weight: number }[]> {
    const incoming = direction === 'in' || direction === 'both';
    const outgoing = direction === 'out' || direction === 'both';

    const incomingQuery = incoming
      ? prisma.$queryRaw<any[]>`
          SELECT source_id as node_id, type as edge_type, weight
          FROM knowledge_graph_edges
          WHERE target_id = ${nodeId}
            ${edgeType ? `AND type = ${edgeType}` : ''}
        `
      : [];

    const outgoingQuery = outgoing
      ? prisma.$queryRaw<any[]>`
          SELECT target_id as node_id, type as edge_type, weight
          FROM knowledge_graph_edges
          WHERE source_id = ${nodeId}
            ${edgeType ? `AND type = ${edgeType}` : ''}
        `
      : [];

    const [inRows, outRows] = await Promise.all([incomingQuery, outgoingQuery]);
    const combined = [...(inRows ?? []), ...(outRows ?? [])];
    return combined.map((r) => ({ nodeId: r.node_id, edgeType: r.edge_type, weight: Number(r.weight) }));
  }

  async subgraph(nodeIds: string[]): Promise<{ nodes: any[]; edges: any[] }> {
    if (nodeIds.length === 0) return { nodes: [], edges: [] };
    const nodes = await prisma.knowledge_graph_nodes.findMany({
      where: { id: { in: nodeIds } },
    });
    const edges = await prisma.knowledge_graph_edges.findMany({
      where: {
        AND: [
          { source_id: { in: nodeIds } },
          { target_id: { in: nodeIds } },
        ],
      },
    });
    return {
      nodes: nodes.map((n) => ({ id: n.id, type: n.type, label: n.label, properties: n.properties })),
      edges: edges.map((e) => ({ id: e.id, sourceId: e.source_id, targetId: e.target_id, type: e.type, weight: e.weight })),
    };
  }

  async connectedComponents(workspaceId: string): Promise<string[][]> {
    const rows = await prisma.$queryRaw<any[]>`
      WITH RECURSIVE connected AS (
        SELECT id, ARRAY[id] as component
        FROM knowledge_graph_nodes
        WHERE workspace_id = ${workspaceId}
        
        UNION ALL
        
        SELECT n.id, c.component || n.id
        FROM knowledge_graph_nodes n
        JOIN knowledge_graph_edges e ON e.target_id = n.id OR e.source_id = n.id
        JOIN connected c ON (e.target_id = ANY(c.component) OR e.source_id = ANY(c.component))
        WHERE n.workspace_id = ${workspaceId}
          AND NOT n.id = ANY(c.component)
      )
      SELECT id, component
      FROM connected
      ORDER BY id
    `;
    const componentMap = new Map<string, string[]>();
    for (const row of rows) {
      if (!componentMap.has(row.id)) {
        componentMap.set(row.id, row.component);
      }
    }
    return Array.from(componentMap.values());
  }

  async citationPaths(
    workspaceId: string,
    sourceEntityType: string,
    targetEntityType: string,
    maxDepth: number,
  ): Promise<ICitationPath[]> {
    const rows = await prisma.$queryRaw<any[]>`
      WITH RECURSIVE citation_graph AS (
        SELECT 
          source_id,
          target_id,
          ARRAY[source_id, target_id] as path,
          1 as depth,
          weight as total_weight
        FROM knowledge_citations
        WHERE workspace_id = ${workspaceId}
        
        UNION ALL
        
        SELECT 
          cg.source_id,
          kc.target_id,
          cg.path || kc.target_id,
          cg.depth + 1,
          cg.total_weight + 1.0
        FROM citation_graph cg
        JOIN knowledge_citations kc ON kc.source_id = cg.target_id
        WHERE cg.depth < ${maxDepth}
          AND NOT kc.target_id = ANY(cg.path)
      )
      SELECT source_id, target_id, path, total_weight
      FROM citation_graph
      ORDER BY total_weight ASC
      LIMIT 50
    `;
    return rows.map((r) => ({
      sourceId: r.source_id,
      targetId: r.target_id,
      path: r.path,
      totalWeight: Number(r.total_weight),
    }));
  }

  async dependencySubgraph(
    nodeId: string,
    direction: 'upstream' | 'downstream' | 'both',
    maxDepth: number,
  ): Promise<{ nodes: string[]; edges: any[] }> {
    const upstream = direction === 'upstream' || direction === 'both';
    const downstream = direction === 'downstream' || direction === 'both';

    let resultNodes: string[] = [];
    let resultEdges: any[] = [];

    if (upstream) {
      const upstreamNodes = await prisma.$queryRaw<any[]>`
        WITH RECURSIVE upstream AS (
          SELECT source_id as node_id, 1 as depth
          FROM knowledge_graph_edges
          WHERE target_id = ${nodeId} AND type IN ('depends_on', 'references', 'derived_from')
          UNION ALL
          SELECT e.source_id, u.depth + 1
          FROM upstream u
          JOIN knowledge_graph_edges e ON e.target_id = u.node_id
          WHERE u.depth < ${maxDepth}
        )
        SELECT DISTINCT node_id FROM upstream
      `;
      resultNodes = upstreamNodes.map((r) => r.node_id);
      resultNodes.push(nodeId);
    }

    if (downstream) {
      const downstreamNodes = await prisma.$queryRaw<any[]>`
        WITH RECURSIVE downstream AS (
          SELECT target_id as node_id, 1 as depth
          FROM knowledge_graph_edges
          WHERE source_id = ${nodeId} AND type IN ('depends_on', 'references', 'derived_from')
          UNION ALL
          SELECT e.target_id, d.depth + 1
          FROM downstream d
          JOIN knowledge_graph_edges e ON e.source_id = d.node_id
          WHERE d.depth < ${maxDepth}
        )
        SELECT DISTINCT node_id FROM downstream
      `;
      resultNodes = [...new Set([...resultNodes, ...downstreamNodes.map((r) => r.node_id)])];
      resultNodes.push(nodeId);
    }

    const uniqueNodes = [...new Set(resultNodes)];
    if (uniqueNodes.length > 0) {
      const edges = await prisma.knowledge_graph_edges.findMany({
        where: {
          AND: [
            { source_id: { in: uniqueNodes } },
            { target_id: { in: uniqueNodes } },
          ],
        },
      });
      resultEdges = edges.map((e) => ({
        id: e.id,
        sourceId: e.source_id,
        targetId: e.target_id,
        type: e.type,
        weight: e.weight,
      }));
    }

    return { nodes: uniqueNodes, edges: resultEdges };
  }

  async semanticExpansion(
    nodeId: string,
    maxDepth: number,
    edgeTypeWeight: Record<string, number>,
  ): Promise<{ nodeId: string; score: number }[]> {
    const rows = await prisma.$queryRaw<any[]>`
      WITH RECURSIVE semantic AS (
        SELECT 
          target_id as node_id,
          1 as depth,
          weight * ${JSON.stringify(edgeTypeWeight).replace(/'/g, "''")}::float as cumulative_score
        FROM knowledge_graph_edges
        WHERE source_id = ${nodeId}
        
        UNION ALL
        
        SELECT 
          e.target_id,
          s.depth + 1,
          s.cumulative_score * (e.weight * ${JSON.stringify(edgeTypeWeight).replace(/'/g, "''")}::float)
        FROM semantic s
        JOIN knowledge_graph_edges e ON e.source_id = s.node_id
        WHERE s.depth < ${maxDepth}
      )
      SELECT node_id, MAX(cumulative_score) as score
      FROM semantic
      GROUP BY node_id
      ORDER BY score DESC
    `;
    return rows.map((r) => ({ nodeId: r.node_id, score: Number(r.score) }));
  }
}
