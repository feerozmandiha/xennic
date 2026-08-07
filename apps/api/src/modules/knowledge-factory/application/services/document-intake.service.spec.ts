import { Test, TestingModule } from '@nestjs/testing';
import { DocumentIntakeService } from './document-intake.service.js';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import type { IKnowledgeChunkRepository } from '../../domain/interfaces/knowledge-chunk.repository.interface.js';
import type { IExtractionRepository } from '../../domain/interfaces/extraction.repository.interface.js';
import type { IPipelineRunRepository } from '../../domain/interfaces/pipeline-run.repository.interface.js';
import type { EmbeddingGateway } from '../../domain/interfaces/embedding-gateway.interface.js';
import type { IStorageService } from '../../domain/interfaces/storage-service.interface.js';
import { KnowledgeDocument } from '../../domain/entities/knowledge-document.entity.js';

const WORKSPACE_ID = 'ws-test-123';
const TEST_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('DocumentIntakeService', () => {
  let service: DocumentIntakeService;
  let storageService: jest.Mocked<IStorageService>;
  let documentRepository: jest.Mocked<IKnowledgeDocumentRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentIntakeService,
        {
          provide: 'IStorageService',
          useValue: {
            upload: jest.fn().mockResolvedValue('workspaces/ws-test-123/uuid-test.pdf'),
            download: jest.fn(),
            delete: jest.fn(),
            exists: jest.fn(),
          },
        },
        {
          provide: 'IKnowledgeDocumentRepository',
          useValue: {
            findById: jest.fn(),
            findByIds: jest.fn(),
            findByWorkspace: jest.fn(),
            create: jest.fn().mockImplementation((doc: KnowledgeDocument) => Promise.resolve(doc)),
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
        {
          provide: 'IExtractionRepository',
          useValue: {
            create: jest.fn(),
            findByDocument: jest.fn(),
            findLatestByDocument: jest.fn(),
          },
        },
        {
          provide: 'IPipelineRunRepository',
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByDocument: jest.fn(),
            findRunningByStage: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: 'EmbeddingGateway',
          useValue: {
            embedText: jest.fn(),
            embedBatch: jest.fn(),
            isHealthy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentIntakeService>(DocumentIntakeService);
    storageService = module.get('IStorageService') as jest.Mocked<IStorageService>;
    documentRepository = module.get(
      'IKnowledgeDocumentRepository',
    ) as jest.Mocked<IKnowledgeDocumentRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerDocument', () => {
    const validInput = {
      workspaceId: WORKSPACE_ID,
      filename: 'test.pdf',
      originalName: 'Test Document.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
      buffer: Buffer.from('pdf content'),
      contentType: 'application/pdf',
      createdBy: 'user-1',
      metadata: { source: 'test' },
    };

    it('should upload buffer to storage service', async () => {
      const doc = await service.registerDocument(validInput);

      expect(storageService.upload).toHaveBeenCalledWith(
        validInput.buffer,
        expect.stringMatching(/^workspaces\/ws-test-123\//),
        validInput.contentType,
      );
      expect(doc).toBeDefined();
      expect(doc.storagePath).toMatch(/^workspaces\/ws-test-123\//);
    });

    it('should create a KnowledgeDocument with correct fields', async () => {
      const doc = await service.registerDocument(validInput);

      expect(doc.workspaceId).toBe(WORKSPACE_ID);
      expect(doc.filename).toBe('test.pdf');
      expect(doc.originalName).toBe('Test Document.pdf');
      expect(doc.mimeType).toBe('application/pdf');
      expect(doc.sizeBytes).toBe(1024);
      expect(doc.createdBy).toBe('user-1');
      expect(doc.storagePath).toBeTruthy();
    });

    it('should persist document via repository', async () => {
      await service.registerDocument(validInput);

      expect(documentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: WORKSPACE_ID,
          filename: 'test.pdf',
          mimeType: 'application/pdf',
        }),
      );
    });

    it('should return the persisted KnowledgeDocument', async () => {
      const doc = await service.registerDocument(validInput);

      expect(doc).toBeInstanceOf(KnowledgeDocument);
      expect(documentRepository.create).toHaveReturnedWith(Promise.resolve(doc));
    });

    it('should generate a path with workspaceId prefix and uuid', async () => {
      const doc = await service.registerDocument(validInput);

      const pathPattern = /^workspaces\/ws-test-123\/[a-f0-9-]+-test\.pdf$/;
      expect(doc.storagePath).toMatch(pathPattern);
    });

    it('should handle null createdBy gracefully', async () => {
      const input = { ...validInput, createdBy: null };
      const doc = await service.registerDocument(input);

      expect(doc.createdBy).toBeNull();
      expect(documentRepository.create).toHaveBeenCalled();
    });

    it('should propagate storage service errors', async () => {
      const error = new Error('Storage unavailable');
      storageService.upload.mockRejectedValue(error);

      await expect(service.registerDocument(validInput)).rejects.toThrow('Storage unavailable');
      expect(documentRepository.create).not.toHaveBeenCalled();
    });

    it('should pass contentType to storage service as provided', async () => {
      await service.registerDocument(validInput);

      expect(storageService.upload).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.any(String),
        'application/pdf',
      );
    });

    it('should handle empty buffer upload', async () => {
      const input = { ...validInput, buffer: Buffer.alloc(0), sizeBytes: 0 };
      const doc = await service.registerDocument(input);

      expect(storageService.upload).toHaveBeenCalledWith(
        Buffer.alloc(0),
        expect.any(String),
        expect.any(String),
      );
      expect(doc).toBeDefined();
    });
  });
});
