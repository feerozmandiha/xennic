import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeGraphService } from '../application/services/knowledge-graph.service.js';

describe('KnowledgeGraphService', () => {
  let service: KnowledgeGraphService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KnowledgeGraphService],
    }).compile();
    service = module.get<KnowledgeGraphService>(KnowledgeGraphService);
  });

  it('returns null for missing node', async () => {
    const node = await service.getNode('nonexistent');
    expect(node).toBeNull();
  });

  it('expands relations with empty graph returns empty', async () => {
    const result = await service.expandRelations('n1');
    expect(result.nodes).toHaveLength(0);
  });

  it('shortest path returns null when no path exists', async () => {
    const path = await service.shortestPath('a', 'z');
    expect(path).toBeNull();
  });

  it('neighborhood search returns empty for missing node', async () => {
    const result = await service.neighborhoodSearch('nonexistent');
    expect(result.nodes).toHaveLength(0);
  });

  it('traverseByType returns empty', async () => {
    const nodes = await service.traverseByType('transformer');
    expect(nodes).toHaveLength(0);
  });

  it('semanticExpand returns empty', async () => {
    const result = await service.semanticExpand('nonexistent');
    expect(result.nodes).toHaveLength(0);
  });
});
