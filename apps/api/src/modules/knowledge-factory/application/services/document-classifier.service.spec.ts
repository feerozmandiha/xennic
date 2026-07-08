import { Test, TestingModule } from '@nestjs/testing';
import { DocumentClassifierService } from './document-classifier.service.js';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import { KnowledgeDocument } from '../../domain/entities/knowledge-document.entity.js';

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
    status: 'uploaded',
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

describe('DocumentClassifierService', () => {
  let service: DocumentClassifierService;
  let documentRepository: jest.Mocked<IKnowledgeDocumentRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentClassifierService,
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
      ],
    }).compile();

    service = module.get<DocumentClassifierService>(DocumentClassifierService);
    documentRepository = module.get('IKnowledgeDocumentRepository') as jest.Mocked<IKnowledgeDocumentRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('classifyDocument', () => {
    it('should throw error when document not found', async () => {
      documentRepository.findById.mockResolvedValue(null);

      await expect(service.classifyDocument(DOCUMENT_ID, 'some text')).rejects.toThrow(
        `Document ${DOCUMENT_ID} not found`,
      );
      expect(documentRepository.classifyDocument).not.toHaveBeenCalled();
    });

    it('should classify and save classification to repository', async () => {
      documentRepository.findById.mockResolvedValue(makeDocument());
      documentRepository.classifyDocument.mockResolvedValue(makeDocument());

      const result = await service.classifyDocument(DOCUMENT_ID, 'This is an IEEE electrical standard.');

      expect(result.domain).toBe('electrical-engineering');
      expect(result.standard).toBe('IEEE');
      expect(result.confidence).toBe(0.85);
      expect(documentRepository.classifyDocument).toHaveBeenCalledWith(DOCUMENT_ID, expect.any(Object));
    });
  });

  describe('runClassification (private)', () => {
    const runClassification = (text: string) =>
      (service as unknown as { runClassification: (text: string) => Promise<{ domain: string; standard: string; equipmentType: string; confidence: number; suggestedSlug: string }> }).runClassification.bind(service)(text);

    describe('IEEE/electrical keyword', () => {
      it('should classify as IEEE electrical when IEEE keyword present', async () => {
        const result = await runClassification('This document follows IEEE standards');

        expect(result.domain).toBe('electrical-engineering');
        expect(result.standard).toBe('IEEE');
        expect(result.confidence).toBe(0.85);
      });

      it('should classify as IEEE electrical when electrical keyword present', async () => {
        const result = await runClassification('This is an electrical engineering document');

        expect(result.domain).toBe('electrical-engineering');
        expect(result.standard).toBe('IEEE');
        expect(result.confidence).toBe(0.85);
      });
    });

    describe('IEC keyword', () => {
      it('should classify as IEC when IEC keyword present', async () => {
        const result = await runClassification('This document follows IEC standards');

        expect(result.domain).toBe('electrical-engineering');
        expect(result.standard).toBe('IEC');
        expect(result.confidence).toBe(0.85);
      });

      it('should classify as IEC when international electrotechnical keyword present', async () => {
        const result = await runClassification('This follows international electrotechnical commission');

        expect(result.domain).toBe('electrical-engineering');
        expect(result.standard).toBe('IEC');
        expect(result.confidence).toBe(0.85);
      });
    });

    describe('ISO keyword', () => {
      it('should classify as ISO quality management when ISO keyword present', async () => {
        const result = await runClassification('This follows ISO 9001 standards');

        expect(result.domain).toBe('quality-management');
        expect(result.standard).toBe('ISO');
        expect(result.confidence).toBe(0.8);
      });

      it('should classify as ISO when international organization keyword present', async () => {
        const result = await runClassification('International Organization for Standardization');

        expect(result.domain).toBe('quality-management');
        expect(result.standard).toBe('ISO');
        expect(result.confidence).toBe(0.8);
      });
    });

    describe('ASTM keyword', () => {
      it('should classify as ASTM materials when ASTM keyword present', async () => {
        const result = await runClassification('This follows ASTM standards');

        expect(result.domain).toBe('materials');
        expect(result.standard).toBe('ASTM');
        expect(result.confidence).toBe(0.75);
      });

      it('should classify as ASTM when american society keyword present', async () => {
        const result = await runClassification('American Society for Testing Materials');

        expect(result.domain).toBe('materials');
        expect(result.standard).toBe('ASTM');
        expect(result.confidence).toBe(0.75);
      });
    });

    describe('Equipment type detection', () => {
      it('should detect transformer equipment', async () => {
        const result = await runClassification('This is about transformers');

        expect(result.equipmentType).toBe('transformer');
        expect(result.suggestedSlug).toBe('transformer-specification');
      });

      it('should detect circuit breaker equipment', async () => {
        const result = await runClassification('Circuit breaker specifications');

        expect(result.equipmentType).toBe('circuit-breaker');
        expect(result.suggestedSlug).toBe('circuit-breaker-specification');
      });

      it('should detect motor equipment', async () => {
        const result = await runClassification('Motor performance data');

        expect(result.equipmentType).toBe('motor');
        expect(result.suggestedSlug).toBe('motor-specification');
      });

      it('should detect cable equipment', async () => {
        const result = await runClassification('Cable installation guide');

        expect(result.equipmentType).toBe('cable');
        expect(result.suggestedSlug).toBe('cable-specification');
      });

      it('should detect cable when wiring keyword present', async () => {
        const result = await runClassification('Wiring specifications for installation');

        expect(result.equipmentType).toBe('cable');
        expect(result.suggestedSlug).toBe('cable-specification');
      });
    });

    describe('default classification', () => {
      it('should return general domain when no keywords match', async () => {
        const result = await runClassification('This is a random document about cooking');

        expect(result.domain).toBe('general');
        expect(result.standard).toBe('');
        expect(result.equipmentType).toBe('');
        expect(result.confidence).toBe(0.5);
      });
    });

    describe('combined classification', () => {
      it('should classify both standard and equipment type', async () => {
        const result = await runClassification('IEEE transformer standards for electrical systems');

        expect(result.domain).toBe('electrical-engineering');
        expect(result.standard).toBe('IEEE');
        expect(result.equipmentType).toBe('transformer');
        expect(result.suggestedSlug).toBe('transformer-specification');
      });
    });
  });

  describe('suggestTaxonomy', () => {
    it('should return tags from classification', async () => {
      const result = await service.suggestTaxonomy('IEEE transformer document');

      expect(result.tags).toContain('electrical-engineering');
      expect(result.tags).toContain('IEEE');
      expect(result.tags).toContain('transformer');
      expect(result.categories).toContain('electrical-engineering');
      expect(result.suggestedKnowledgeId).toBeUndefined();
    });

    it('should return empty tags when no keywords match', async () => {
      const result = await service.suggestTaxonomy('random text without keywords');

      expect(result.tags).toEqual(['general']);
      expect(result.categories).toEqual(['general']);
    });
  });
});