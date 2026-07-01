import { Test, TestingModule } from '@nestjs/testing';
import { QdrantAdapter } from '../infrastructure/adapters/qdrant-adapter.js';
import { QdrantService } from '../infrastructure/embeddings/qdrant.service.js';

describe('QdrantAdapter', () => {
  let adapter: QdrantAdapter;
  let qdrantMock: jest.Mocked<QdrantService>;

  beforeEach(async () => {
    qdrantMock = {
      ensureCollection: jest.fn().mockResolvedValue(undefined),
      upsertPoints: jest.fn().mockResolvedValue(undefined),
      deletePoints: jest.fn().mockResolvedValue(undefined),
      search: jest.fn().mockResolvedValue([
        { chunkId: 'chunk-1', score: 0.95, payload: { text: 'test' } },
      ]),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QdrantAdapter,
        { provide: QdrantService, useValue: qdrantMock },
      ],
    }).compile();
    adapter = module.get<QdrantAdapter>(QdrantAdapter);
  });

  it('ensures collection exists', async () => {
    await adapter.ensureCollection('ws-1');
    expect(qdrantMock.ensureCollection).toHaveBeenCalledWith('ws-1');
  });

  it('upserts a single vector', async () => {
    await adapter.upsertVector('ws-1', { id: 'v1', vector: [0.1, 0.2], payload: {} });
    expect(qdrantMock.upsertPoints).toHaveBeenCalled();
  });

  it('batch inserts vectors in groups of 100', async () => {
    const points = Array.from({ length: 250 }, (_, i) => ({
      id: `v${i}`, vector: [0.1, 0.2], payload: { index: i },
    }));
    await adapter.batchInsert('ws-1', points);
    expect(qdrantMock.upsertPoints).toHaveBeenCalledTimes(3);
  });

  it('deletes a single vector', async () => {
    await adapter.deleteVector('ws-1', 'v1');
    expect(qdrantMock.deletePoints).toHaveBeenCalledWith('ws-1', ['v1']);
  });

  it('deletes multiple vectors', async () => {
    await adapter.deleteVectors('ws-1', ['v1', 'v2']);
    expect(qdrantMock.deletePoints).toHaveBeenCalledWith('ws-1', ['v1', 'v2']);
  });

  it('searches with filter mapping', async () => {
    const result = await adapter.search('ws-1', [0.1, 0.2], {
      must: [{ key: 'type', match: { value: 'standard' } }],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('chunk-1');
    expect(qdrantMock.search).toHaveBeenCalled();
  });

  it('batch inserts empty list without calling upsert', async () => {
    await adapter.batchInsert('ws-1', []);
    expect(qdrantMock.upsertPoints).not.toHaveBeenCalled();
  });
});
