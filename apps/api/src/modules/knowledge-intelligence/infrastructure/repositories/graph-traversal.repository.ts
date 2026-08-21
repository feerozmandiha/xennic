import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type {
  IGraphTraversalRepository,
  ITraversalResult,
  ICitationPath,
} from '../../domain/interfaces/graph-traversal.repository.interface.js';

@Injectable()
export class GraphTraversalRepository implements IGraphTraversalRepository {
  private readonly logger = new Logger(GraphTraversalRepository.name);

  async shortestPath(
    sourceId: string,
    targetId: string,
    maxDepth: number,
  ): Promise<ITraversalResult | null> {
    const rows = await prisma.$queryRaw<any[]>`
      WITH RECURSIVE path AS (
        SELECT
          n.id AS current_node,
          ARRAY[n.id] AS path,
          0 AS depth,
          ARRAY[]::text[] AS edge_types,
          0.0::double precision AS total_weight,
          n.workspace_id
        FROM knowledge_graph_nodes n
        WHERE n.id = ${sourceId}

        UNION ALL

        SELECT
          e.target_id,
          p.path || e.target_id,
          p.depth + 1,
          p.edge_types || e.type,
          p.total_weight + e.weight,
          p.workspace_id
        FROM path p
        JOIN knowledge_graph_edges e
          ON e.source_id = p.current_node AND e.workspace_id = p.workspace_id
        JOIN knowledge_graph_nodes target
          ON target.id = e.target_id AND target.workspace_id = p.workspace_id
        WHERE p.depth < ${maxDepth}
          AND NOT e.target_id = ANY(p.path)
      )
      SELECT current_node, path, depth, edge_types, total_weight
      FROM path
      WHERE current_node = ${targetId}
      ORDER BY depth ASC, total_weight DESC
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

  async allPaths(
    sourceId: string,
    targetId: string,
    maxDepth: number,
    maxPaths: number,
  ): Promise<ITraversalResult[]> {
    const rows = await prisma.$queryRaw<any[]>`
      WITH RECURSIVE path AS (
        SELECT
          n.id AS current_node,
          ARRAY[n.id] AS path,
          0 AS depth,
          ARRAY[]::text[] AS edge_types,
          0.0::double precision AS total_weight,
          n.workspace_id
        FROM knowledge_graph_nodes n
        WHERE n.id = ${sourceId}

        UNION ALL

        SELECT
          e.target_id,
          p.path || e.target_id,
          p.depth + 1,
          p.edge_types || e.type,
          p.total_weight + e.weight,
          p.workspace_id
        FROM path p
        JOIN knowledge_graph_edges e
          ON e.source_id = p.current_node AND e.workspace_id = p.workspace_id
        JOIN knowledge_graph_nodes target
          ON target.id = e.target_id AND target.workspace_id = p.workspace_id
        WHERE p.depth < ${maxDepth}
          AND (p.depth = 0 OR p.current_node <> ${targetId})
          AND (e.target_id = ${targetId} OR NOT e.target_id = ANY(p.path))
      )
      SELECT current_node, path, depth, edge_types, total_weight
      FROM path
      WHERE current_node = ${targetId}
        AND depth > 0
      ORDER BY depth ASC, total_weight DESC
      LIMIT ${maxPaths}
    `;
    return rows.map((row) => ({
      nodeId: row.current_node,
      distance: row.depth,
      path: row.path,
      edgeTypes: row.edge_types,
    }));
  }

  async ancestors(
    nodeId: string,
    maxDepth: number,
  ): Promise<{ nodeId: string; distance: number; edgeType: string }[]> {
    const rows = await prisma.$queryRaw<any[]>`
      WITH RECURSIVE ancestors AS (
        SELECT
          e.source_id AS node_id,
          1 AS distance,
          e.type AS edge_type,
          target.workspace_id,
          ARRAY[e.target_id, e.source_id] AS path
        FROM knowledge_graph_edges e
        JOIN knowledge_graph_nodes target ON target.id = e.target_id
        JOIN knowledge_graph_nodes source
          ON source.id = e.source_id AND source.workspace_id = target.workspace_id
        WHERE e.target_id = ${nodeId}
          AND e.workspace_id = target.workspace_id

        UNION ALL

        SELECT
          e.source_id,
          a.distance + 1,
          e.type,
          a.workspace_id,
          a.path || e.source_id
        FROM ancestors a
        JOIN knowledge_graph_edges e
          ON e.target_id = a.node_id AND e.workspace_id = a.workspace_id
        JOIN knowledge_graph_nodes source
          ON source.id = e.source_id AND source.workspace_id = a.workspace_id
        WHERE a.distance < ${maxDepth}
          AND NOT e.source_id = ANY(a.path)
      )
      SELECT DISTINCT node_id, distance, edge_type
      FROM ancestors
      ORDER BY distance ASC
    `;
    return rows.map((r) => ({ nodeId: r.node_id, distance: r.distance, edgeType: r.edge_type }));
  }

  async descendants(
    nodeId: string,
    maxDepth: number,
  ): Promise<{ nodeId: string; distance: number; edgeType: string }[]> {
    const rows = await prisma.$queryRaw<any[]>`
      WITH RECURSIVE descendants AS (
        SELECT
          e.target_id AS node_id,
          1 AS distance,
          e.type AS edge_type,
          source.workspace_id,
          ARRAY[e.source_id, e.target_id] AS path
        FROM knowledge_graph_edges e
        JOIN knowledge_graph_nodes source ON source.id = e.source_id
        JOIN knowledge_graph_nodes target
          ON target.id = e.target_id AND target.workspace_id = source.workspace_id
        WHERE e.source_id = ${nodeId}
          AND e.workspace_id = source.workspace_id

        UNION ALL

        SELECT
          e.target_id,
          d.distance + 1,
          e.type,
          d.workspace_id,
          d.path || e.target_id
        FROM descendants d
        JOIN knowledge_graph_edges e
          ON e.source_id = d.node_id AND e.workspace_id = d.workspace_id
        JOIN knowledge_graph_nodes target
          ON target.id = e.target_id AND target.workspace_id = d.workspace_id
        WHERE d.distance < ${maxDepth}
          AND NOT e.target_id = ANY(d.path)
      )
      SELECT DISTINCT node_id, distance, edge_type
      FROM descendants
      ORDER BY distance ASC
    `;
    return rows.map((r) => ({ nodeId: r.node_id, distance: r.distance, edgeType: r.edge_type }));
  }

  async neighbors(
    nodeId: string,
    direction: 'in' | 'out' | 'both',
    edgeType?: string,
  ): Promise<{ nodeId: string; edgeType: string; weight: number }[]> {
    const incoming = direction === 'in' || direction === 'both';
    const outgoing = direction === 'out' || direction === 'both';

    const incomingQuery = incoming
      ? edgeType
        ? prisma.$queryRaw<any[]>`
            SELECT e.source_id AS node_id, e.type AS edge_type, e.weight
            FROM knowledge_graph_edges e
            JOIN knowledge_graph_nodes current ON current.id = e.target_id
            JOIN knowledge_graph_nodes neighbor
              ON neighbor.id = e.source_id AND neighbor.workspace_id = current.workspace_id
            WHERE e.target_id = ${nodeId}
              AND e.workspace_id = current.workspace_id
              AND e.type = ${edgeType}
          `
        : prisma.$queryRaw<any[]>`
            SELECT e.source_id AS node_id, e.type AS edge_type, e.weight
            FROM knowledge_graph_edges e
            JOIN knowledge_graph_nodes current ON current.id = e.target_id
            JOIN knowledge_graph_nodes neighbor
              ON neighbor.id = e.source_id AND neighbor.workspace_id = current.workspace_id
            WHERE e.target_id = ${nodeId}
              AND e.workspace_id = current.workspace_id
          `
      : [];

    const outgoingQuery = outgoing
      ? edgeType
        ? prisma.$queryRaw<any[]>`
            SELECT e.target_id AS node_id, e.type AS edge_type, e.weight
            FROM knowledge_graph_edges e
            JOIN knowledge_graph_nodes current ON current.id = e.source_id
            JOIN knowledge_graph_nodes neighbor
              ON neighbor.id = e.target_id AND neighbor.workspace_id = current.workspace_id
            WHERE e.source_id = ${nodeId}
              AND e.workspace_id = current.workspace_id
              AND e.type = ${edgeType}
          `
        : prisma.$queryRaw<any[]>`
            SELECT e.target_id AS node_id, e.type AS edge_type, e.weight
            FROM knowledge_graph_edges e
            JOIN knowledge_graph_nodes current ON current.id = e.source_id
            JOIN knowledge_graph_nodes neighbor
              ON neighbor.id = e.target_id AND neighbor.workspace_id = current.workspace_id
            WHERE e.source_id = ${nodeId}
              AND e.workspace_id = current.workspace_id
          `
      : [];

    const [inRows, outRows] = await Promise.all([incomingQuery, outgoingQuery]);
    const combined = [...(inRows ?? []), ...(outRows ?? [])];
    return combined.map((r) => ({
      nodeId: r.node_id,
      edgeType: r.edge_type,
      weight: Number(r.weight),
    }));
  }

  async subgraph(nodeIds: string[]): Promise<{ nodes: any[]; edges: any[] }> {
    if (nodeIds.length === 0) return { nodes: [], edges: [] };
    const root = await prisma.knowledge_graph_nodes.findUnique({
      where: { id: nodeIds[0] },
      select: { workspace_id: true },
    });
    if (!root) return { nodes: [], edges: [] };

    const workspaceId = root.workspace_id;
    const scopedNodes = await prisma.knowledge_graph_nodes.findMany({
      where: { id: { in: nodeIds }, workspace_id: workspaceId },
    });
    const scopedNodeIds = scopedNodes.map((node) => node.id);
    const edges = await prisma.knowledge_graph_edges.findMany({
      where: {
        workspace_id: workspaceId,
        AND: [{ source_id: { in: scopedNodeIds } }, { target_id: { in: scopedNodeIds } }],
      },
    });
    return {
      nodes: scopedNodes.map((n) => ({
        id: n.id,
        type: n.type,
        label: n.label,
        properties: n.properties,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        sourceId: e.source_id,
        targetId: e.target_id,
        type: e.type,
        weight: e.weight,
      })),
    };
  }

  async connectedComponents(workspaceId: string): Promise<string[][]> {
    const [nodes, edges] = await Promise.all([
      prisma.knowledge_graph_nodes.findMany({
        where: { workspace_id: workspaceId },
        select: { id: true },
        orderBy: { id: 'asc' },
      }),
      prisma.knowledge_graph_edges.findMany({
        where: { workspace_id: workspaceId },
        select: { source_id: true, target_id: true },
      }),
    ]);

    const nodeIds = new Set(nodes.map((node) => node.id));
    const adjacency = new Map(nodes.map((node) => [node.id, new Set<string>()]));
    for (const edge of edges) {
      if (!nodeIds.has(edge.source_id) || !nodeIds.has(edge.target_id)) continue;
      adjacency.get(edge.source_id)!.add(edge.target_id);
      adjacency.get(edge.target_id)!.add(edge.source_id);
    }

    const visited = new Set<string>();
    const components: string[][] = [];
    for (const node of nodes) {
      if (visited.has(node.id)) continue;
      const component: string[] = [];
      const pending = [node.id];
      visited.add(node.id);

      while (pending.length > 0) {
        const current = pending.pop()!;
        component.push(current);
        for (const neighbor of adjacency.get(current) ?? []) {
          if (visited.has(neighbor)) continue;
          visited.add(neighbor);
          pending.push(neighbor);
        }
      }

      components.push(component.sort());
    }

    return components;
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
          kc.source_id,
          kc.target_id,
          ARRAY[kc.source_id, kc.target_id] AS path,
          1 AS depth,
          kc.confidence::double precision AS total_weight
        FROM knowledge_citations kc
        JOIN knowledge_graph_nodes source
          ON source.id = kc.source_id AND source.workspace_id = kc.workspace_id
        JOIN knowledge_graph_nodes target
          ON target.id = kc.target_id AND target.workspace_id = kc.workspace_id
        WHERE kc.workspace_id = ${workspaceId}
          AND source.entity_type = ${sourceEntityType}

        UNION ALL

        SELECT
          cg.source_id,
          kc.target_id,
          cg.path || kc.target_id,
          cg.depth + 1,
          cg.total_weight * kc.confidence
        FROM citation_graph cg
        JOIN knowledge_citations kc
          ON kc.source_id = cg.target_id AND kc.workspace_id = ${workspaceId}
        JOIN knowledge_graph_nodes target
          ON target.id = kc.target_id AND target.workspace_id = kc.workspace_id
        WHERE cg.depth < ${maxDepth}
          AND NOT kc.target_id = ANY(cg.path)
      )
      SELECT cg.source_id, cg.target_id, cg.path, cg.total_weight
      FROM citation_graph cg
      JOIN knowledge_graph_nodes target
        ON target.id = cg.target_id AND target.workspace_id = ${workspaceId}
      WHERE target.entity_type = ${targetEntityType}
      ORDER BY cg.total_weight DESC, cg.depth ASC
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
    const root = await prisma.knowledge_graph_nodes.findUnique({
      where: { id: nodeId },
      select: { workspace_id: true },
    });
    if (!root) return { nodes: [], edges: [] };

    const workspaceId = root.workspace_id;
    let resultNodes: string[] = [];
    let resultEdges: any[] = [];

    if (upstream) {
      const upstreamNodes = await prisma.$queryRaw<any[]>`
        WITH RECURSIVE upstream AS (
          SELECT
            e.source_id AS node_id,
            1 AS depth,
            ARRAY[e.target_id, e.source_id] AS path
          FROM knowledge_graph_edges e
          JOIN knowledge_graph_nodes source
            ON source.id = e.source_id AND source.workspace_id = e.workspace_id
          WHERE e.target_id = ${nodeId}
            AND e.workspace_id = ${workspaceId}
            AND e.type IN ('depends_on', 'references', 'derived_from')

          UNION ALL

          SELECT e.source_id, u.depth + 1, u.path || e.source_id
          FROM upstream u
          JOIN knowledge_graph_edges e
            ON e.target_id = u.node_id AND e.workspace_id = ${workspaceId}
          JOIN knowledge_graph_nodes source
            ON source.id = e.source_id AND source.workspace_id = e.workspace_id
          WHERE u.depth < ${maxDepth}
            AND e.type IN ('depends_on', 'references', 'derived_from')
            AND NOT e.source_id = ANY(u.path)
        )
        SELECT DISTINCT node_id FROM upstream
      `;
      resultNodes = upstreamNodes.map((r) => r.node_id);
      resultNodes.push(nodeId);
    }

    if (downstream) {
      const downstreamNodes = await prisma.$queryRaw<any[]>`
        WITH RECURSIVE downstream AS (
          SELECT
            e.target_id AS node_id,
            1 AS depth,
            ARRAY[e.source_id, e.target_id] AS path
          FROM knowledge_graph_edges e
          JOIN knowledge_graph_nodes target
            ON target.id = e.target_id AND target.workspace_id = e.workspace_id
          WHERE e.source_id = ${nodeId}
            AND e.workspace_id = ${workspaceId}
            AND e.type IN ('depends_on', 'references', 'derived_from')

          UNION ALL

          SELECT e.target_id, d.depth + 1, d.path || e.target_id
          FROM downstream d
          JOIN knowledge_graph_edges e
            ON e.source_id = d.node_id AND e.workspace_id = ${workspaceId}
          JOIN knowledge_graph_nodes target
            ON target.id = e.target_id AND target.workspace_id = e.workspace_id
          WHERE d.depth < ${maxDepth}
            AND e.type IN ('depends_on', 'references', 'derived_from')
            AND NOT e.target_id = ANY(d.path)
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
          workspace_id: workspaceId,
          type: { in: ['depends_on', 'references', 'derived_from'] },
          AND: [{ source_id: { in: uniqueNodes } }, { target_id: { in: uniqueNodes } }],
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
    const serializedWeights = JSON.stringify(edgeTypeWeight);
    const rows = await prisma.$queryRaw<any[]>`
      WITH RECURSIVE semantic AS (
        SELECT
          e.target_id AS node_id,
          1 AS depth,
          e.weight * COALESCE(
            ((${serializedWeights}::jsonb ->> e.type)::double precision),
            1.0
          ) AS cumulative_score,
          source.workspace_id,
          ARRAY[e.source_id, e.target_id] AS path
        FROM knowledge_graph_edges e
        JOIN knowledge_graph_nodes source ON source.id = e.source_id
        JOIN knowledge_graph_nodes target
          ON target.id = e.target_id AND target.workspace_id = source.workspace_id
        WHERE e.source_id = ${nodeId}
          AND e.workspace_id = source.workspace_id

        UNION ALL

        SELECT
          e.target_id,
          s.depth + 1,
          s.cumulative_score * e.weight * COALESCE(
            ((${serializedWeights}::jsonb ->> e.type)::double precision),
            1.0
          ),
          s.workspace_id,
          s.path || e.target_id
        FROM semantic s
        JOIN knowledge_graph_edges e
          ON e.source_id = s.node_id AND e.workspace_id = s.workspace_id
        JOIN knowledge_graph_nodes target
          ON target.id = e.target_id AND target.workspace_id = s.workspace_id
        WHERE s.depth < ${maxDepth}
          AND NOT e.target_id = ANY(s.path)
      )
      SELECT node_id, MAX(cumulative_score) AS score
      FROM semantic
      GROUP BY node_id
      ORDER BY score DESC
    `;
    return rows.map((r) => ({ nodeId: r.node_id, score: Number(r.score) }));
  }
}
