const citationFindMany = jest.fn();
const nodeFindMany = jest.fn();
const nodeFindUnique = jest.fn();

jest.mock(
  '@xennic/database',
  () => ({
    prisma: {
      knowledge_citations: {
        findMany: citationFindMany,
      },
      knowledge_graph_nodes: {
        findMany: nodeFindMany,
        findUnique: nodeFindUnique,
      },
    },
  }),
  { virtual: true },
);

import { CitationRepository } from './citation.repository.js';

const citation = (overrides: Record<string, unknown> = {}) => ({
  id: 'citation-1',
  workspace_id: 'workspace-a',
  source_id: 'source-a',
  target_id: 'target-a',
  context: null,
  location: null,
  method: 'explicit',
  confidence: 1,
  created_at: new Date('2026-08-19T00:00:00.000Z'),
  ...overrides,
});

describe('CitationRepository workspace isolation', () => {
  let repository: CitationRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new CitationRepository();
  });

  it('requires the citation and both graph endpoints to belong to the requested workspace', async () => {
    citationFindMany.mockResolvedValue([
      citation(),
      citation({ id: 'foreign-target', target_id: 'target-b' }),
    ]);
    nodeFindMany.mockResolvedValue([{ id: 'source-a' }, { id: 'target-a' }]);

    const result = await repository.findBySource('source-a', 'explicit', 'workspace-a');

    expect(citationFindMany).toHaveBeenCalledWith({
      where: {
        source_id: 'source-a',
        method: 'explicit',
        workspace_id: 'workspace-a',
      },
      orderBy: { created_at: 'desc' },
    });
    expect(nodeFindMany).toHaveBeenCalledWith({
      where: {
        workspace_id: 'workspace-a',
        id: { in: ['source-a', 'target-a', 'target-b'] },
      },
      select: { id: true },
    });
    expect(result).toHaveLength(1);
    expect(result[0].targetId).toBe('target-a');
  });

  it('filters workspace-wide citation graph rows by endpoint ownership', async () => {
    citationFindMany.mockResolvedValue([
      citation(),
      citation({ id: 'foreign-source', source_id: 'source-b' }),
    ]);
    nodeFindMany.mockResolvedValue([{ id: 'source-a' }, { id: 'target-a' }]);

    const result = await repository.findByWorkspace('workspace-a');

    expect(citationFindMany).toHaveBeenCalledWith({
      where: { workspace_id: 'workspace-a' },
      orderBy: { created_at: 'desc' },
    });
    expect(result.map((item) => item.id)).toEqual(['citation-1']);
  });

  it('derives workspace scope from the source anchor when not provided', async () => {
    nodeFindUnique.mockResolvedValue({ workspace_id: 'workspace-a' });
    citationFindMany.mockResolvedValue([citation()]);
    nodeFindMany.mockResolvedValue([{ id: 'source-a' }, { id: 'target-a' }]);

    const result = await repository.findBySource('source-a');

    expect(nodeFindUnique).toHaveBeenCalledWith({
      where: { id: 'source-a' },
      select: { workspace_id: true },
    });
    expect(citationFindMany).toHaveBeenCalledWith({
      where: { source_id: 'source-a', workspace_id: 'workspace-a' },
      orderBy: { created_at: 'desc' },
    });
    expect(result).toHaveLength(1);
  });

  it('does not read citations when an unscoped anchor node is missing', async () => {
    nodeFindUnique.mockResolvedValue(null);

    await expect(repository.findByTarget('missing-target')).resolves.toEqual([]);
    expect(citationFindMany).not.toHaveBeenCalled();
    expect(nodeFindMany).not.toHaveBeenCalled();
  });
});
