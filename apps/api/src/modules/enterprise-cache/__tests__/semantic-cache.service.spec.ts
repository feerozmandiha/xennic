import { SemanticCacheService } from '../application/services/semantic-cache.service.js';

describe('SemanticCacheService', () => {
  let service: SemanticCacheService;

  beforeEach(() => {
    service = new SemanticCacheService();
  });

  it('stores and finds by similarity', async () => {
    await service.store({ query: 'hello world', embedding: [1, 0, 0], result: 'greeting', similarity: 0.9, ttl: 300 });
    const found = await service.findBySimilarity('hello', [0.9, 0.1, 0], 0.8);
    expect(found).not.toBeNull();
    expect(found!.result).toBe('greeting');
  });

  it('returns null when similarity is below threshold', async () => {
    await service.store({ query: 'cats', embedding: [1, 0, 0], result: 'feline', similarity: 1, ttl: 300 });
    const found = await service.findBySimilarity('dogs', [0, 1, 0], 0.9);
    expect(found).toBeNull();
  });

  it('returns null for empty store', async () => {
    const found = await service.findBySimilarity('test', [1, 0], 0.5);
    expect(found).toBeNull();
  });

  it('handles zero vector', async () => {
    await service.store({ query: 'empty', embedding: [0, 0, 0], result: 'none', similarity: 0, ttl: 300 });
    const found = await service.findBySimilarity('test', [0, 0, 0], 0);
    expect(found).not.toBeNull();
  });

  it('handles embedding dimension mismatch gracefully', async () => {
    await service.store({ query: '3d', embedding: [1, 2, 3], result: 'three', similarity: 1, ttl: 300 });
    const found = await service.findBySimilarity('2d', [1, 2], 0.9);
    expect(found).toBeNull();
  });
});
