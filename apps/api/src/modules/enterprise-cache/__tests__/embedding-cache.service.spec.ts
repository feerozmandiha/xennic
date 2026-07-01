import { EmbeddingCacheService } from '../application/services/embedding-cache.service.js';

describe('EmbeddingCacheService', () => {
  let service: EmbeddingCacheService;

  beforeEach(() => {
    service = new EmbeddingCacheService();
  });

  it('stores and retrieves embeddings', async () => {
    await service.storeEmbedding({ text: 'hello', model: 'text-embedding-3', embedding: [0.1, 0.2, 0.3], dimensions: 3 });
    const emb = await service.getEmbedding('hello', 'text-embedding-3');
    expect(emb).toEqual([0.1, 0.2, 0.3]);
  });

  it('returns null for uncached text', async () => {
    const emb = await service.getEmbedding('unknown', 'any-model');
    expect(emb).toBeNull();
  });

  it('returns null for different model', async () => {
    await service.storeEmbedding({ text: 'hi', model: 'model-a', embedding: [1], dimensions: 1 });
    const emb = await service.getEmbedding('hi', 'model-b');
    expect(emb).toBeNull();
  });

  it('handles large embedding vectors', async () => {
    const large = Array(1536).fill(0.5);
    await service.storeEmbedding({ text: 'big', model: 'large', embedding: large, dimensions: 1536 });
    const emb = await service.getEmbedding('big', 'large');
    expect(emb).toHaveLength(1536);
  });
});
