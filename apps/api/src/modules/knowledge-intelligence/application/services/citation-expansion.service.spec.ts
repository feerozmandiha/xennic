import { CitationExpansionService } from './citation-expansion.service.js';

describe('CitationExpansionService', () => {
  it('workspace-scopes every recursive citation lookup and does not revisit the source', async () => {
    const citationRepo = {
      findBySource: jest.fn(async (nodeId: string) => {
        if (nodeId === 'source-node') {
          return [{ targetId: 'middle-node', confidence: 0.8 }];
        }
        if (nodeId === 'middle-node') {
          return [
            { targetId: 'target-node', confidence: 0.5 },
            { targetId: 'source-node', confidence: 1 },
          ];
        }
        return [];
      }),
    };
    const service = new CitationExpansionService(citationRepo as any, {} as any);

    await expect(service.expand('workspace-1', 'source-node', 3)).resolves.toEqual([
      {
        targetId: 'middle-node',
        depth: 1,
        path: ['source-node', 'middle-node'],
        confidence: 0.8,
      },
      {
        targetId: 'target-node',
        depth: 2,
        path: ['source-node', 'middle-node', 'target-node'],
        confidence: 0.4,
      },
    ]);

    expect(citationRepo.findBySource).toHaveBeenNthCalledWith(
      1,
      'source-node',
      undefined,
      'workspace-1',
    );
    expect(citationRepo.findBySource).toHaveBeenNthCalledWith(
      2,
      'middle-node',
      undefined,
      'workspace-1',
    );
    expect(citationRepo.findBySource).toHaveBeenNthCalledWith(
      3,
      'target-node',
      undefined,
      'workspace-1',
    );
  });
});
