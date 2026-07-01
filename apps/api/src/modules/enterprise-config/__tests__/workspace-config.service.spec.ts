import { WorkspaceConfigService } from '../application/services/workspace-config.service.js';

describe('WorkspaceConfigService', () => {
  let service: WorkspaceConfigService;

  beforeEach(() => {
    service = new WorkspaceConfigService();
  });

  it('sets and gets a config value', async () => {
    await service.set('theme', 'dark', 'ws-1');
    const val = await service.get('theme', 'ws-1');
    expect(val).toBe('dark');
  });

  it('returns null for unknown key', async () => {
    const val = await service.get('nonexistent', 'ws-1');
    expect(val).toBeNull();
  });

  it('isolates by workspace', async () => {
    await service.set('key', 'ws-a-val', 'ws-a');
    await service.set('key', 'ws-b-val', 'ws-b');
    expect(await service.get('key', 'ws-a')).toBe('ws-a-val');
    expect(await service.get('key', 'ws-b')).toBe('ws-b-val');
  });

  it('deletes a config key', async () => {
    await service.set('temp', 'value', 'ws-1');
    await service.delete('temp', 'ws-1');
    expect(await service.get('temp', 'ws-1')).toBeNull();
  });

  it('lists configs for workspace', async () => {
    await service.set('a', '1', 'ws-1');
    await service.set('b', '2', 'ws-1');
    await service.set('c', '3', 'ws-2');
    const list = await service.list('ws-1');
    expect(list).toHaveLength(2);
  });

  it('returns version history', async () => {
    await service.set('key', 'v1', 'ws-1');
    await service.set('key', 'v2', 'ws-1');
    const versions = await service.listVersions('key', 'ws-1');
    expect(versions).toHaveLength(2);
  });

  it('gets specific version', async () => {
    await service.set('k', 'v1', 'ws-1');
    await service.set('k', 'v2', 'ws-1');
    const v1 = await service.getVersion('k', 'ws-1', 1);
    expect(v1?.value).toBe('v1');
    const v2 = await service.getVersion('k', 'ws-1', 2);
    expect(v2?.value).toBe('v2');
  });

  it('returns null for non-existent version', async () => {
    expect(await service.getVersion('k', 'ws-1', 99)).toBeNull();
  });

  it('stores with description', async () => {
    await service.set('key', 'val', 'ws-1', undefined, 'test description');
    const entries = await service.list('ws-1');
    expect(entries[0].description).toBe('test description');
  });
});
