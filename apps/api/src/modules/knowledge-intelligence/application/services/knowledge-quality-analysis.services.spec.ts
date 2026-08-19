import { KnowledgeGraphNode } from '../../domain/entities/graph-node.entity.js';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';
import { KnowledgeCompletenessService } from './knowledge-completeness.service.js';
import { KnowledgeFreshnessService } from './knowledge-freshness.service.js';

function graphNode(
  id: string,
  data: {
    label?: string | null;
    properties?: Record<string, unknown>;
    embeddingId?: string | null;
    updatedAt?: Date;
  } = {},
): KnowledgeGraphNode {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  return KnowledgeGraphNode.reconstitute({
    id,
    workspaceId: 'workspace-1',
    type: 'concept',
    entityType: 'knowledge',
    entityId: `article-${id}`,
    label: data.label ?? null,
    properties: data.properties ?? {},
    embeddingId: data.embeddingId ?? null,
    createdAt,
    updatedAt: data.updatedAt ?? createdAt,
  });
}

function nodeRepository(
  nodes: KnowledgeGraphNode[],
): jest.Mocked<Pick<IGraphNodeRepository, 'findById' | 'findAllByWorkspace'>> {
  return {
    findById: jest.fn(async (id: string) => nodes.find((node) => node.id === id) ?? null),
    findAllByWorkspace: jest.fn(async () => ({ nodes, total: nodes.length })),
  };
}

describe('read-only Knowledge quality analysis', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('calculates workspace completeness directly from scoped nodes', async () => {
    const repository = nodeRepository([
      graphNode('complete', {
        label: 'Complete node',
        properties: { a: 1, b: 2, c: 3, d: 4, e: 5 },
        embeddingId: 'embedding-1',
      }),
      graphNode('incomplete', { label: 'Incomplete node' }),
    ]);
    const service = new KnowledgeCompletenessService(repository as IGraphNodeRepository);

    await expect(service.analyzeWorkspaceCompleteness('workspace-1')).resolves.toEqual({
      average: 0.65,
      nodes: 2,
      completeNodes: 1,
      incompleteNodes: 1,
    });
    expect(repository.findAllByWorkspace).toHaveBeenCalledWith('workspace-1');
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('returns a zero completeness report for an empty workspace', async () => {
    const repository = nodeRepository([]);
    const service = new KnowledgeCompletenessService(repository as IGraphNodeRepository);

    await expect(service.analyzeWorkspaceCompleteness('workspace-1')).resolves.toEqual({
      average: 0,
      nodes: 0,
      completeNodes: 0,
      incompleteNodes: 0,
    });
  });

  it('analyzes staleness without writing derived metrics during a read', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-19T00:00:00.000Z'));
    const repository = nodeRepository([
      graphNode('stale', { updatedAt: new Date('2026-07-05T00:00:00.000Z') }),
      graphNode('future', { updatedAt: new Date('2026-08-20T00:00:00.000Z') }),
    ]);
    const service = new KnowledgeFreshnessService(repository as IGraphNodeRepository);

    await expect(service.analyzeWorkspaceFreshness('workspace-1', 30)).resolves.toEqual([
      { nodeId: 'stale', stale: true, daysSinceUpdate: 45 },
      { nodeId: 'future', stale: false, daysSinceUpdate: 0 },
    ]);
    expect(repository.findAllByWorkspace).toHaveBeenCalledWith('workspace-1');
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('keeps per-node freshness calculation available to lifecycle projections', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-19T00:00:00.000Z'));
    const repository = nodeRepository([
      graphNode('node-1', { updatedAt: new Date('2026-07-05T00:00:00.000Z') }),
    ]);
    const service = new KnowledgeFreshnessService(repository as IGraphNodeRepository);

    await expect(service.calculateFreshness('node-1')).resolves.toBe(0.7);
  });
});
