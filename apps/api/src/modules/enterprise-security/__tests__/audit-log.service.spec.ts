import { AuditLogService } from '../application/services/audit-log.service.js';
import type { AuditLogEntry } from '../domain/types/security.types.js';

describe('AuditLogService', () => {
  let service: AuditLogService;

  beforeEach(() => {
    service = new AuditLogService();
  });

  const makeEntry = (overrides: Partial<AuditLogEntry> = {}) => ({
    action: 'user.login',
    actorId: 'user-1',
    actorType: 'user' as const,
    resourceType: 'session',
    resourceId: 'sess-1',
    severity: 'info' as const,
    ...overrides,
  });

  it('records an audit entry', async () => {
    await service.record(makeEntry());
    const result = await service.query({ page: 1, limit: 50 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBeDefined();
    expect(result.items[0].timestamp).toBeInstanceOf(Date);
  });

  it('queries with actorId filter', async () => {
    await service.record(makeEntry({ actorId: 'alice' }));
    await service.record(makeEntry({ actorId: 'bob' }));
    const result = await service.query({ actorId: 'alice', page: 1, limit: 50 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].actorId).toBe('alice');
  });

  it('queries with resourceType filter', async () => {
    await service.record(makeEntry({ resourceType: 'project' }));
    await service.record(makeEntry({ resourceType: 'document' }));
    const result = await service.query({ resourceType: 'project', page: 1, limit: 50 });
    expect(result.items).toHaveLength(1);
  });

  it('queries with action and severity combined', async () => {
    await service.record(makeEntry({ action: 'delete', severity: 'critical' }));
    await service.record(makeEntry({ action: 'delete', severity: 'info' }));
    const result = await service.query({ action: 'delete', severity: 'critical', page: 1, limit: 50 });
    expect(result.total).toBe(1);
  });

  it('gets entry by id', async () => {
    await service.record(makeEntry());
    const all = await service.query({ page: 1, limit: 50 });
    const found = await service.getById(all.items[0].id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(all.items[0].id);
  });

  it('returns null for non-existent id', async () => {
    const found = await service.getById('non-existent');
    expect(found).toBeNull();
  });

  it('exports entries by date range', async () => {
    const old = new Date('2020-01-01');
    const now = new Date();
    await service.record(makeEntry({ workspaceId: 'ws-1' }));
    const exported = await service.export('ws-1', old, now);
    expect(exported.length).toBeGreaterThanOrEqual(1);
  });

  it('paginates results', async () => {
    for (let i = 0; i < 10; i++) await service.record(makeEntry());
    const page1 = await service.query({ page: 1, limit: 3 });
    expect(page1.items).toHaveLength(3);
    expect(page1.total).toBe(10);
    const page2 = await service.query({ page: 2, limit: 3 });
    expect(page2.items).toHaveLength(3);
  });

  it('records critical severity', async () => {
    await service.record(makeEntry({ severity: 'critical' }));
    const result = await service.query({ severity: 'critical', page: 1, limit: 50 });
    expect(result.items).toHaveLength(1);
  });

  it('records with details payload', async () => {
    await service.record(makeEntry({ details: { ip: '10.0.0.1', browser: 'Chrome' } }));
    const result = await service.query({ page: 1, limit: 50 });
    expect(result.items[0].details?.ip).toBe('10.0.0.1');
  });

  it('filters by workspaceId', async () => {
    await service.record(makeEntry({ workspaceId: 'ws-a' }));
    await service.record(makeEntry({ workspaceId: 'ws-b' }));
    const result = await service.query({ workspaceId: 'ws-a', page: 1, limit: 50 });
    expect(result.items).toHaveLength(1);
  });

  it('filters by fromDate and toDate', async () => {
    await service.record(makeEntry());
    const future = new Date('2099-01-01');
    const past = new Date('2000-01-01');
    const result = await service.query({ fromDate: future, page: 1, limit: 50 });
    expect(result.items).toHaveLength(0);
    const result2 = await service.query({ fromDate: past, toDate: future, page: 1, limit: 50 });
    expect(result2.items.length).toBeGreaterThanOrEqual(1);
  });

  it('handles empty export range', async () => {
    const result = await service.export('ws-x', new Date('2000-01-01'), new Date('2000-01-02'));
    expect(result).toEqual([]);
  });
});
