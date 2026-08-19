const nodeFindUniqueMock = jest.fn();
const edgeFindFirstMock = jest.fn();
const edgeFindManyMock = jest.fn();

jest.mock(
  '@xennic/database',
  () => ({
    prisma: {
      knowledge_graph_nodes: { findUnique: nodeFindUniqueMock },
      knowledge_graph_edges: {
        findFirst: edgeFindFirstMock,
        findMany: edgeFindManyMock,
      },
    },
  }),
  { virtual: true },
);

import { GraphEdgeRepository } from './graph-edge.repository.js';

describe('GraphEdgeRepository workspace-scoped reads', () => {
  let repository: GraphEdgeRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    nodeFindUniqueMock.mockResolvedValue({ workspace_id: 'workspace-1' });
    edgeFindFirstMock.mockResolvedValue(null);
    edgeFindManyMock.mockResolvedValue([]);
    repository = new GraphEdgeRepository();
  });

  it('derives the source workspace and restricts edges and targets to it', async () => {
    await repository.findAllBySource('source-node', 'references');

    expect(nodeFindUniqueMock).toHaveBeenCalledWith({
      where: { id: 'source-node' },
      select: { workspace_id: true },
    });
    expect(edgeFindManyMock).toHaveBeenCalledWith({
      where: {
        source_id: 'source-node',
        workspace_id: 'workspace-1',
        target: { workspace_id: 'workspace-1' },
        type: 'references',
      },
      orderBy: { weight: 'desc' },
    });
  });

  it('uses an explicit target workspace without another node lookup', async () => {
    await repository.findAllByTarget('target-node', undefined, 'workspace-1');

    expect(nodeFindUniqueMock).not.toHaveBeenCalled();
    expect(edgeFindManyMock).toHaveBeenCalledWith({
      where: {
        target_id: 'target-node',
        workspace_id: 'workspace-1',
        source: { workspace_id: 'workspace-1' },
      },
      orderBy: { weight: 'desc' },
    });
  });

  it('returns no edges when the anchor node does not exist', async () => {
    nodeFindUniqueMock.mockResolvedValueOnce(null);

    await expect(repository.findAllBySource('missing-node')).resolves.toEqual([]);
    expect(edgeFindManyMock).not.toHaveBeenCalled();
  });

  it('requires both endpoints to belong to a workspace-wide edge query', async () => {
    await repository.findAllByWorkspace('workspace-1', 'depends_on');

    expect(edgeFindManyMock).toHaveBeenCalledWith({
      where: {
        workspace_id: 'workspace-1',
        source: { workspace_id: 'workspace-1' },
        target: { workspace_id: 'workspace-1' },
        type: 'depends_on',
      },
    });
  });

  it('scopes an edge lookup by both endpoint ownership and edge workspace', async () => {
    await repository.findByNodes('source-node', 'target-node', 'cites');

    expect(edgeFindFirstMock).toHaveBeenCalledWith({
      where: {
        source_id: 'source-node',
        target_id: 'target-node',
        type: 'cites',
        workspace_id: 'workspace-1',
        target: { workspace_id: 'workspace-1' },
      },
    });
  });
});
