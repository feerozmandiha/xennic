jest.mock('@xennic/database', () => ({
  prisma: {
    users: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    user_roles: {
      findMany: jest.fn(),
    },
    workspaces: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    calculations: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    workspace_members: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    subscriptions: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    plans: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    system_settings: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    audit_logs: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    notifications: {
      create: jest.fn(),
    },
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service.js';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = jest.requireMock('@xennic/database').prisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── checkIsAdmin ──────────────────────────────────────────────────────────

  describe('checkIsAdmin', () => {
    it('should return { isAdmin: true } when user has is_admin flag', async () => {
      prisma.users.findUnique.mockResolvedValue({ is_admin: true });

      const result = await service.checkIsAdmin('user-1');

      expect(result).toEqual({ isAdmin: true });
      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { is_admin: true },
      });
    });

    it('should check user_roles when is_admin is falsy', async () => {
      prisma.users.findUnique.mockResolvedValue({ is_admin: false });
      prisma.user_roles.findMany.mockResolvedValue([{ role: { name: 'admin' } }]);

      const result = await service.checkIsAdmin('user-1');

      expect(result).toEqual({ isAdmin: true });
    });

    it('should return { isAdmin: false } when no admin role found', async () => {
      prisma.users.findUnique.mockResolvedValue({ is_admin: false });
      prisma.user_roles.findMany.mockResolvedValue([]);

      const result = await service.checkIsAdmin('user-1');

      expect(result).toEqual({ isAdmin: false });
    });

    it('should fallback to user_roles check if findUnique throws', async () => {
      prisma.users.findUnique.mockRejectedValue(new Error('column missing'));
      prisma.user_roles.findMany.mockResolvedValue([{ role: { name: 'super_admin' } }]);

      const result = await service.checkIsAdmin('user-1');

      expect(result).toEqual({ isAdmin: true });
    });

    it('should return false when both queries throw', async () => {
      prisma.users.findUnique.mockRejectedValue(new Error('error'));
      prisma.user_roles.findMany.mockRejectedValue(new Error('table missing'));

      const result = await service.checkIsAdmin('user-1');

      expect(result).toEqual({ isAdmin: false });
    });
  });

  // ── getDashboardStats ────────────────────────────────────────────────────

  describe('getDashboardStats', () => {
    it('should return aggregated stats', async () => {
      prisma.users.count
        .mockResolvedValueOnce(100)  // totalUsers
        .mockResolvedValueOnce(10)   // newUsers
        .mockResolvedValueOnce(80)   // activeUsers
        .mockResolvedValueOnce(5);   // adminUsers
      prisma.workspaces.count
        .mockResolvedValueOnce(20)   // totalWorkspaces
        .mockResolvedValueOnce(3);   // newWorkspaces
      prisma.calculations.count
        .mockResolvedValueOnce(500)  // totalCalcs
        .mockResolvedValueOnce(50);  // newCalcs

      const result = await service.getDashboardStats();

      expect(result.users).toEqual({ total: 100, new_30d: 10, active: 80, admins: 5 });
      expect(result.workspaces).toEqual({ total: 20, new_30d: 3 });
      expect(result.calculations).toEqual({ total: 500, new_30d: 50 });
    });

    it('should return mock stats when top-level catch triggers', async () => {
      prisma.users.count.mockRejectedValue(new Error('db error'));

      const result = await service.getDashboardStats();

      expect(result).toHaveProperty('users');
      expect(result.users.total).toBe(0);
    });
  });

  // ── getActivityChart ─────────────────────────────────────────────────────

  describe('getActivityChart', () => {
    it('should return daily chart data for given days', async () => {
      const now = new Date();
      prisma.users.findMany.mockResolvedValue([{ created_at: now }]);
      prisma.calculations.findMany.mockResolvedValue([{ created_at: now }]);

      const result = await service.getActivityChart(30);

      expect(result).toHaveLength(30);
      expect(result.some(d => d.new_users > 0)).toBe(true);
      expect(result.some(d => d.calculations > 0)).toBe(true);
    });

    it('should return mock chart on error', async () => {
      prisma.users.findMany.mockRejectedValue(new Error('fail'));

      const result = await service.getActivityChart(7);

      expect(result).toHaveLength(7);
      expect(result.every(d => d.new_users === 0)).toBe(true);
    });
  });

  // ── getUsers ─────────────────────────────────────────────────────────────

  describe('getUsers', () => {
    it('should return paginated users with workspace counts', async () => {
      const fakeUsers = [
        { id: 'u1', email: 'a@b.com', first_name: 'John', last_name: 'Doe',
          is_active: true, is_admin: false, created_at: new Date(), last_login: null },
      ];
      prisma.users.findMany.mockResolvedValue(fakeUsers);
      prisma.users.count.mockResolvedValue(1);
      prisma.workspace_members.groupBy.mockResolvedValue([
        { user_id: 'u1', _count: { id: 3 } },
      ]);

      const result = await service.getUsers({ page: 1, limit: 20, search: 'john', status: 'active' });

      expect(result.total).toBe(1);
      expect(result.data[0].workspace_count).toBe(3);
      expect(result.data[0].status).toBe('active');
    });

    it('should filter by status=suspended', async () => {
      prisma.users.findMany.mockResolvedValue([]);
      prisma.users.count.mockResolvedValue(0);
      prisma.workspace_members.groupBy.mockResolvedValue([]);

      const result = await service.getUsers({ page: 1, limit: 20, status: 'suspended' });

      expect(result.total).toBe(0);
    });

    it('should return mock data on error', async () => {
      prisma.users.findMany.mockRejectedValue(new Error('fail'));

      const result = await service.getUsers({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect((result.data[0] as any).email).toBe('admin@xennic.ir');
    });
  });

  // ── updateUser ───────────────────────────────────────────────────────────

  describe('updateUser', () => {
    it('should update user status and isAdmin', async () => {
      prisma.users.update.mockResolvedValue({});

      const result = await service.updateUser('u1', { status: 'active', isAdmin: true });

      expect(result).toEqual({ success: true });
      expect(prisma.users.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: expect.objectContaining({ is_active: true, is_admin: true }),
      });
    });

    it('should return error details on failure', async () => {
      prisma.users.update.mockRejectedValue(new Error('not found'));

      const result = await service.updateUser('u1', { status: 'active' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('not found');
    });
  });

  // ── deleteUser ───────────────────────────────────────────────────────────

  describe('deleteUser', () => {
    it('should soft-delete user', async () => {
      prisma.users.update.mockResolvedValue({});

      const result = await service.deleteUser('u1');

      expect(result).toEqual({ success: true });
      expect(prisma.users.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: expect.objectContaining({ deleted_at: expect.any(Date), is_active: false }),
      });
    });

    it('should return success even if update throws', async () => {
      prisma.users.update.mockRejectedValue(new Error('fail'));

      const result = await service.deleteUser('u1');

      expect(result).toEqual({ success: true });
    });
  });

  // ── getWorkspaces ────────────────────────────────────────────────────────

  describe('getWorkspaces', () => {
    it('should return paginated workspaces with owner and plan info', async () => {
      const fakeWs = [
        { id: 'w1', name: 'Test', code: 'T1', created_at: new Date() },
      ];
      prisma.workspaces.findMany.mockResolvedValue(fakeWs);
      prisma.workspaces.count.mockResolvedValue(1);
      prisma.workspace_members.groupBy.mockResolvedValue([
        { workspace_id: 'w1', _count: { id: 5 } },
      ]);
      prisma.workspace_members.findMany.mockResolvedValue([
        { workspace_id: 'w1', role: 'owner', user: { email: 'owner@x.com', first_name: 'Ali', last_name: 'Reza' } },
      ]);
      prisma.subscriptions.findMany.mockResolvedValue([
        { workspace_id: 'w1', plan: { slug: 'pro' } },
      ]);

      const result = await service.getWorkspaces({ page: 1, limit: 20, search: 'test' });

      expect(result.total).toBe(1);
      expect(result.data[0].plan_slug).toBe('pro');
      expect(result.data[0].owner_email).toBe('owner@x.com');
      expect(result.data[0].member_count).toBe(5);
    });

    it('should return mock data on error', async () => {
      prisma.workspaces.findMany.mockRejectedValue(new Error('fail'));

      const result = await service.getWorkspaces({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(0);
    });
  });

  // ── updateWorkspacePlan ──────────────────────────────────────────────────

  describe('updateWorkspacePlan', () => {
    it('should create subscription for valid plan', async () => {
      prisma.plans.findUnique.mockResolvedValue({ id: 'plan-1', slug: 'pro' });
      prisma.subscriptions.create.mockResolvedValue({});

      const result = await service.updateWorkspacePlan('w1', 'pro');

      expect(result).toEqual({ success: true });
    });

    it('should return error when plan not found', async () => {
      prisma.plans.findUnique.mockResolvedValue(null);

      const result = await service.updateWorkspacePlan('w1', 'nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Plan not found');
    });

    it('should return success false on error', async () => {
      prisma.plans.findUnique.mockRejectedValue(new Error('db error'));

      const result = await service.updateWorkspacePlan('w1', 'pro');

      expect(result.success).toBe(false);
    });
  });

  // ── getPlans ─────────────────────────────────────────────────────────────

  describe('getPlans', () => {
    it('should return plans with subscriber counts', async () => {
      prisma.plans.findMany.mockResolvedValue([
        {
          id: 'p1', name: 'Free', slug: 'free',
          monthly_price: BigInt(0), yearly_price: BigInt(0),
          features: {}, is_active: true, created_at: new Date(),
          _count: { subscriptions: 10 },
        },
      ]);

      const result = await service.getPlans();

      expect(result).toHaveLength(1);
      expect(result[0].subscriber_count).toBe(10);
      expect(result[0].monthly_price).toBe(0);
    });

    it('should return default plans on error', async () => {
      prisma.plans.findMany.mockRejectedValue(new Error('fail'));

      const result = await service.getPlans();

      expect(result).toHaveLength(4);
      expect(result[0].slug).toBe('free');
    });
  });

  // ── updatePlan ───────────────────────────────────────────────────────────

  describe('updatePlan', () => {
    it('should update plan fields', async () => {
      prisma.plans.update.mockResolvedValue({});

      const result = await service.updatePlan('p1', { name: 'New', monthlyPrice: 100 });

      expect(result).toEqual({ success: true });
      expect(prisma.plans.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: expect.objectContaining({ name: 'New', monthly_price: 100 }),
      });
    });

    it('should return success on error', async () => {
      prisma.plans.update.mockRejectedValue(new Error('fail'));

      const result = await service.updatePlan('p1', { name: 'X' });

      expect(result).toEqual({ success: true });
    });
  });

  // ── sendBroadcastNotification ────────────────────────────────────────────

  describe('sendBroadcastNotification', () => {
    it('should broadcast to all workspaces', async () => {
      prisma.workspaces.findMany.mockResolvedValue([{ id: 'w1' }, { id: 'w2' }]);
      prisma.workspace_members.findMany.mockResolvedValue([
        { user_id: 'u1' },
        { user_id: 'u2' },
      ]);
      prisma.notifications.create.mockResolvedValue({});

      const result = await service.sendBroadcastNotification({
        title: 'Alert', body: 'Test', type: 'info',
      });

      expect(result.sent).toBe(2);
    });

    it('should filter by targetPlan', async () => {
      prisma.plans.findUnique.mockResolvedValue({ id: 'plan-1', slug: 'pro' });
      prisma.subscriptions.findMany.mockResolvedValue([
        { workspace_id: 'w1' },
      ]);
      prisma.workspace_members.findMany.mockResolvedValue([{ user_id: 'u1' }]);
      prisma.notifications.create.mockResolvedValue({});

      const result = await service.sendBroadcastNotification({
        title: 'Alert', body: 'Test', type: 'info', targetPlan: 'pro',
      });

      expect(result.sent).toBe(1);
    });

    it('should return 0 sent when plan not found', async () => {
      prisma.plans.findUnique.mockResolvedValue(null);

      const result = await service.sendBroadcastNotification({
        title: 'Alert', body: 'Test', type: 'info', targetPlan: 'nonexistent',
      });

      expect(result.sent).toBe(0);
    });
  });

  // ── getAuditLog ──────────────────────────────────────────────────────────

  describe('getAuditLog', () => {
    it('should return paginated audit logs with user email', async () => {
      prisma.audit_logs.findMany.mockResolvedValue([
        { id: 'log-1', action: 'user.delete', created_at: new Date(),
          user: { email: 'admin@x.com' } },
      ]);
      prisma.audit_logs.count.mockResolvedValue(1);

      const result = await service.getAuditLog({ page: 1, limit: 50, action: 'user' });

      expect(result.total).toBe(1);
      expect(result.data[0].user_email).toBe('admin@x.com');
    });

    it('should return empty on error', async () => {
      prisma.audit_logs.findMany.mockRejectedValue(new Error('fail'));

      const result = await service.getAuditLog({ page: 1, limit: 50 });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  // ── Settings ─────────────────────────────────────────────────────────────

  describe('getSettings', () => {
    it('should return key-value settings map', async () => {
      prisma.system_settings.findMany.mockResolvedValue([
        { key: 'platform_name', value: 'Xennic' },
        { key: 'support_email', value: 'support@xennic.ir' },
      ]);

      const result = await service.getSettings();

      expect(result).toEqual({
        platform_name: 'Xennic',
        support_email: 'support@xennic.ir',
      });
    });

    it('should return default settings on error', async () => {
      prisma.system_settings.findMany.mockRejectedValue(new Error('fail'));

      const result = await service.getSettings();

      expect(result).toHaveProperty('platform_name', 'Xennic');
      expect(result).toHaveProperty('registration_open', 'true');
    });
  });

  describe('updateSettings', () => {
    it('should upsert each setting', async () => {
      prisma.system_settings.upsert.mockResolvedValue({});

      const result = await service.updateSettings({ key1: 'val1', key2: 'val2' });

      expect(result).toEqual({ success: true });
      expect(prisma.system_settings.upsert).toHaveBeenCalledTimes(2);
    });
  });

  // ── Disabled endpoints ───────────────────────────────────────────────────

  describe('consultations (disabled)', () => {
    it('getConsultations should return empty', async () => {
      const result = await service.getConsultations({ page: 1, limit: 20 });
      expect(result).toEqual({ data: [], total: 0 });
    });

    it('adminReply should return stub', async () => {
      const result = await service.adminReply('id', 'admin', 'name', 'content');
      expect(result).toEqual({ success: true, replyId: '' });
    });

    it('updateConsultationStatus should return stub', async () => {
      const result = await service.updateConsultationStatus('id', 'answered');
      expect(result).toEqual({ success: true });
    });
  });

  describe('articles (disabled)', () => {
    it('adminCreateArticle should return stub', async () => {
      const result = await service.adminCreateArticle({
        title: 'Test', summary: 'Sum', content: 'Body',
        category: 'cat', tags: ['a'], status: 'draft',
        readMinutes: 5, authorId: 'u1', authorName: 'Admin',
      });
      expect(result).toHaveProperty('id', '');
      expect(result).toHaveProperty('title', 'Test');
    });

    it('updateArticleStatus should return stub', async () => {
      const result = await service.updateArticleStatus('id', 'published');
      expect(result).toEqual({ success: true });
    });
  });
});
