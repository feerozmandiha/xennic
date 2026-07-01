jest.mock('@xennic/database', () => ({
  prisma: {
    $queryRawUnsafe: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../../modules/knowledge-factory/application/services/fulltext-search.service.js', () => ({
  FullTextSearchService: class MockFts {
    search = jest.fn().mockResolvedValue({ items: [], total: 0 });
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { HybridRetrievalService } from '../application/services/hybrid-retrieval.service.js';
import { FullTextSearchService } from '../../../modules/knowledge-factory/application/services/fulltext-search.service.js';
import type { IQdrantAdapter } from '../../../modules/knowledge-factory/domain/interfaces/qdrant-adapter.interface.js';

describe('HybridRetrievalService', () => {
  let service: HybridRetrievalService;
  let qdrantMock: jest.Mocked<IQdrantAdapter>;
  let ftsMock: jest.Mocked<FullTextSearchService>;

  beforeEach(async () => {
    qdrantMock = {
      ensureCollection: jest.fn(),
      upsertVector: jest.fn(),
      batchInsert: jest.fn(),
      deleteVector: jest.fn(),
      deleteVectors: jest.fn(),
      search: jest.fn().mockResolvedValue([
        { id: 'chunk-1', score: 0.85, payload: { text: 'test dense', knowledgeObjectId: 'ko-1', title: 'Doc 1', xid: 'XID-1', tier: 'silver', language: 'en', version: 1, status: 'active', authorityScore: 0.9 } },
        { id: 'chunk-2', score: 0.72, payload: { text: 'test dense 2', knowledgeObjectId: 'ko-1', title: 'Doc 1', xid: 'XID-1', tier: 'gold', language: 'en', version: 1, status: 'active', authorityScore: 0.95 } },
      ]),
    } as any;
    ftsMock = {
      search: jest.fn().mockResolvedValue({
        items: [
          { id: 'chunk-2', xid: 'XID-1', title: 'Doc 1', rank: 0.9, highlight: 'test sparse' },
          { id: 'chunk-3', xid: 'XID-2', title: 'Doc 2', rank: 0.6 },
        ],
        total: 2,
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HybridRetrievalService,
        { provide: 'IQdrantAdapter', useValue: qdrantMock },
        { provide: FullTextSearchService, useValue: ftsMock },
        { provide: 'IOntologyRepository', useValue: { findEntityByLabel: jest.fn() } },
        { provide: 'ITaxonomyRepository', useValue: { getByLevel: jest.fn() } },
      ],
    }).compile();
    service = module.get<HybridRetrievalService>(HybridRetrievalService);
  });

  it('retrieve performs hybrid search with RRF fusion', async () => {
    const results = await service.retrieve({ question: 'test', workspaceId: 'ws-1' }, { topK: 3 });
    expect(results).toHaveLength(3);
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    expect(results[0].denseScore).toBeDefined();
    expect(results[0].sparseScore).toBeDefined();
  });

  it('denseSearch calls qdrant and maps results', async () => {
    const results = await service.denseSearch({ question: 'test', workspaceId: 'ws-1' });
    expect(qdrantMock.search).toHaveBeenCalledWith('ws-1', expect.any(Array), undefined, 20);
    expect(results).toHaveLength(2);
    expect(results[0].chunkId).toBe('chunk-1');
  });

  it('sparseSearch calls FTS and maps results', async () => {
    const results = await service.sparseSearch({ question: 'test', workspaceId: 'ws-1' });
    expect(ftsMock.search).toHaveBeenCalledWith('ws-1', 'test', 20, 0);
    expect(results).toHaveLength(2);
  });

  it('fuseResults combines dense and sparse via RRF', () => {
    const dense = [
      { chunkId: 'a', knowledgeObjectId: 'ko-1', content: 'a', score: 1, metadata: { title: '', xid: '', tier: 'bronze' as any, language: 'en', version: 1, status: 'active' as any, authorityScore: 0, taxonomy: [], ontology: [] } },
      { chunkId: 'b', knowledgeObjectId: 'ko-1', content: 'b', score: 0.5, metadata: { title: '', xid: '', tier: 'bronze' as any, language: 'en', version: 1, status: 'active' as any, authorityScore: 0, taxonomy: [], ontology: [] } },
    ];
    const sparse = [
      { chunkId: 'b', knowledgeObjectId: 'ko-1', content: 'b', score: 1, metadata: { title: '', xid: '', tier: 'bronze' as any, language: 'en', version: 1, status: 'active' as any, authorityScore: 0, taxonomy: [], ontology: [] } },
      { chunkId: 'c', knowledgeObjectId: 'ko-1', content: 'c', score: 0.3, metadata: { title: '', xid: '', tier: 'bronze' as any, language: 'en', version: 1, status: 'active' as any, authorityScore: 0, taxonomy: [], ontology: [] } },
    ];
    const fused = service.fuseResults(dense, sparse, { rrfK: 60, denseWeight: 0.5, sparseWeight: 0.5 });
    expect(fused).toHaveLength(3);
    expect(fused[0].score).toBeGreaterThanOrEqual(fused[1].score);
    expect(fused[0].chunkId).toBe('b');
  });

  it('filters by tier when provided', async () => {
    await service.denseSearch({ question: 'test', workspaceId: 'ws-1', filters: { tiers: ['gold'] } });
    expect(qdrantMock.search).toHaveBeenCalled();
    const filterArg = (qdrantMock.search as jest.Mock).mock.calls[0][2];
    expect(filterArg.must[0].match.value).toBe('gold');
  });

  it('filters by language when provided', async () => {
    await service.denseSearch({ question: 'test', workspaceId: 'ws-1', filters: { languages: ['fa'] } });
    const filterArg = (qdrantMock.search as jest.Mock).mock.calls[0][2];
    expect(filterArg.must[0].match.value).toBe('fa');
  });

  it('filters by versionStatus when provided', async () => {
    await service.denseSearch({ question: 'test', workspaceId: 'ws-1', filters: { versionStatus: 'active' } });
    const filterArg = (qdrantMock.search as jest.Mock).mock.calls[0][2];
    expect(filterArg.must[0].match.value).toBe('active');
  });

  it('filters by minAuthorityScore when provided', async () => {
    await service.denseSearch({ question: 'test', workspaceId: 'ws-1', filters: { minAuthorityScore: 0.5 } });
    const filterArg = (qdrantMock.search as jest.Mock).mock.calls[0][2];
    expect(filterArg.must[0].range.gte).toBe(0.5);
  });

  it('returns empty for no results', async () => {
    qdrantMock.search.mockResolvedValue([]);
    ftsMock.search.mockResolvedValue({ items: [], total: 0 });
    const results = await service.retrieve({ question: 'no results', workspaceId: 'ws-1' });
    expect(results).toHaveLength(0);
  });

  it('uses workspace isolation in search', async () => {
    await service.retrieve({ question: 'test', workspaceId: 'ws-2' });
    expect(qdrantMock.search).toHaveBeenCalledWith('ws-2', expect.any(Array), undefined, 20);
    expect(ftsMock.search).toHaveBeenCalledWith('ws-2', 'test', 20, 0);
  });
});
