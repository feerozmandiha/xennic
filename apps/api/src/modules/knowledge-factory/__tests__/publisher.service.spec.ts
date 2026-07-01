jest.mock('@xennic/database', () => ({
  prisma: {
    knowledge_objects: {
      create: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    },
    provenance_records: { create: jest.fn().mockResolvedValue({}) },
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '../../../shared/events/event-publisher.service.js';
import { PublisherService } from '../application/services/publisher.service.js';
import type { IKnowledgeObjectRepository } from '../domain/interfaces/knowledge-object.repository.interface.js';
import type { IProvenanceRepository } from '../domain/interfaces/provenance.repository.interface.js';
import type { IQdrantAdapter } from '../domain/interfaces/qdrant-adapter.interface.js';

describe('PublisherService', () => {
  let service: PublisherService;
  let koRepoMock: jest.Mocked<IKnowledgeObjectRepository>;
  let provenanceMock: jest.Mocked<IProvenanceRepository>;
  let qdrantMock: jest.Mocked<IQdrantAdapter>;

  beforeEach(async () => {
    koRepoMock = { save: jest.fn().mockResolvedValue(undefined), delete: jest.fn().mockResolvedValue(undefined) } as any;
    provenanceMock = { save: jest.fn().mockResolvedValue(undefined) } as any;
    qdrantMock = {
      ensureCollection: jest.fn().mockResolvedValue(undefined),
      batchInsert: jest.fn().mockResolvedValue(undefined),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublisherService,
        { provide: EventPublisher, useValue: { publish: jest.fn(), getDefaultExchange: jest.fn().mockReturnValue('xennic.events') } },
        { provide: 'IKnowledgeObjectRepository', useValue: koRepoMock },
        { provide: 'IProvenanceRepository', useValue: provenanceMock },
        { provide: 'IQdrantAdapter', useValue: qdrantMock },
      ],
    }).compile();
    service = module.get<PublisherService>(PublisherService);
  });

  it('publishes successfully with vectors and provenance', async () => {
    const result = await service.publish({
      knowledgeObjectId: 'ko-1', workspaceId: 'ws-1',
      xid: 'XID-001', title: 'Test', slug: 'test', tier: 'silver',
      content: { text: 'test' },
      vectors: [{ chunkId: 'chunk-1', embedding: [0.1, 0.2], payload: { text: 'chunk' } }],
      provenance: { sourceDocument: 'doc.pdf', traceId: 'trace-1' },
    });
    expect(result.success).toBe(true);
    expect(result.vectorCount).toBe(1);
    expect(koRepoMock.save).toHaveBeenCalled();
    expect(provenanceMock.save).toHaveBeenCalled();
    expect(qdrantMock.batchInsert).toHaveBeenCalled();
  });

  it('publishes successfully without vectors', async () => {
    const result = await service.publish({
      knowledgeObjectId: 'ko-2', workspaceId: 'ws-1',
      xid: 'XID-002', title: 'Test 2', slug: 'test-2', tier: 'bronze',
      content: { text: 'test' },
    });
    expect(result.success).toBe(true);
    expect(result.vectorCount).toBe(0);
    expect(qdrantMock.batchInsert).not.toHaveBeenCalled();
  });

  it('fails when PostgreSQL save throws', async () => {
    koRepoMock.save.mockRejectedValue(new Error('DB down'));
    const result = await service.publish({
      knowledgeObjectId: 'ko-3', workspaceId: 'ws-1',
      xid: 'XID-003', title: 'Fail', slug: 'fail', tier: 'silver',
      content: { text: 'test' },
    });
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('DB down');
  });

  it('rolls back PostgreSQL when Qdrant fails', async () => {
    qdrantMock.batchInsert.mockRejectedValue(new Error('Qdrant down'));
    const result = await service.publish({
      knowledgeObjectId: 'ko-4', workspaceId: 'ws-1',
      xid: 'XID-004', title: 'Rollback', slug: 'rollback', tier: 'gold',
      content: { text: 'test' },
      vectors: [{ chunkId: 'chunk-1', embedding: [0.1], payload: {} }],
    });
    expect(result.success).toBe(false);
    expect(koRepoMock.delete).toHaveBeenCalledWith('ko-4');
  });
});
