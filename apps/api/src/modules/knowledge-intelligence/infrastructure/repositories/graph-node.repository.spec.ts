const nodeFindFirst = jest.fn();
const nodeFindMany = jest.fn();
const nodeDeleteMany = jest.fn();
const citationDeleteMany = jest.fn();

const transactionClient = {
  knowledge_graph_nodes: {
    findMany: nodeFindMany,
    deleteMany: nodeDeleteMany,
  },
  knowledge_citations: {
    deleteMany: citationDeleteMany,
  },
};
const transaction = jest.fn(async (operation: (client: typeof transactionClient) => unknown) =>
  operation(transactionClient),
);

jest.mock(
  '@xennic/database',
  () => ({
    prisma: {
      knowledge_graph_nodes: {
        findFirst: nodeFindFirst,
      },
      $transaction: transaction,
    },
  }),
  { virtual: true },
);

import { GraphNodeRepository } from './graph-node.repository.js';

describe('GraphNodeRepository workspace isolation', () => {
  let repository: GraphNodeRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new GraphNodeRepository();
  });

  it('scopes entity lookup to the requested workspace', async () => {
    nodeFindFirst.mockResolvedValue({
      id: 'node-a',
      workspace_id: 'workspace-a',
      type: 'document',
      entity_type: 'knowledge',
      entity_id: 'article-a',
      label: 'Article',
      properties: {},
      embedding_id: null,
      created_at: new Date('2026-08-19T00:00:00.000Z'),
      updated_at: new Date('2026-08-19T00:00:00.000Z'),
    });

    const result = await repository.findByEntity('knowledge', 'article-a', 'workspace-a');

    expect(nodeFindFirst).toHaveBeenCalledWith({
      where: {
        entity_type: 'knowledge',
        entity_id: 'article-a',
        workspace_id: 'workspace-a',
      },
    });
    expect(result?.workspaceId).toBe('workspace-a');
  });

  it('transactionally removes workspace-owned citations before graph projections', async () => {
    nodeFindMany.mockResolvedValue([{ id: 'node-a' }]);
    citationDeleteMany.mockResolvedValue({ count: 2 });
    nodeDeleteMany.mockResolvedValue({ count: 1 });

    await repository.deleteByEntity('knowledge', 'article-a', 'workspace-a');

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(nodeFindMany).toHaveBeenCalledWith({
      where: {
        entity_type: 'knowledge',
        entity_id: 'article-a',
        workspace_id: 'workspace-a',
      },
      select: { id: true },
    });
    expect(citationDeleteMany).toHaveBeenCalledWith({
      where: {
        workspace_id: 'workspace-a',
        OR: [{ source_id: { in: ['node-a'] } }, { target_id: { in: ['node-a'] } }],
      },
    });
    expect(nodeDeleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['node-a'] },
        workspace_id: 'workspace-a',
      },
    });
  });

  it('does not issue deletes when the scoped projection is absent', async () => {
    nodeFindMany.mockResolvedValue([]);

    await repository.deleteByEntity('knowledge', 'missing', 'workspace-a');

    expect(citationDeleteMany).not.toHaveBeenCalled();
    expect(nodeDeleteMany).not.toHaveBeenCalled();
  });
});
