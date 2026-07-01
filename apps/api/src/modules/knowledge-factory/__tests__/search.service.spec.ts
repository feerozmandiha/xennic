import { Test, TestingModule } from '@nestjs/testing';
import {
  SearchService,
  EMBEDDING_SERVICE,
  QDRANT_SERVICE,
  SEARCH_REPOSITORY,
} from '../application/services/search.service.js';
import type { IEmbeddingService, IQdrantService, ISearchRepository, KeywordSearchResult } from '../application/services/search.service.js';

const WS_ID = 'ws-test-001';
const QUERY = 'voltage drop calculation';

function makeQdrantResult(overrides?: Partial<{ chunkId: string; score: number; payload: Record<string, unknown> }>) {
  return {
    chunkId: 'chunk-001',
    score: 0.92,
    payload: {
      documentId: 'doc-001',
      documentName: 'cable-sizing-guide.pdf',
      content: 'The voltage drop shall not exceed 3% for lighting circuits.',
      sourceType: 'pdf',
      pageNumber: 5,
    },
    ...overrides,
  };
}

function makeKeywordResult(overrides?: Partial<KeywordSearchResult>): KeywordSearchResult {
  return {
    id: 'chunk-002',
    documentId: 'doc-002',
    documentName: 'iec-60364-5-52.pdf',
    excerpt: 'Voltage drop calculations according to IEC 60364-5-52.',
    score: 0.65,
    metadata: { sourceType: 'standard' },
    sourceType: 'standard',
    ...overrides,
  };
}

describe('SearchService', () => {
  let service: SearchService;
  let embeddingService: jest.Mocked<IEmbeddingService>;
  let qdrantService: jest.Mocked<IQdrantService>;
  let searchRepository: jest.Mocked<ISearchRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: EMBEDDING_SERVICE,
          useValue: { generateEmbedding: jest.fn() },
        },
        {
          provide: QDRANT_SERVICE,
          useValue: { search: jest.fn() },
        },
        {
          provide: SEARCH_REPOSITORY,
          useValue: { keywordSearch: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    embeddingService = module.get(EMBEDDING_SERVICE) as jest.Mocked<IEmbeddingService>;
    qdrantService = module.get(QDRANT_SERVICE) as jest.Mocked<IQdrantService>;
    searchRepository = module.get(SEARCH_REPOSITORY) as jest.Mocked<ISearchRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should return search results with citations', async () => {
      embeddingService.generateEmbedding.mockResolvedValue(new Array(1536).fill(0.1));
      qdrantService.search.mockResolvedValue([makeQdrantResult()]);
      searchRepository.keywordSearch.mockResolvedValue([]);

      const result = await service.search(WS_ID, QUERY);

      expect(result.query).toBe(QUERY);
      expect(result.results).toHaveLength(1);
      expect(result.took).toBeGreaterThanOrEqual(0);
      expect(result.total).toBe(1);

      const item = result.results[0];
      expect(item.chunkId).toBe('chunk-001');
      expect(item.documentName).toBe('cable-sizing-guide.pdf');
      expect(item.citation).toBeDefined();
      expect(item.citation.sourceDocumentName).toBe('cable-sizing-guide.pdf');
      expect(item.citation.relevanceScore).toBeGreaterThan(0);
    });

    it('should merge vector and keyword results using RRF', async () => {
      embeddingService.generateEmbedding.mockResolvedValue(new Array(1536).fill(0.1));
      qdrantService.search.mockResolvedValue([
        makeQdrantResult({ chunkId: 'chunk-a', score: 0.9 }),
      ]);
      searchRepository.keywordSearch.mockResolvedValue([
        makeKeywordResult({ id: 'chunk-b', sourceType: 'standard' }),
      ]);

      const result = await service.search(WS_ID, QUERY);

      expect(result.results.length).toBeGreaterThanOrEqual(1);
      const chunkIds = result.results.map(r => r.chunkId);
      expect(chunkIds).toContain('chunk-a');
    });

    it('should respect limit and offset', async () => {
      embeddingService.generateEmbedding.mockResolvedValue(new Array(1536).fill(0.1));

      const vectorResults = Array.from({ length: 5 }, (_, i) =>
        makeQdrantResult({ chunkId: `chunk-${i}`, score: 0.8 - i * 0.1 }),
      );
      qdrantService.search.mockResolvedValue(vectorResults);
      searchRepository.keywordSearch.mockResolvedValue([]);

      const result = await service.search(WS_ID, QUERY, { limit: 2, offset: 1 });

      expect(result.results.length).toBeLessThanOrEqual(2);
    });

    it('should filter results below minScore', async () => {
      embeddingService.generateEmbedding.mockResolvedValue(new Array(1536).fill(0.1));
      qdrantService.search.mockResolvedValue([
        makeQdrantResult({ chunkId: 'high', score: 0.8 }),
        makeQdrantResult({ chunkId: 'low', score: 0.2 }),
      ]);
      searchRepository.keywordSearch.mockResolvedValue([]);

      const result = await service.search(WS_ID, QUERY, { minScore: 0.0165 });

      const ids = result.results.map(r => r.chunkId);
      expect(ids).toContain('high');
      expect(ids).not.toContain('low');
    });

    it('should generate confidence scores in 0-1 range', async () => {
      embeddingService.generateEmbedding.mockResolvedValue(new Array(1536).fill(0.1));
      qdrantService.search.mockResolvedValue([
        makeQdrantResult({ chunkId: 'c1', score: 0.95 }),
        makeQdrantResult({ chunkId: 'c2', score: 0.5 }),
        makeQdrantResult({ chunkId: 'c3', score: 0.05 }),
      ]);
      searchRepository.keywordSearch.mockResolvedValue([]);

      const result = await service.search(WS_ID, QUERY);

      for (const item of result.results) {
        expect(item.confidence).toBeGreaterThanOrEqual(0);
        expect(item.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should generate citations with excerpts', async () => {
      embeddingService.generateEmbedding.mockResolvedValue(new Array(1536).fill(0.1));
      qdrantService.search.mockResolvedValue([makeQdrantResult()]);
      searchRepository.keywordSearch.mockResolvedValue([]);

      const result = await service.search(WS_ID, QUERY);

      const citation = result.results[0].citation;
      expect(citation.sourceDocumentName).toBe('cable-sizing-guide.pdf');
      expect(citation.chunkTextExcerpt).toBeTruthy();
      expect(citation.pageReference).toBe('5');
      expect(typeof citation.relevanceScore).toBe('number');
    });
  });
});
