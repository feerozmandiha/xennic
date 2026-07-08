import { Test, TestingModule } from '@nestjs/testing';
import { ContentNormalizerService } from './content-normalizer.service.js';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import type { IKnowledgeChunkRepository } from '../../domain/interfaces/knowledge-chunk.repository.interface.js';
import { KnowledgeDocument } from '../../domain/entities/knowledge-document.entity.js';
import { KnowledgeDocumentChunk } from '../../domain/entities/knowledge-document-chunk.entity.js';

const DOCUMENT_ID = 'doc-123';
const WORKSPACE_ID = 'ws-456';

function makeDocument(overrides?: Partial<KnowledgeDocument>): KnowledgeDocument {
  return KnowledgeDocument.reconstitute({
    id: DOCUMENT_ID,
    workspaceId: WORKSPACE_ID,
    filename: 'test.pdf',
    originalName: 'Test Document.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1024,
    storagePath: '/path/to/test.pdf',
    documentType: 'pdf',
    status: 'extracted',
    classification: {},
    metadata: {},
    errorMessage: null,
    retryCount: 0,
    publishedKnowledgeId: null,
    createdBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

function makeChunk(overrides?: Partial<KnowledgeDocumentChunk>): KnowledgeDocumentChunk {
  return KnowledgeDocumentChunk.create({
    documentId: DOCUMENT_ID,
    chunkIndex: 0,
    text: 'Test chunk content',
    tokenCount: 10,
    pageNumber: 1,
    section: null,
    metadata: {},
    ...overrides,
  });
}

describe('ContentNormalizerService', () => {
  let service: ContentNormalizerService;
  let documentRepository: jest.Mocked<IKnowledgeDocumentRepository>;
  let chunkRepository: jest.Mocked<IKnowledgeChunkRepository>;
  let cleanText: (text: string) => string;
  let estimateTokens: (text: string) => number;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentNormalizerService,
        {
          provide: 'IKnowledgeDocumentRepository',
          useValue: {
            findById: jest.fn(),
            findByIds: jest.fn(),
            findByWorkspace: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            findFailed: jest.fn(),
            countByStatus: jest.fn(),
            classifyDocument: jest.fn(),
            publishDocument: jest.fn(),
            failDocument: jest.fn(),
            retryDocument: jest.fn(),
          },
        },
        {
          provide: 'IKnowledgeChunkRepository',
          useValue: {
            create: jest.fn(),
            createBatch: jest.fn(),
            findByDocument: jest.fn(),
            findByIds: jest.fn(),
            linkEmbedding: jest.fn(),
            deleteByDocument: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ContentNormalizerService>(ContentNormalizerService);
    documentRepository = module.get('IKnowledgeDocumentRepository') as jest.Mocked<IKnowledgeDocumentRepository>;
    chunkRepository = module.get('IKnowledgeChunkRepository') as jest.Mocked<IKnowledgeChunkRepository>;

    cleanText = (service as unknown as { cleanText: (text: string) => string }).cleanText.bind(service);
    estimateTokens = (service as unknown as { estimateTokens: (text: string) => number }).estimateTokens.bind(service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('cleanText', () => {
    it('should replace multiple spaces with single space', () => {
      const result = cleanText('This   has    multiple     spaces');

      expect(result).toBe('This has multiple spaces');
    });

    it('should remove non-printable characters', () => {
      const result = cleanText('Text with\x00binary\x01chars');

      expect(result).toBe('Text withbinarychars');
    });

    it('should collapse multiple newlines to double newline', () => {
      const result = cleanText('Line1\n\n\n\nLine2\n\n\n\n\nLine3');

      expect(result).toBe('Line1\n\nLine2\n\nLine3');
    });

    it('should trim leading and trailing whitespace', () => {
      const result = cleanText('   trimmed text   ');

      expect(result).toBe('trimmed text');
    });

    it('should preserve single newlines', () => {
      const result = cleanText('Line1\nLine2\nLine3');

      expect(result).toBe('Line1\nLine2\nLine3');
    });

    it('should handle empty string', () => {
      const result = cleanText('');

      expect(result).toBe('');
    });

    it('should handle string with only whitespace', () => {
      const result = cleanText('   \n\n  ');

      expect(result).toBe('');
    });
  });

  describe('estimateTokens', () => {
    it('should return 0 for empty string', () => {
      const result = estimateTokens('');

      expect(result).toBe(0);
    });

    it('should return 0 for null/undefined', () => {
      expect(estimateTokens(null as unknown as string)).toBe(0);
      expect(estimateTokens(undefined as unknown as string)).toBe(0);
    });

    it('should estimate tokens as text length divided by 4', () => {
      const result = estimateTokens('test');

      expect(result).toBe(1); // Math.round(4/4) = 1
    });

    it('should estimate tokens for longer text', () => {
      const text = 'This is a longer text string to estimate tokens';
      const result = estimateTokens(text);

      expect(result).toBe(Math.round(text.length / 4));
    });

    it('should return at least 1 for non-empty text', () => {
      const result = estimateTokens('a');

      expect(result).toBe(1);
    });
  });

  describe('normalizeDocument', () => {
    it('should throw error when document not found', async () => {
      documentRepository.findById.mockResolvedValue(null);

      await expect(service.normalizeDocument(DOCUMENT_ID)).rejects.toThrow(
        `Document ${DOCUMENT_ID} not found`,
      );
    });

    it('should return document stats with zero chunks', async () => {
      documentRepository.findById.mockResolvedValue(makeDocument());

      const result = await service.normalizeDocument(DOCUMENT_ID);

      expect(result.totalPages).toBe(0);
      expect(result.totalChunks).toBe(0);
      expect(result.totalTokens).toBe(0);
      expect(result.averageChunkSize).toBe(0);
      expect(result.compressionRatio).toBe(0);
    });
  });

  describe('deduplicateChunks', () => {
    it('should return 0 when no chunks exist', async () => {
      chunkRepository.findByDocument.mockResolvedValue([]);

      const result = await service.deduplicateChunks(DOCUMENT_ID);

      expect(result).toBe(0);
      expect(chunkRepository.deleteByDocument).not.toHaveBeenCalled();
    });

    it('should not remove unique chunks', async () => {
      const chunks = [
        makeChunk({ text: 'First unique chunk' }),
        makeChunk({ text: 'Second unique chunk' }),
        makeChunk({ text: 'Third unique chunk' }),
      ];
      chunkRepository.findByDocument.mockResolvedValue(chunks);

      const result = await service.deduplicateChunks(DOCUMENT_ID);

      expect(result).toBe(0);
      expect(chunkRepository.deleteByDocument).not.toHaveBeenCalled();
    });

    it('should remove duplicate chunks (case-insensitive)', async () => {
      const chunks = [
        makeChunk({ text: 'Duplicate content' }),
        makeChunk({ text: '  duplicate CONTENT  ' }),
      ];
      chunkRepository.findByDocument.mockResolvedValue(chunks);

      const result = await service.deduplicateChunks(DOCUMENT_ID);

      expect(result).toBe(1);
      expect(chunkRepository.deleteByDocument).toHaveBeenCalledWith(DOCUMENT_ID);
    });

    it('should handle multiple duplicates', async () => {
      const chunks = [
        makeChunk({ text: 'Chunk one' }),
        makeChunk({ text: 'Chunk one' }),
        makeChunk({ text: 'Chunk two' }),
        makeChunk({ text: 'Chunk two' }),
      ];
      chunkRepository.findByDocument.mockResolvedValue(chunks);

      const result = await service.deduplicateChunks(DOCUMENT_ID);

      expect(result).toBe(2);
      expect(chunkRepository.deleteByDocument).toHaveBeenCalledTimes(2);
    });
  });
});