jest.mock('@xennic/database', () => ({
  prisma: { $queryRaw: jest.fn() },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../infrastructure/guards/admin.guard.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from '../../application/services/admin.service.js';

describe('AdminController', () => {
  let controller: AdminController;
  let service: jest.Mocked<AdminService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            getDashboardStats: jest.fn(),
            getActivityChart: jest.fn(),
            getUsers: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
            getWorkspaces: jest.fn(),
            updateWorkspacePlan: jest.fn(),
            getPlans: jest.fn(),
            updatePlan: jest.fn(),
            getConsultations: jest.fn(),
            adminReply: jest.fn(),
            updateConsultationStatus: jest.fn(),
            adminCreateArticle: jest.fn(),
            updateArticleStatus: jest.fn(),
            sendBroadcastNotification: jest.fn(),
            getAuditLog: jest.fn(),
            getSettings: jest.fn(),
            updateSettings: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get(AdminService) as jest.Mocked<AdminService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Dashboard ────────────────────────────────────────────────────────────

  describe('dashboard', () => {
    it('should return dashboard stats', async () => {
      const stats = { users: { total: 100, new_30d: 10, active: 80, admins: 5 }, workspaces: { total: 20, new_30d: 3 }, calculations: { total: 500, new_30d: 50 }, consultations: { total: 0, pending: 0, answered: 0 }, revenue: { total: 0, monthly: 0 } };
      service.getDashboardStats.mockResolvedValue(stats);

      const result = await controller.dashboard();

      expect(result).toEqual({ success: true, data: stats });
      expect(service.getDashboardStats).toHaveBeenCalledTimes(1);
    });
  });

  describe('chart', () => {
    it('should return activity chart with default 30 days', async () => {
      service.getActivityChart.mockResolvedValue([]);

      const result = await controller.chart(undefined);

      expect(result.success).toBe(true);
      expect(service.getActivityChart).toHaveBeenCalledWith(30);
    });

    it('should pass days query param', async () => {
      service.getActivityChart.mockResolvedValue([]);

      await controller.chart('7');

      expect(service.getActivityChart).toHaveBeenCalledWith(7);
    });
  });

  // ── Users ────────────────────────────────────────────────────────────────

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const data = [{ id: 'u1', email: 'a@b.com', first_name: 'John', last_name: 'Doe', status: 'active', is_admin: false, created_at: new Date(), last_login_at: null, workspace_count: 2 }];
      service.getUsers.mockResolvedValue({ data, total: 1 });

      const result = await controller.getUsers('1', '20', undefined, undefined);

      expect(result.success).toBe(true);
      expect(result.meta.total).toBe(1);
      expect(service.getUsers).toHaveBeenCalledWith({ page: 1, limit: 20, search: undefined, status: undefined });
    });
  });

  describe('updateUser', () => {
    it('should delegate to service', async () => {
      const body = { status: 'active', isAdmin: true };
      service.updateUser.mockResolvedValue({ success: true });

      const result = await controller.updateUser('u1', body);

      expect(service.updateUser).toHaveBeenCalledWith('u1', body);
      expect(result).toEqual({ success: true });
    });
  });

  describe('deleteUser', () => {
    it('should delegate to service', async () => {
      service.deleteUser.mockResolvedValue({ success: true });

      const result = await controller.deleteUser('u1');

      expect(service.deleteUser).toHaveBeenCalledWith('u1');
      expect(result).toEqual({ success: true });
    });
  });

  // ── Workspaces ───────────────────────────────────────────────────────────

  describe('getWorkspaces', () => {
    it('should return paginated workspaces', async () => {
      service.getWorkspaces.mockResolvedValue({ data: [], total: 0 });

      const result = await controller.getWorkspaces('1', '20', undefined);

      expect(result.success).toBe(true);
      expect(service.getWorkspaces).toHaveBeenCalledWith({ page: 1, limit: 20, search: undefined });
    });
  });

  describe('updatePlan', () => {
    it('should update workspace plan', async () => {
      service.updateWorkspacePlan.mockResolvedValue({ success: true });

      const result = await controller.updatePlan('w1', { planSlug: 'pro' });

      expect(service.updateWorkspacePlan).toHaveBeenCalledWith('w1', 'pro');
      expect(result).toEqual({ success: true });
    });
  });

  // ── Plans ────────────────────────────────────────────────────────────────

  describe('getPlans', () => {
    it('should return plans', async () => {
      service.getPlans.mockResolvedValue([]);

      const result = await controller.getPlans();

      expect(result.success).toBe(true);
      expect(service.getPlans).toHaveBeenCalledTimes(1);
    });
  });

  describe('updatePlan2', () => {
    it('should update plan', async () => {
      const body = { name: 'New Plan', monthlyPrice: 100 };
      service.updatePlan.mockResolvedValue({ success: true });

      const result = await controller.updatePlan2('p1', body);

      expect(service.updatePlan).toHaveBeenCalledWith('p1', body);
      expect(result).toEqual({ success: true });
    });
  });

  // ── Consultations ────────────────────────────────────────────────────────

  describe('getConsultations', () => {
    it('should return consultations', async () => {
      service.getConsultations.mockResolvedValue({ data: [], total: 0 });

      const result = await controller.getConsultations('1', '20', undefined, undefined);

      expect(result.success).toBe(true);
      expect(service.getConsultations).toHaveBeenCalledWith({ page: 1, limit: 20, status: undefined, priority: undefined });
    });
  });

  describe('adminReply', () => {
    it('should reply with admin info from req.user', async () => {
      service.adminReply.mockResolvedValue({ success: true, replyId: 'r1' });
      const req = { user: { userId: 'admin-1', firstName: 'Ali', lastName: 'Reza' } };

      const result = await controller.adminReply('c1', { content: 'answer' }, req);

      expect(service.adminReply).toHaveBeenCalledWith('c1', 'admin-1', 'Ali Reza', 'answer');
      expect(result).toEqual({ success: true, replyId: 'r1' });
    });
  });

  describe('updateConsultationStatus', () => {
    it('should update status', async () => {
      service.updateConsultationStatus.mockResolvedValue({ success: true });

      const result = await controller.updateConsultationStatus('c1', { status: 'answered' });

      expect(service.updateConsultationStatus).toHaveBeenCalledWith('c1', 'answered');
    });
  });

  // ── Articles ─────────────────────────────────────────────────────────────

  describe('createArticle', () => {
    it('should create article with author from req', async () => {
      const body = { title: 'Test', summary: 'Sum', content: 'Body', category: 'cat', tags: [], status: 'draft', readMinutes: 5 };
      const req = { user: { userId: 'u1', firstName: 'Admin', lastName: 'Xennic' } };
      service.adminCreateArticle.mockResolvedValue({ id: '', slug: '', title: 'Test', status: 'draft', createdAt: new Date() });

      const result = await controller.createArticle(body, req);

      expect(service.adminCreateArticle).toHaveBeenCalledWith(
        expect.objectContaining({ authorId: 'u1', authorName: 'Admin Xennic' }),
      );
      expect(result).toHaveProperty('title', 'Test');
    });
  });

  describe('updateArticleStatus', () => {
    it('should delegate to service', async () => {
      service.updateArticleStatus.mockResolvedValue({ success: true });

      const result = await controller.updateArticleStatus('a1', { status: 'published' });

      expect(service.updateArticleStatus).toHaveBeenCalledWith('a1', 'published');
      expect(result).toEqual({ success: true });
    });
  });

  // ── Notifications ────────────────────────────────────────────────────────

  describe('broadcast', () => {
    it('should send broadcast notification', async () => {
      const body = { title: 'Alert', body: 'Test', type: 'info' };
      service.sendBroadcastNotification.mockResolvedValue({ success: true, sent: 5 });

      const result = await controller.broadcast(body);

      expect(service.sendBroadcastNotification).toHaveBeenCalledWith(body);
      expect(result).toEqual({ success: true, sent: 5 });
    });
  });

  // ── Audit Log ────────────────────────────────────────────────────────────

  describe('auditLog', () => {
    it('should return audit logs', async () => {
      service.getAuditLog.mockResolvedValue({ data: [], total: 0 });

      const result = await controller.auditLog('1', '50', undefined);

      expect(result.success).toBe(true);
      expect(service.getAuditLog).toHaveBeenCalledWith({ page: 1, limit: 50, action: undefined });
    });
  });

  // ── Settings ─────────────────────────────────────────────────────────────

  describe('getSettings', () => {
    it('should return settings', async () => {
      service.getSettings.mockResolvedValue({ platform_name: 'Xennic' });

      const result = await controller.getSettings();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ platform_name: 'Xennic' });
    });
  });

  describe('updateSettings', () => {
    it('should update settings', async () => {
      const body = { platform_name: 'Xennic Pro' };
      service.updateSettings.mockResolvedValue({ success: true });

      const result = await controller.updateSettings(body);

      expect(service.updateSettings).toHaveBeenCalledWith(body);
      expect(result).toEqual({ success: true });
    });
  });
});
