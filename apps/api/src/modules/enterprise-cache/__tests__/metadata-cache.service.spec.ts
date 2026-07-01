import { MetadataCacheService } from '../application/services/metadata-cache.service.js';

describe('MetadataCacheService', () => {
  let service: MetadataCacheService;

  beforeEach(() => {
    service = new MetadataCacheService();
  });

  it('stores and retrieves metadata', async () => {
    await service.storeMetadata({ entityId: 'proj-1', entityType: 'project', metadata: { name: 'Dam Design', status: 'active' }, ttl: 300 });
    const meta = await service.getMetadata('proj-1', 'project');
    expect(meta).toEqual({ name: 'Dam Design', status: 'active' });
  });

  it('returns null for unknown entity', async () => {
    const meta = await service.getMetadata('unknown', 'project');
    expect(meta).toBeNull();
  });

  it('isolates by entity type', async () => {
    await service.storeMetadata({ entityId: 'id-1', entityType: 'type-a', metadata: { key: 'a' }, ttl: 300 });
    await service.storeMetadata({ entityId: 'id-1', entityType: 'type-b', metadata: { key: 'b' }, ttl: 300 });
    expect(await service.getMetadata('id-1', 'type-a')).toEqual({ key: 'a' });
    expect(await service.getMetadata('id-1', 'type-b')).toEqual({ key: 'b' });
  });
});
