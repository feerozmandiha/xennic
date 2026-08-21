const queryRawMock = jest.fn();
const nodeFindUniqueMock = jest.fn();
const nodeFindManyMock = jest.fn();
const edgeFindManyMock = jest.fn();

jest.mock(
  '@xennic/database',
  () => ({
    prisma: {
      $queryRaw: queryRawMock,
      knowledge_graph_nodes: {
        findUnique: nodeFindUniqueMock,
        findMany: nodeFindManyMock,
      },
      knowledge_graph_edges: {
        findMany: edgeFindManyMock,
      },
    },
  }),
  { virtual: true },
);

import { GraphTraversalRepository } from './graph-traversal.repository.js';

interface CapturedQuery {
  text: string;
  values: unknown[];
}

function captureQuery(callIndex = 0): CapturedQuery {
  const [strings, ...values] = queryRawMock.mock.calls[callIndex] as [
    TemplateStringsArray,
    ...unknown[],
  ];
  return { text: strings.join('?'), values };
}

describe('GraphTraversalRepository', () => {
  let repository: GraphTraversalRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    queryRawMock.mockResolvedValue([]);
    nodeFindUniqueMock.mockResolvedValue(null);
    nodeFindManyMock.mockResolvedValue([]);
    edgeFindManyMock.mockResolvedValue([]);
    repository = new GraphTraversalRepository();
  });

  describe('path traversal', () => {
    it('anchors shortest paths at the source node and scopes recursion to its workspace', async () => {
      queryRawMock.mockResolvedValueOnce([
        {
          current_node: 'target-node',
          depth: 2,
          path: ['source-node', 'middle-node', 'target-node'],
          edge_types: ['depends_on', 'references'],
        },
      ]);

      await expect(repository.shortestPath('source-node', 'target-node', 4)).resolves.toEqual({
        nodeId: 'target-node',
        distance: 2,
        path: ['source-node', 'middle-node', 'target-node'],
        edgeTypes: ['depends_on', 'references'],
      });

      const query = captureQuery();
      expect(query.text).toContain('FROM knowledge_graph_nodes n');
      expect(query.text).toContain('ARRAY[n.id] AS path');
      expect(query.text).toContain('ARRAY[]::text[] AS edge_types');
      expect(query.text).toContain('e.workspace_id = p.workspace_id');
      expect(query.text).toContain('target.workspace_id = p.workspace_id');
      expect(query.text).toContain('ORDER BY depth ASC, total_weight DESC');
      expect(query.values).toEqual(['source-node', 4, 'target-node']);
    });

    it('uses the same corrected initialization and scoping for all paths', async () => {
      await repository.allPaths('source-node', 'target-node', 5, 7);

      const query = captureQuery();
      expect(query.text).toContain('ARRAY[n.id] AS path');
      expect(query.text).toContain('0 AS depth');
      expect(query.text).toContain('ARRAY[]::text[] AS edge_types');
      expect(query.text).toContain('e.workspace_id = p.workspace_id');
      expect(query.text).toContain('e.target_id = ? OR NOT e.target_id = ANY(p.path)');
      expect(query.text).toContain('AND depth > 0');
      expect(query.values).toEqual([
        'source-node',
        5,
        'target-node',
        'target-node',
        'target-node',
        7,
      ]);
    });

    it('returns a non-trivial path that closes back onto its source', async () => {
      queryRawMock.mockResolvedValueOnce([
        {
          current_node: 'source-node',
          path: ['source-node', 'middle-node', 'source-node'],
          depth: 2,
          edge_types: ['depends_on', 'depends_on'],
          total_weight: 2,
        },
      ]);

      const result = await repository.allPaths('source-node', 'source-node', 5, 7);
      const query = captureQuery();

      expect(query.text).toContain('p.depth = 0 OR p.current_node <> ?');
      expect(query.text).toContain('e.target_id = ? OR NOT e.target_id = ANY(p.path)');
      expect(query.text).toContain('AND depth > 0');
      expect(result).toEqual([
        {
          nodeId: 'source-node',
          distance: 2,
          path: ['source-node', 'middle-node', 'source-node'],
          edgeTypes: ['depends_on', 'depends_on'],
        },
      ]);
    });

    it('workspace-scopes ancestor and descendant recursion and prevents cycles', async () => {
      await repository.ancestors('node-1', 3);
      await repository.descendants('node-1', 3);

      const ancestorQuery = captureQuery(0);
      expect(ancestorQuery.text).toContain('e.workspace_id = target.workspace_id');
      expect(ancestorQuery.text).toContain('e.workspace_id = a.workspace_id');
      expect(ancestorQuery.text).toContain('NOT e.source_id = ANY(a.path)');

      const descendantQuery = captureQuery(1);
      expect(descendantQuery.text).toContain('e.workspace_id = source.workspace_id');
      expect(descendantQuery.text).toContain('e.workspace_id = d.workspace_id');
      expect(descendantQuery.text).toContain('NOT e.target_id = ANY(d.path)');
    });
  });

  describe('neighbors', () => {
    it('binds an incoming edge type as a query parameter and scopes both endpoints', async () => {
      queryRawMock.mockResolvedValueOnce([
        { node_id: 'source-node', edge_type: 'depends_on', weight: 0.75 },
      ]);

      await expect(repository.neighbors('target-node', 'in', 'depends_on')).resolves.toEqual([
        { nodeId: 'source-node', edgeType: 'depends_on', weight: 0.75 },
      ]);

      const query = captureQuery();
      expect(query.text).toContain('e.target_id = ?');
      expect(query.text).toContain('e.type = ?');
      expect(query.text).toContain('e.workspace_id = current.workspace_id');
      expect(query.text).toContain('neighbor.workspace_id = current.workspace_id');
      expect(query.values).toEqual(['target-node', 'depends_on']);
    });

    it('does not add an edge-type predicate when no filter is provided', async () => {
      await repository.neighbors('source-node', 'out');

      const query = captureQuery();
      expect(query.text).toContain('e.source_id = ?');
      expect(query.text).not.toContain('e.type = ?');
      expect(query.values).toEqual(['source-node']);
    });

    it('runs both parameterized directions for a bidirectional request', async () => {
      queryRawMock
        .mockResolvedValueOnce([{ node_id: 'incoming-node', edge_type: 'related_to', weight: 1 }])
        .mockResolvedValueOnce([
          { node_id: 'outgoing-node', edge_type: 'related_to', weight: 0.5 },
        ]);

      await expect(repository.neighbors('center-node', 'both', 'related_to')).resolves.toEqual([
        { nodeId: 'incoming-node', edgeType: 'related_to', weight: 1 },
        { nodeId: 'outgoing-node', edgeType: 'related_to', weight: 0.5 },
      ]);

      expect(queryRawMock).toHaveBeenCalledTimes(2);
      expect(captureQuery(0).values).toEqual(['center-node', 'related_to']);
      expect(captureQuery(1).values).toEqual(['center-node', 'related_to']);
    });

    it('does not query an excluded direction', async () => {
      await repository.neighbors('center-node', 'in');
      expect(queryRawMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('workspace-scoped graph extraction', () => {
    it('uses the first requested node workspace for subgraph nodes and edges', async () => {
      nodeFindUniqueMock.mockResolvedValueOnce({ workspace_id: 'workspace-1' });
      nodeFindManyMock.mockResolvedValueOnce([
        {
          id: 'node-1',
          workspace_id: 'workspace-1',
          type: 'document',
          label: 'Node 1',
          properties: {},
        },
      ]);

      await repository.subgraph(['node-1', 'foreign-node']);

      expect(nodeFindUniqueMock).toHaveBeenCalledWith({
        where: { id: 'node-1' },
        select: { workspace_id: true },
      });
      expect(nodeFindManyMock).toHaveBeenCalledWith({
        where: { id: { in: ['node-1', 'foreign-node'] }, workspace_id: 'workspace-1' },
      });
      expect(edgeFindManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ workspace_id: 'workspace-1' }),
        }),
      );
    });

    it('computes deterministic undirected connected components from scoped rows', async () => {
      nodeFindManyMock.mockResolvedValueOnce([{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]);
      edgeFindManyMock.mockResolvedValueOnce([
        { source_id: 'a', target_id: 'b' },
        { source_id: 'b', target_id: 'c' },
        { source_id: 'c', target_id: 'foreign-node' },
      ]);

      await expect(repository.connectedComponents('workspace-1')).resolves.toEqual([
        ['a', 'b', 'c'],
        ['d'],
      ]);
      expect(nodeFindManyMock).toHaveBeenCalledWith({
        where: { workspace_id: 'workspace-1' },
        select: { id: true },
        orderBy: { id: 'asc' },
      });
      expect(edgeFindManyMock).toHaveBeenCalledWith({
        where: { workspace_id: 'workspace-1' },
        select: { source_id: true, target_id: true },
      });
    });
  });

  describe('specialized traversal', () => {
    it('uses citation confidence and workspace-scoped recursive citations', async () => {
      await repository.citationPaths('workspace-1', 'knowledge', 'engineering_standard', 4);

      const query = captureQuery();
      expect(query.text).toContain('kc.confidence::double precision AS total_weight');
      expect(query.text).toContain('kc.workspace_id = ?');
      expect(query.text).toContain('target.workspace_id = kc.workspace_id');
      expect(query.text).not.toContain('weight as total_weight');
      expect(query.values).toEqual([
        'workspace-1',
        'knowledge',
        'workspace-1',
        4,
        'workspace-1',
        'engineering_standard',
      ]);
    });

    it('workspace-scopes dependency recursion and returned dependency edges', async () => {
      nodeFindUniqueMock.mockResolvedValueOnce({ workspace_id: 'workspace-1' });
      queryRawMock
        .mockResolvedValueOnce([{ node_id: 'upstream-node' }])
        .mockResolvedValueOnce([{ node_id: 'downstream-node' }]);

      await repository.dependencySubgraph('root-node', 'both', 3);

      expect(captureQuery(0).text).toContain('e.workspace_id = ?');
      expect(captureQuery(0).text).toContain('NOT e.source_id = ANY(u.path)');
      expect(captureQuery(1).text).toContain('e.workspace_id = ?');
      expect(captureQuery(1).text).toContain('NOT e.target_id = ANY(d.path)');
      expect(edgeFindManyMock).toHaveBeenCalledWith({
        where: {
          workspace_id: 'workspace-1',
          type: { in: ['depends_on', 'references', 'derived_from'] },
          AND: [
            { source_id: { in: ['upstream-node', 'root-node', 'downstream-node'] } },
            { target_id: { in: ['upstream-node', 'root-node', 'downstream-node'] } },
          ],
        },
      });
    });

    it('looks up semantic edge weights from bound JSONB and uses a numeric fallback', async () => {
      queryRawMock.mockResolvedValueOnce([{ node_id: 'related-node', score: '0.42' }]);

      await expect(repository.semanticExpansion('root-node', 2, { cites: 0.8 })).resolves.toEqual([
        { nodeId: 'related-node', score: 0.42 },
      ]);

      const query = captureQuery();
      expect(query.text).toContain('::jsonb ->> e.type');
      expect(query.text).toContain('::double precision');
      expect(query.text).toContain('e.workspace_id = source.workspace_id');
      expect(query.text).toContain('e.workspace_id = s.workspace_id');
      expect(query.text).toContain('NOT e.target_id = ANY(s.path)');
      expect(query.text).not.toContain('::float as cumulative_score');
      expect(query.values).toEqual(['{"cites":0.8}', 'root-node', '{"cites":0.8}', 2]);
    });
  });
});
