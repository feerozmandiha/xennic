import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgePublisherService } from '../application/services/knowledge-publisher.service.js';
import { QdrantService } from '../infrastructure/embeddings/qdrant.service.js';
import { MinioService } from '../../storage/infrastructure/minio/minio.service.js';
import type { IKnowledgeFactoryRepository } from '../domain/interfaces/knowledge-factory.repository.interface.js';
import type { EkosEntity } from '../domain/ekos.entity.js';
import type { DocumentChunk, EmbeddingResult } from '../domain/chunk.types.js';

const mockEntity = {
  id: 'entity-1',
  documentId: 'doc-1',
  workspaceId: 'ws-1',
  sourceType: 'standard',
  content: 'Transformer test content',
  metadata: { title: 'Test' },
  checksum: 'abc123',
  status: 'embedded',
  createdAt: new Date(),
  updatedAt: new Date(),
  updateStatus: jest.fn(),
} as unknown as EkosEntity;

const mockChunks: DocumentChunk[] = [
  {
    chunkId: 'chunk-1',
    docId: 'doc-1',
    workspaceId: 'ws-1',
    content: 'The transformer shall be rated at 33 kV.',
    heading: 'Voltage Rating',
    chunkType: 'text',
    index: 0,
    metadata: {},
  },
];

const mockEmbeddings: EmbeddingResult[] = [
  { chunkId: 'chunk-1', embedding: [0.1, 0.2, 0.3], dimensions: 3 },
];

const mockEvidenceChain = {
  evidenceId: 'ev-1',
  claims: [{ claimId: 'c1', text: 'Transformers must be rated.', confidence: 0.9, supportingSources: ['chunk-1'] }],
  confidence: 0.9,
  sources: [{ sourceId: 'chunk-1', documentId: 'doc-1', location: 'Voltage Rating', excerpt: 'The transformer shall...', confidence: 0.9, version: 1 }],
};

describe('KnowledgePublisherService', () => {
  let service: KnowledgePublisherService;
  let minioMock: jest.Mocked<MinioService>;
  let qdrantConnected: boolean;
  let qdrantMock: jest.Mocked<QdrantService>;
  let repositoryMock: jest.Mocked<IKnowledgeFactoryRepository>;

  function createQdrantMock() {
    return {
      upsertPoints: jest.fn().mockResolvedValue(undefined),
      get connected() { return qdrantConnected; },
    } as unknown as jest.Mocked<QdrantService>;
  }

  beforeEach(async () => {
    qdrantConnected = true;
    minioMock = {
      uploadBuffer: jest.fn().mockResolvedValue('manifest.json'),
    } as any;

    qdrantMock = createQdrantMock();

    repositoryMock = {
      save: jest.fn().mockResolvedValue(undefined),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgePublisherService,
        { provide: MinioService, useValue: minioMock },
        { provide: QdrantService, useValue: qdrantMock },
        { provide: 'IKnowledgeFactoryRepository', useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<KnowledgePublisherService>(KnowledgePublisherService);
  });

  it('publishes manifest to MinIO, vectors to Qdrant, saves to repository', async () => {
    const result = await service.publish(
      mockEntity, mockChunks, mockEmbeddings, mockEvidenceChain, 'ws-1',
    );

    expect(result.published).toBe(true);
    expect(result.documentId).toBe('doc-1');
    expect(result.vectorCount).toBe(1);
    expect(result.storagePath).toContain('knowledge/ws-1/doc-1/');
    expect(minioMock.uploadBuffer).toHaveBeenCalledTimes(1);
    expect(qdrantMock.upsertPoints).toHaveBeenCalledWith('ws-1', expect.any(Array));
    expect(repositoryMock.save).toHaveBeenCalledWith(mockEntity);
    expect(mockEntity.updateStatus).toHaveBeenCalledWith('published');
  });

  it('includes citations in publish result', async () => {
    const result = await service.publish(
      mockEntity, mockChunks, mockEmbeddings, mockEvidenceChain, 'ws-1',
    );

    expect(result.citations.length).toBe(1);
    expect(result.citations[0].format).toMatch(/^XENNIC-CITE:/);
  });

  it('handles MinIO failure gracefully and continues to Qdrant', async () => {
    minioMock.uploadBuffer.mockRejectedValue(new Error('MinIO unavailable'));

    const result = await service.publish(
      mockEntity, mockChunks, mockEmbeddings, mockEvidenceChain, 'ws-1',
    );

    expect(result.published).toBe(true);
    expect(result.vectorCount).toBe(1);
    expect(qdrantMock.upsertPoints).toHaveBeenCalled();
    expect(repositoryMock.save).toHaveBeenCalled();
  });

  it('sets vectorCount to 0 when Qdrant is not connected', async () => {
    qdrantConnected = false;

    const result = await service.publish(
      mockEntity, mockChunks, mockEmbeddings, mockEvidenceChain, 'ws-1',
    );

    expect(result.vectorCount).toBe(0);
    expect(qdrantMock.upsertPoints).not.toHaveBeenCalled();
    expect(repositoryMock.save).toHaveBeenCalled();
  });

  it('always saves to repository regardless of MinIO or Qdrant state', async () => {
    minioMock.uploadBuffer.mockRejectedValue(new Error('MinIO down'));
    qdrantConnected = true;
    qdrantMock.upsertPoints.mockRejectedValue(new Error('Qdrant down'));

    const result = await service.publish(
      mockEntity, mockChunks, mockEmbeddings, mockEvidenceChain, 'ws-1',
    );

    expect(result.published).toBe(true);
    expect(result.vectorCount).toBe(0);
    expect(repositoryMock.save).toHaveBeenCalledTimes(1);
    expect(mockEntity.updateStatus).toHaveBeenCalledWith('published');
  });

  it('builds correct vector points for Qdrant', async () => {
    await service.publish(
      mockEntity, mockChunks, mockEmbeddings, mockEvidenceChain, 'ws-1',
    );

    expect(qdrantMock.upsertPoints).toHaveBeenCalledWith('ws-1', [
      expect.objectContaining({
        id: 'chunk-1',
        vector: [0.1, 0.2, 0.3],
        payload: expect.objectContaining({
          documentId: 'doc-1',
          workspaceId: 'ws-1',
          content: 'The transformer shall be rated at 33 kV.',
          heading: 'Voltage Rating',
        }),
      }),
    ]);
  });
});
