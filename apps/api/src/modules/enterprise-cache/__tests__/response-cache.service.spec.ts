import { ResponseCacheService } from '../application/services/response-cache.service.js';

describe('ResponseCacheService', () => {
  let service: ResponseCacheService;

  beforeEach(() => {
    service = new ResponseCacheService();
  });

  it('stores and retrieves cached responses', async () => {
    await service.storeResponse({
      requestHash: 'hash-1', response: { data: 'result' }, statusCode: 200,
      headers: { 'content-type': 'application/json' }, ttl: 300,
    });
    const found = await service.getResponse('hash-1');
    expect(found).not.toBeNull();
    expect(found!.response).toEqual({ data: 'result' });
    expect(found!.statusCode).toBe(200);
  });

  it('returns null for unknown hash', async () => {
    const found = await service.getResponse('unknown');
    expect(found).toBeNull();
  });

  it('respects different status codes', async () => {
    await service.storeResponse({
      requestHash: 'err', response: { error: 'not found' }, statusCode: 404,
      headers: {}, ttl: 60,
    });
    const found = await service.getResponse('err');
    expect(found!.statusCode).toBe(404);
  });
});
