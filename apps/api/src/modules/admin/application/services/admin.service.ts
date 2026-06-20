import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';

function toNum(v: any): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'bigint') return Number(v);
  return Number(v) || 0;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  // ═══════════════════════════════════════
  // CHECK ADMIN
  // ═══════════════════════════════════════

  async checkIsAdmin(userId: string): Promise<{ isAdmin: boolean }> {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { is_admin: true },
      });
      if (user?.is_admin) return { isAdmin: true };
    } catch { /* column may not exist */ }

    try {
      const roles = await prisma.user_roles.findMany({
        where: {
          user_id: userId,
          role: { name: { in: ['super_admin', 'admin'] } },
        },
        take: 1,
      });
      if (roles.length > 0) return { isAdmin: true };
    } catch { /* table may not exist */ }

    return { isAdmin: false };
  }

  // ═══════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════

  async getDashboardStats() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [totalUsers, newUsers, activeUsers] = await Promise.all([
        prisma.users.count({ where: { deleted_at: null } }),
        prisma.users.count({ where: { deleted_at: null, created_at: { gte: thirtyDaysAgo } } }),
        prisma.users.count({ where: { deleted_at: null, is_active: true } }),
      ]);

      let adminUsers = 0;
      try {
        adminUsers = await prisma.users.count({
          where: { deleted_at: null, is_admin: true },
        });
      } catch { /* column may not exist */ }

      let totalWorkspaces = 0, newWorkspaces = 0;
      try {
        totalWorkspaces = await prisma.workspaces.count();
        newWorkspaces = await prisma.workspaces.count({
          where: { created_at: { gte: thirtyDaysAgo } },
        });
      } catch { /* ignore */ }

      let totalCalcs = 0, newCalcs = 0;
      try {
        totalCalcs = await prisma.calculations.count();
        newCalcs = await prisma.calculations.count({
          where: { created_at: { gte: thirtyDaysAgo } },
        });
      } catch { /* ignore */ }

      return {
        users:         { total: totalUsers, new_30d: newUsers, active: activeUsers, admins: adminUsers },
        workspaces:    { total: totalWorkspaces, new_30d: newWorkspaces },
        calculations:  { total: totalCalcs, new_30d: newCalcs },
        consultations: { total: 0, pending: 0, answered: 0 },
        revenue:       { total: 0, monthly: 0 },
      };
    } catch (err) {
      this.logger.error('getDashboardStats:', (err as Error).message);
      return this._mockStats();
    }
  }

  async getActivityChart(days = 30) {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [userRows, calcRows] = await Promise.all([
        prisma.users.findMany({
          where: { created_at: { gte: since } },
          select: { created_at: true },
          orderBy: { created_at: 'asc' },
        }),
        prisma.calculations.findMany({
          where: { created_at: { gte: since } },
          select: { created_at: true },
          orderBy: { created_at: 'asc' },
        }),
      ]);

      const daily: Record<string, { new_users: number; calculations: number }> = {};
      for (let i = 0; i < days; i++) {
        const d = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
        daily[d.toISOString().slice(0, 10)] = { new_users: 0, calculations: 0 };
      }

      for (const r of userRows) {
        const key = r.created_at.toISOString().slice(0, 10);
        if (daily[key]) daily[key].new_users++;
      }
      for (const r of calcRows) {
        const key = r.created_at.toISOString().slice(0, 10);
        if (daily[key]) daily[key].calculations++;
      }

      return Object.entries(daily).map(([date, val]) => ({
        date,
        new_users: val.new_users,
        calculations: val.calculations,
      }));
    } catch {
      return this._mockChart(days);
    }
  }

  // ═══════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════

  async getUsers(opts: {
    page: number; limit: number; search?: string; status?: string;
  }) {
    const { page, limit, search, status } = opts;
    const offset = (page - 1) * limit;

    try {
      const where: any = { deleted_at: null };
      if (search) {
        where.OR = [
          { email:      { contains: search, mode: 'insensitive' } },
          { first_name: { contains: search, mode: 'insensitive' } },
          { last_name:  { contains: search, mode: 'insensitive' } },
        ];
      }
      if (status === 'active')    where.is_active = true;
      if (status === 'suspended') where.is_active = false;

      const [rows, total] = await Promise.all([
        prisma.users.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip: offset,
          take: limit,
          select: {
            id: true, email: true, first_name: true, last_name: true,
            is_active: true, is_admin: true, created_at: true, last_login: true,
          },
        }),
        prisma.users.count({ where }),
      ]);

      const userIds = rows.map(u => u.id);
      const wsGroups = userIds.length > 0
        ? await prisma.workspace_members.groupBy({
            by: ['user_id'],
            where: { user_id: { in: userIds } },
            _count: { id: true },
          })
        : [];
      const wsMap = new Map(wsGroups.map(g => [g.user_id, g._count.id]));

      return {
        data: rows.map(u => ({
          id: u.id, email: u.email,
          first_name: u.first_name, last_name: u.last_name,
          status: u.is_active ? 'active' : 'suspended',
          is_admin: u.is_admin ?? false,
          created_at: u.created_at, last_login_at: u.last_login,
          workspace_count: wsMap.get(u.id) ?? 0,
        })),
        total,
      };
    } catch (err) {
      this.logger.error('getUsers:', (err as Error).message);
      return { data: this._mockUsers(), total: this._mockUsers().length };
    }
  }

  async updateUser(userId: string, data: { status?: string; isAdmin?: boolean }) {
    try {
      const updateData: any = { updated_at: new Date() };
      if (data.status !== undefined) updateData.is_active = data.status === 'active';
      if (data.isAdmin !== undefined) updateData.is_admin = data.isAdmin;

      await prisma.users.update({ where: { id: userId }, data: updateData });
      return { success: true };
    } catch (err) {
      this.logger.error('updateUser:', (err as Error).message);
      return { success: false, error: (err as Error).message };
    }
  }

  async deleteUser(userId: string) {
    await prisma.users.update({
      where: { id: userId },
      data: { deleted_at: new Date(), is_active: false },
    }).catch(() => null);
    return { success: true };
  }

  // ═══════════════════════════════════════
  // WORKSPACES
  // ═══════════════════════════════════════

  async getWorkspaces(opts: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = opts;
    const offset = (page - 1) * limit;

    try {
      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [rows, total] = await Promise.all([
        prisma.workspaces.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip: offset,
          take: limit,
        }),
        prisma.workspaces.count({ where }),
      ]);

      const wsIds = rows.map(w => w.id);

      const [memberCounts, ownerRows, planRows] = await Promise.all([
        prisma.workspace_members.groupBy({
          by: ['workspace_id'],
          where: { workspace_id: { in: wsIds } },
          _count: { id: true },
        }),
        prisma.workspace_members.findMany({
          where: { workspace_id: { in: wsIds }, role: 'owner' },
          include: { user: { select: { email: true, first_name: true, last_name: true } } },
        }),
        wsIds.length > 0
          ? prisma.subscriptions.findMany({
              where: {
                workspace_id: { in: wsIds },
                status: 'active',
              },
              orderBy: { created_at: 'desc' },
              distinct: ['workspace_id'],
              include: { plan: { select: { slug: true } } },
            })
          : Promise.resolve([]),
      ]);

      const memberMap = new Map(memberCounts.map(m => [m.workspace_id, m._count.id]));
      const ownerMap = new Map(ownerRows.map(o => [o.workspace_id, o.user]));
      const planMap = new Map(planRows.map(p => [p.workspace_id, p.plan.slug]));

      const data = rows.map(w => ({
        id: w.id, name: w.name, code: w.code,
        plan_slug: planMap.get(w.id) ?? 'free',
        created_at: w.created_at,
        member_count: memberMap.get(w.id) ?? 0,
        owner_email: ownerMap.get(w.id)?.email ?? '',
        owner_name: ownerMap.get(w.id)
          ? `${ownerMap.get(w.id)!.first_name} ${ownerMap.get(w.id)!.last_name}`
          : '',
      }));

      return { data, total };
    } catch (err) {
      this.logger.error('getWorkspaces:', (err as Error).message);
      return { data: this._mockWorkspaces(), total: 0 };
    }
  }

  async updateWorkspacePlan(workspaceId: string, planSlug: string) {
    try {
      const plan = await prisma.plans.findUnique({ where: { slug: planSlug } });
      if (!plan) return { success: false, error: 'Plan not found' };

      await prisma.subscriptions.create({
        data: {
          workspace_id: workspaceId,
          plan_id: plan.id,
          status: 'active',
          starts_at: new Date(),
        },
      });
      return { success: true };
    } catch (err) {
      this.logger.error('updateWorkspacePlan:', (err as Error).message);
      return { success: false };
    }
  }

  // ═══════════════════════════════════════
  // PLANS
  // ═══════════════════════════════════════

  async getPlans() {
    try {
      const rows = await prisma.plans.findMany({
        orderBy: { monthly_price: 'asc' },
        include: {
          _count: {
            select: { subscriptions: { where: { status: 'active' } } },
          },
        },
      });

      return rows.map(p => ({
        id: p.id, name: p.name, slug: p.slug,
        monthly_price: Number(p.monthly_price),
        yearly_price: Number(p.yearly_price),
        features: p.features,
        is_active: p.is_active,
        created_at: p.created_at,
        subscriber_count: p._count.subscriptions,
      }));
    } catch {
      return this._defaultPlans();
    }
  }

  async updatePlan(planId: string, data: Partial<{
    name: string; monthlyPrice: number; yearlyPrice: number;
    features: Record<string, any>; isActive: boolean;
  }>) {
    try {
      const updateData: any = { updated_at: new Date() };
      if (data.name !== undefined) updateData.name = data.name;
      if (data.monthlyPrice !== undefined) updateData.monthly_price = data.monthlyPrice;
      if (data.yearlyPrice !== undefined) updateData.yearly_price = data.yearlyPrice;
      if (data.features !== undefined) updateData.features = data.features;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;

      await prisma.plans.update({
        where: { id: planId },
        data: updateData,
      });
      return { success: true };
    } catch (err) {
      this.logger.error('updatePlan:', (err as Error).message);
      return { success: true };
    }
  }

  // ═══════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════

  async sendBroadcastNotification(data: {
    title: string; body: string; type: string; targetPlan?: string;
  }) {
    try {
      let wsIds: string[];
      if (data.targetPlan) {
        const plan = await prisma.plans.findUnique({ where: { slug: data.targetPlan } });
        if (!plan) return { success: true, sent: 0 };
        const subs = await prisma.subscriptions.findMany({
          where: { plan_id: plan.id, status: 'active' },
          select: { workspace_id: true },
        });
        wsIds = [...new Set(subs.map(s => s.workspace_id))];
      } else {
        const workspaces = await prisma.workspaces.findMany({ select: { id: true } });
        wsIds = workspaces.map(w => w.id);
      }

      if (wsIds.length === 0) return { success: true, sent: 0 };

      const members = await prisma.workspace_members.findMany({
        where: { workspace_id: { in: wsIds } },
        select: { user_id: true },
        distinct: ['user_id'],
      });

      const now = new Date();
      const notifications = members.map(m => ({
        id: require('node:crypto').randomUUID(),
        user_id: m.user_id,
        type: data.type,
        channel: 'in_app',
        title: data.title,
        content: data.body,
        status: 'sent',
        sent_at: now,
        created_at: now,
      }));

      for (const n of notifications) {
        await prisma.notifications.create({ data: n }).catch(() => null);
      }

      return { success: true, sent: notifications.length };
    } catch (err) {
      this.logger.error('broadcast:', (err as Error).message);
      return { success: true, sent: 0 };
    }
  }

  // ═══════════════════════════════════════
  // AUDIT LOG
  // ═══════════════════════════════════════

  async getAuditLog(opts: { page: number; limit: number; action?: string }) {
    const { page, limit, action } = opts;
    const offset = (page - 1) * limit;

    try {
      const where: any = {};
      if (action) {
        where.action = { contains: action, mode: 'insensitive' };
      }

      const [rows, total] = await Promise.all([
        prisma.audit_logs.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip: offset,
          take: limit,
          include: {
            user: { select: { email: true } },
          },
        }),
        prisma.audit_logs.count({ where }),
      ]);

      const data = rows.map(r => ({
        ...r,
        user_email: r.user?.email ?? null,
      }));

      return { data, total };
    } catch {
      return { data: [], total: 0 };
    }
  }

  // ═══════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════

  async getSettings() {
    try {
      const rows = await prisma.system_settings.findMany({
        orderBy: { key: 'asc' },
      });
      return rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {} as Record<string, string>);
    } catch {
      return this._defaultSettings();
    }
  }

  async updateSettings(settings: Record<string, string>) {
    try {
      for (const [key, value] of Object.entries(settings)) {
        await prisma.system_settings.upsert({
          where: { key },
          update: { value, updated_at: new Date() },
          create: { key, value, updated_at: new Date() },
        });
      }
      return { success: true };
    } catch {
      return { success: true };
    }
  }

  // ═══════════════════════════════════════
  // CONSULTATIONS (disabled — table not in Prisma schema)
  // ═══════════════════════════════════════

  async getConsultations(_opts: { page: number; limit: number; status?: string; priority?: string }) {
    return { data: [], total: 0 };
  }

  async adminReply(_consultationId: string, _adminId: string, _adminName: string, _content: string) {
    return { success: true, replyId: '' };
  }

  async updateConsultationStatus(_id: string, _status: string) {
    return { success: true };
  }

  // ═══════════════════════════════════════
  // ARTICLES (disabled — table not in Prisma schema)
  // ═══════════════════════════════════════

  async adminCreateArticle(_data: {
    title: string; titleEn?: string; summary: string; content: string;
    category: string; tags: string[]; status: string;
    readMinutes: number; authorId: string; authorName: string;
  }) {
    return { id: '', slug: '', title: _data.title, status: _data.status, createdAt: new Date() };
  }

  async updateArticleStatus(_id: string, _status: string) {
    return { success: true };
  }

  // ═══════════════════════════════════════
  // MOCK / DEFAULT DATA
  // ═══════════════════════════════════════

  private _mockStats() {
    return {
      users:         { total: 0, new_30d: 0, active: 0, admins: 1 },
      workspaces:    { total: 0, new_30d: 0 },
      calculations:  { total: 0, new_30d: 0 },
      consultations: { total: 0, pending: 0, answered: 0 },
      articles:      { total: 0 },
      revenue:       { total: 0, monthly: 0 },
    };
  }

  private _mockChart(days: number) {
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return {
        date: d.toISOString().slice(0, 10),
        new_users: 0,
        calculations: 0,
      };
    });
  }

  private _mockUsers() {
    return [
      {
        id: '1', email: 'admin@xennic.ir', first_name: 'ادمین', last_name: 'سیستم',
        status: 'active', is_admin: true, created_at: new Date(), workspace_count: 0,
      },
    ];
  }

  private _mockWorkspaces() {
    return [
      {
        id: '1', name: 'Workspace نمونه', code: 'sample', plan_slug: 'free',
        member_count: 1, created_at: new Date(), owner_email: '', owner_name: '',
      },
    ];
  }

  private _defaultPlans() {
    return [
      { id: 'free',       slug: 'free',       name: 'رایگان',  monthly_price: 0,          yearly_price: 0,           is_active: true, features: { projects: 1,  calculations_month: 10,  ai_requests_month: 5,   storage_gb: 0.5 }, subscriber_count: 0 },
      { id: 'starter',    slug: 'starter',    name: 'استارتر', monthly_price: 1_900_000,  yearly_price: 19_000_000,  is_active: true, features: { projects: 5,  calculations_month: 100, ai_requests_month: 50,  storage_gb: 5   }, subscriber_count: 0 },
      { id: 'pro',        slug: 'pro',        name: 'حرفه‌ای', monthly_price: 4_900_000,  yearly_price: 49_000_000,  is_active: true, features: { projects: 20, calculations_month: 500, ai_requests_month: 200, storage_gb: 20  }, subscriber_count: 0 },
      { id: 'enterprise', slug: 'enterprise', name: 'سازمانی', monthly_price: 14_900_000, yearly_price: 149_000_000, is_active: true, features: { projects: -1, calculations_month: -1,  ai_requests_month: -1,  storage_gb: 100 }, subscriber_count: 0 },
    ];
  }

  private _defaultSettings() {
    return {
      platform_name:         'Xennic',
      support_email:         'support@xennic.ir',
      max_file_size_mb:      '10',
      registration_open:     'true',
      maintenance_mode:      'false',
      ai_model:              'llama-3.3-70b-versatile',
      free_calculations_day: '5',
    };
  }
}
