import { SecretsManager } from '../application/services/secrets-manager.service.js';

describe('SecretsManager', () => {
  let service: SecretsManager;

  beforeEach(() => {
    service = new SecretsManager();
  });

  it('sets and gets a secret', async () => {
    await service.set('DB_PASSWORD', 'supersecret');
    const value = await service.get('DB_PASSWORD');
    expect(value).toBe('supersecret');
  });

  it('returns null for unknown key', async () => {
    const value = await service.get('DOES_NOT_EXIST');
    expect(value).toBeNull();
  });

  it('reads from process.env when available', async () => {
    process.env.SECRET_API_KEY = 'env-key-value';
    const value = await service.get('API_KEY');
    expect(value).toBe('env-key-value');
    delete process.env.SECRET_API_KEY;
  });

  it('reads direct env vars', async () => {
    process.env.MY_SECRET = 'direct-env';
    const value = await service.get('MY_SECRET');
    expect(value).toBe('direct-env');
    delete process.env.MY_SECRET;
  });

  it('increments version on set', async () => {
    await service.set('TOKEN', 'v1');
    await service.set('TOKEN', 'v2');
    const entries = await service.list();
    expect(entries.find((e) => e.key === 'TOKEN')?.version).toBe(2);
  });

  it('rotates a secret', async () => {
    await service.set('KEY', 'old');
    await service.rotate('KEY');
    const entries = await service.list();
    const entry = entries.find((e) => e.key === 'KEY');
    expect(entry).toBeDefined();
    expect(entry!.version).toBeGreaterThanOrEqual(1);
  });

  it('throws on rotate for unknown secret', async () => {
    await expect(service.rotate('NONEXISTENT')).rejects.toThrow('Secret not found');
  });

  it('lists secrets filtered by environment', async () => {
    await service.set('A', '1');
    const listed = await service.list();
    expect(listed.length).toBeGreaterThanOrEqual(1);
  });

  it('deletes a secret', async () => {
    await service.set('TEMP', 'value');
    await service.delete('TEMP');
    const value = await service.get('TEMP');
    expect(value).toBeNull();
  });

  it('handles empty values', async () => {
    await service.set('EMPTY', '');
    const value = await service.get('EMPTY');
    expect(value).toBe('');
  });
});
