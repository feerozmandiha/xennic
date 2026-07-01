jest.mock('@xennic/database', () => ({
  prisma: {
    audit_logs: {
      create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      findMany: jest.fn().mockResolvedValue([
        {
          action: 'USER_CREATED',
          entity: 'user',
          entity_id: 'user-1',
          user_id: 'admin-1',
          workspace_id: 'ws-1',
          ip_address: null,
          user_agent: null,
          old_values: null,
          new_values: { email: 'test@test.com' },
          metadata: null,
          created_at: new Date(),
        },
      ]),
    },
  },
}));

import { AuditRepository } from '../audit.repository';

describe('AuditRepository', () => {
  let repo: AuditRepository;

  beforeEach(() => {
    repo = new AuditRepository();
  });

  it('should record an audit entry', async () => {
    await expect(
      repo.record({
        action: 'USER_CREATED',
        entity: 'user',
        entityId: 'user-1',
        userId: 'admin-1',
        workspaceId: 'ws-1',
        newValues: { email: 'test@test.com' },
      }),
    ).resolves.toBeUndefined();
  });

  it('should find audits by entity', async () => {
    const entries = await repo.findByEntity('user', 'user-1');
    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe('USER_CREATED');
    expect(entries[0].newValues).toEqual({ email: 'test@test.com' });
  });

  it('should find audits by user', async () => {
    const entries = await repo.findByUser('admin-1');
    expect(entries).toHaveLength(1);
  });

  it('should find audits by workspace', async () => {
    const entries = await repo.findByWorkspace('ws-1');
    expect(entries).toHaveLength(1);
  });
});
