jest.mock('@xennic/database', () => ({
  prisma: {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { HybridSearchService } from './hybrid-search.service.js';

describe('HybridSearchService', () => {
  let service: HybridSearchService;

  const mockDocumentRepository = {
    findByWorkspace: jest.fn(),
  };

  const mockChunkRepository = {
    findByDocument: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HybridSearchService,
        { provide: 'IKnowledgeDocumentRepository', useValue: mockDocumentRepository },
        { provide: 'IKnowledgeChunkRepository', useValue: mockChunkRepository },
      ],
    }).compile();

    service = module.get<HybridSearchService>(HybridSearchService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty results when no documents found', async () => {
    mockDocumentRepository.findByWorkspace.mockResolvedValue({ data: [], total: 0 });
    mockChunkRepository.findByDocument.mockResolvedValue([]);

    const result = await service.search('test query', 'workspace-1');
    expect(result.results).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('should search documents and chunks with BM25 scoring', async () => {
    const mockDoc = {
      id: 'doc-1',
      workspaceId: 'workspace-1',
      documentType: 'pdf',
      classification: { standard: 'IEEE', equipmentType: 'transformer' },
      updatedAt: new Date(),
    };

    const mockChunk = {
      id: 'chunk-1',
      documentId: 'doc-1',
      text: 'This is a test document about transformers and electrical standards.',
      pageNumber: 1,
      section: 'Introduction',
    };

    mockDocumentRepository.findByWorkspace.mockResolvedValue({ data: [mockDoc], total: 1 });
    mockChunkRepository.findByDocument.mockResolvedValue([mockChunk]);

    const result = await service.search('transformer', 'workspace-1', { limit: 10 });
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].source).toBe('keyword');
  });
});
