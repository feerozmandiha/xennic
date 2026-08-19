import { GraphSearchService } from './graph-search.service.js';

function graphNode(id: string, label: string, properties: Record<string, unknown> = {}) {
  return {
    id,
    label,
    type: 'concept',
    entityType: 'knowledge',
    entityId: `article-${id}`,
    properties,
  };
}

describe('GraphSearchService', () => {
  it('returns only text-matching workspace nodes and keeps ranking scores bounded', async () => {
    const nodes = [
      graphNode('exact-match', 'Arc flash protection'),
      graphNode('property-match', 'Electrical safety', { standard: 'IEC Arc requirements' }),
      graphNode('unrelated', 'Hydraulic pump'),
    ];
    const traversalRepo = {
      neighbors: jest.fn(async (nodeId: string) =>
        nodeId === 'property-match' ? Array.from({ length: 40 }, () => ({})) : [],
      ),
    };
    const citationRepo = {
      findBySource: jest.fn(async (nodeId: string) =>
        nodeId === 'property-match' ? Array.from({ length: 20 }, () => ({})) : [],
      ),
    };
    const metricsRepo = {
      findByNodeId: jest.fn(async (nodeId: string) =>
        nodeId === 'property-match' ? { compositeScore: () => 4 } : null,
      ),
    };
    const nodeRepo = {
      findAllByWorkspace: jest.fn().mockResolvedValue({ nodes, total: nodes.length }),
    };
    const service = new GraphSearchService(
      traversalRepo as any,
      nodeRepo as any,
      {} as any,
      citationRepo as any,
      {} as any,
      metricsRepo as any,
    );

    const results = await service.semanticSearch('workspace-1', '  ARC flash  ');

    expect(nodeRepo.findAllByWorkspace).toHaveBeenCalledWith('workspace-1', undefined, 0, 100);
    expect(results.map((result) => result.id)).toEqual(['exact-match', 'property-match']);
    expect(results.every((result) => result.score > 0 && result.score <= 1)).toBe(true);
    expect(traversalRepo.neighbors).not.toHaveBeenCalledWith('unrelated', 'both', undefined);
    expect(citationRepo.findBySource).toHaveBeenCalledWith(
      'property-match',
      undefined,
      'workspace-1',
    );
  });

  it('does not treat punctuation-only input as a match-all query', async () => {
    const nodeRepo = { findAllByWorkspace: jest.fn() };
    const service = new GraphSearchService(
      {} as any,
      nodeRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await expect(service.semanticSearch('workspace-1', '...')).resolves.toEqual([]);
    expect(nodeRepo.findAllByWorkspace).not.toHaveBeenCalled();
  });
});
