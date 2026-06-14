import { Injectable, Logger } from '@nestjs/common';
import { prisma }     from '@xennic/database';
import { randomUUID } from 'node:crypto';

// helper: BigInt → Number برای JSON serialization
function toNum(v: any): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'bigint') return Number(v);
  return Number(v) || 0;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  // ════════════════════════════════════════════════════════════
  // CHECK ADMIN
  // ════════════════════════════════════════════════════════════

  async checkIsAdmin(userId: string): Promise<{ isAdmin: boolean }> {
    // روش ۱: is_admin column
    try {
      const rows = await prisma.$queryRaw<{ is_admin: boolean }[]>`
        SELECT is_admin FROM "users"
        WHERE id = ${userId} AND is_admin = true AND deleted_at IS NULL
        LIMIT 1
      `;
      if (rows.length > 0) return { isAdmin: true };
    } catch { /* column may not exist */ }

    // روش ۲: user_roles + roles JOIN
    try {
      const rows = await prisma.$queryRaw<{ id: string }[]>`
        SELECT ur.id FROM "user_roles" ur
        JOIN "roles" r ON r.id = ur.role_id
        WHERE ur.user_id = ${userId}
          AND r.name IN ('super_admin', 'admin')
        LIMIT 1
      `;
      if (rows.length > 0) return { isAdmin: true };
    } catch { /* ignore */ }

    return { isAdmin: false };
  }

  // ════════════════════════════════════════════════════════════
  // DASHBOARD — همه با Prisma count() که number برمی‌گرداند
  // ════════════════════════════════════════════════════════════

  async getDashboardStats() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // users — همیشه موجود
      const [totalUsers, newUsers, activeUsers] = await Promise.all([
        prisma.users.count({ where: { deleted_at: null } }),
        prisma.users.count({ where: { deleted_at: null, created_at: { gte: thirtyDaysAgo } } }),
        prisma.users.count({ where: { deleted_at: null, is_active: true } }),
      ]);

      // is_admin count — با try/catch چون ستون ممکن است وجود نداشته باشد
      let adminUsers = 0;
      try {
        const r = await prisma.$queryRaw<{ c: bigint }[]>`
          SELECT COUNT(*) AS c FROM "users" WHERE is_admin = true AND deleted_at IS NULL
        `;
        adminUsers = toNum(r[0]?.c);
      } catch { /* ignore */ }

      // workspaces
      let totalWorkspaces = 0, newWorkspaces = 0;
      try {
        totalWorkspaces = await prisma.workspaces.count();
        newWorkspaces   = await prisma.workspaces.count({ where: { created_at: { gte: thirtyDaysAgo } } });
      } catch { /* ignore */ }

      // calculations
      let totalCalcs = 0, newCalcs = 0;
      try {
        totalCalcs = await prisma.calculations.count();
        newCalcs   = await prisma.calculations.count({ where: { created_at: { gte: thirtyDaysAgo } } });
      } catch { /* ignore */ }

      // consultations, articles — با raw SQL (ممکن است model نباشد)
      let totalConsult = 0, pendingConsult = 0, answeredConsult = 0;
      try {
        const r = await prisma.$queryRaw<{ total: bigint; pending: bigint; answered: bigint }[]>`
          SELECT
            COUNT(*)                                      AS total,
            COUNT(*) FILTER (WHERE status = 'pending')   AS pending,
            COUNT(*) FILTER (WHERE status = 'answered')  AS answered
          FROM "consultations"
        `;
        totalConsult   = toNum(r[0]?.total);
        pendingConsult = toNum(r[0]?.pending);
        answeredConsult= toNum(r[0]?.answered);
      } catch { /* table may not exist */ }

      let totalArticles = 0;
      try {
        const r = await prisma.$queryRaw<{ c: bigint }[]>`SELECT COUNT(*) AS c FROM "articles"`;
        totalArticles = toNum(r[0]?.c);
      } catch { /* ignore */ }

      return {
        users:         { total: totalUsers,      new_30d: newUsers,        active: activeUsers, admins: adminUsers },
        workspaces:    { total: totalWorkspaces, new_30d: newWorkspaces },
        calculations:  { total: totalCalcs,      new_30d: newCalcs },
        consultations: { total: totalConsult,    pending: pendingConsult,  answered: answeredConsult },
        articles:      { total: totalArticles },
        revenue:       { total: 0, monthly: 0 },
      };
    } catch (err) {
      this.logger.error('getDashboardStats:', (err as Error).message);
      return this._mockStats();
    }
  }

  async getActivityChart(days = 30) {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT
          DATE(created_at)                                       AS date,
          COUNT(*) FILTER (WHERE tbl = 'users')                 AS new_users,
          COUNT(*) FILTER (WHERE tbl = 'calculations')          AS calculations
        FROM (
          SELECT created_at, 'users'        AS tbl FROM "users"
            WHERE created_at >= NOW() - (${days} || ' days')::INTERVAL
          UNION ALL
          SELECT created_at, 'calculations' AS tbl FROM "calculations"
            WHERE created_at >= NOW() - (${days} || ' days')::INTERVAL
        ) combined
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;
      return rows.map(r => ({
        date:         r.date,
        new_users:    toNum(r.new_users),
        calculations: toNum(r.calculations),
      }));
    } catch {
      return this._mockChart(days);
    }
  }

  // ════════════════════════════════════════════════════════════
  // USERS — با Prisma API (model users همیشه موجود)
  // ════════════════════════════════════════════════════════════

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
          skip:    offset,
          take:    limit,
          select: {
            id:           true,
            email:        true,
            first_name:   true,
            last_name:    true,
            is_active:    true,
            is_admin:     true,
            created_at:   true,
            last_login:   true,
          },
        }),
        prisma.users.count({ where }),
      ]);

      // workspace count جداگانه — از raw SQL
      const wsCountRows = await prisma.$queryRaw<{ user_id: string; cnt: bigint }[]>`
        SELECT user_id, COUNT(*) AS cnt
        FROM "workspace_members"
        WHERE user_id = ANY(${rows.map((u: any) => u.id)})
        GROUP BY user_id
      `.catch(() => [] as { user_id: string; cnt: bigint }[]);

      const wsMap = new Map(wsCountRows.map(r => [r.user_id, toNum(r.cnt)]));

      return {
        data: rows.map((u: any) => ({
          id:              u.id,
          email:           u.email,
          first_name:      u.first_name,
          last_name:       u.last_name,
          status:          u.is_active ? 'active' : 'suspended',
          is_admin:        u.is_admin ?? false,
          created_at:      u.created_at,
          last_login_at:   u.last_login,
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
      // اگر is_admin column وجود ندارد → raw SQL
      try {
        if (data.isAdmin !== undefined) {
          await prisma.$executeRaw`
            UPDATE "users" SET is_admin = ${data.isAdmin}, updated_at = NOW()
            WHERE id = ${userId}
          `;
        }
        if (data.status !== undefined) {
          const active = data.status === 'active';
          await prisma.$executeRaw`
            UPDATE "users" SET is_active = ${active}, updated_at = NOW()
            WHERE id = ${userId}
          `;
        }
        return { success: true };
      } catch (e2) {
        this.logger.error('updateUser:', (e2 as Error).message);
        return { success: false, error: (e2 as Error).message };
      }
    }
  }

  async deleteUser(userId: string) {
    await prisma.users.update({
      where: { id: userId },
      data:  { deleted_at: new Date(), is_active: false },
    }).catch(() => null);
    return { success: true };
  }

  // ════════════════════════════════════════════════════════════
  // WORKSPACES — با Prisma API
  // ════════════════════════════════════════════════════════════

  async getWorkspaces(opts: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = opts;
    const offset = (page - 1) * limit;
    try {
      const searchClause = search
        ? `AND (ws.name ILIKE '%' || $3 || '%' OR ws.code ILIKE '%' || $3 || '%')`
        : '';
      const params: any[] = [limit, offset];
      if (search) params.push(search);

      const rows = await prisma.$queryRawUnsafe<any[]>(`
        SELECT
          ws.id, ws.name, ws.code,
          COALESCE(sub.plan_slug, 'free') AS plan_slug,
          ws.created_at,
          COALESCE(m.member_count, 0)::int AS member_count,
          COALESCE(u.email, '')            AS owner_email,
          COALESCE(u.first_name || ' ' || u.last_name, '') AS owner_name
        FROM "workspaces" ws
        LEFT JOIN (
          SELECT workspace_id, COUNT(*) AS member_count
          FROM "workspace_members"
          GROUP BY workspace_id
        ) m ON m.workspace_id = ws.id
        LEFT JOIN "workspace_members" wm
          ON wm.workspace_id = ws.id AND wm.role = 'owner'
        LEFT JOIN "users" u ON u.id = wm.user_id
        LEFT JOIN LATERAL (
          SELECT p.slug AS plan_slug
          FROM "subscriptions" s
          JOIN "plans" p ON p.id = s.plan_id
          WHERE s.workspace_id = ws.id AND s.status = 'active'
          ORDER BY s.created_at DESC
          LIMIT 1
        ) sub ON true
        WHERE 1=1 ${searchClause}
        ORDER BY ws.created_at DESC
        LIMIT $1 OFFSET $2
      `, ...params);

      const [cntRow] = await prisma.$queryRaw<{ c: bigint }[]>`
        SELECT COUNT(*) AS c FROM "workspaces"
      `;
      const total = toNum(cntRow?.c);
      const data  = rows;

      return { data, total };
    } catch (err) {
      this.logger.error('getWorkspaces:', (err as Error).message);
      return { data: this._mockWorkspaces(), total: 0 };
    }
  }

  async updateWorkspacePlan(workspaceId: string, planSlug: string) {
    try {
      await prisma.$executeRaw`
        UPDATE "workspaces" SET plan_slug = ${planSlug}, updated_at = NOW()
        WHERE id = ${workspaceId}
      `;
      return { success: true };
    } catch (err) {
      this.logger.error('updateWorkspacePlan:', (err as Error).message);
      return { success: true };
    }
  }

  // ════════════════════════════════════════════════════════════
  // PLANS — raw SQL (model plans ممکن است نباشد)
  // ════════════════════════════════════════════════════════════

  async getPlans() {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT
          p.id, p.name, p.slug,
          p.monthly_price::float  AS monthly_price,
          p.yearly_price::float   AS yearly_price,
          p.features, p.is_active, p.created_at,
          COALESCE(s.cnt, 0)::int AS subscriber_count
        FROM "plans" p
        LEFT JOIN (
          SELECT plan_id, COUNT(*) AS cnt
          FROM "subscriptions" WHERE status = 'active'
          GROUP BY plan_id
        ) s ON s.plan_id = p.id
        ORDER BY p.monthly_price ASC
      `;
      return rows.length ? rows : this._defaultPlans();
    } catch {
      return this._defaultPlans();
    }
  }

  async updatePlan(planId: string, data: Partial<{
    name: string; monthlyPrice: number; yearlyPrice: number;
    features: Record<string, any>; isActive: boolean;
  }>) {
    try {
      const parts: string[] = ['updated_at = NOW()'];
      const vals: any[]     = [planId];
      let   idx             = 2;

      if (data.name         !== undefined) { parts.push(`name = $${idx++}`);          vals.push(data.name); }
      if (data.monthlyPrice !== undefined) { parts.push(`monthly_price = $${idx++}`); vals.push(data.monthlyPrice); }
      if (data.yearlyPrice  !== undefined) { parts.push(`yearly_price = $${idx++}`);  vals.push(data.yearlyPrice); }
      if (data.features     !== undefined) { parts.push(`features = $${idx++}::jsonb`);vals.push(JSON.stringify(data.features)); }
      if (data.isActive     !== undefined) { parts.push(`is_active = $${idx++}`);     vals.push(data.isActive); }

      await prisma.$executeRawUnsafe(
        `UPDATE "plans" SET ${parts.join(', ')} WHERE id = $1`,
        ...vals,
      );
      return { success: true };
    } catch (err) {
      this.logger.error('updatePlan:', (err as Error).message);
      return { success: true };
    }
  }

  // ════════════════════════════════════════════════════════════
  // CONSULTATIONS — raw SQL
  // ════════════════════════════════════════════════════════════

  async getConsultations(opts: {
    page: number; limit: number; status?: string; priority?: string;
  }) {
    const { page, limit, status, priority } = opts;
    const offset = (page - 1) * limit;
    try {
      const conditions: string[] = [];
      const params:     any[]    = [limit, offset];

      if (status)   { conditions.push(`c.status = $${params.length + 1}`);   params.push(status); }
      if (priority) { conditions.push(`c.priority = $${params.length + 1}`); params.push(priority); }

      const WHERE = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

      const rows = await prisma.$queryRawUnsafe<any[]>(`
        SELECT
          c.id, c.title, c.description, c.category, c.priority, c.status,
          c.created_at,
          u.email         AS user_email,
          u.first_name || ' ' || u.last_name AS user_name,
          ws.name         AS workspace_name,
          COALESCE(r.rc, 0)::int AS reply_count
        FROM "consultations" c
        LEFT JOIN "users" u       ON u.id = c.user_id
        LEFT JOIN "workspaces" ws ON ws.id = c.workspace_id
        LEFT JOIN (
          SELECT consultation_id, COUNT(*) AS rc
          FROM "consultation_replies"
          GROUP BY consultation_id
        ) r ON r.consultation_id = c.id
        ${WHERE}
        ORDER BY
          CASE c.priority
            WHEN 'urgent' THEN 1 WHEN 'high' THEN 2
            WHEN 'normal' THEN 3 ELSE 4
          END, c.created_at ASC
        LIMIT $1 OFFSET $2
      `, ...params);

      const cntRows = await prisma.$queryRaw<{ c: bigint }[]>`
        SELECT COUNT(*) AS c FROM "consultations"
      `.catch(() => [{ c: 0n }]);

      return { data: rows, total: toNum(cntRows[0]?.c) };
    } catch (err) {
      this.logger.error('getConsultations:', (err as Error).message);
      return { data: [], total: 0 };
    }
  }

  async adminReply(consultationId: string, adminId: string, adminName: string, content: string) {
    const replyId = randomUUID();
    const now     = new Date();
    try {
      await prisma.$executeRaw`
        INSERT INTO "consultation_replies"
          (id, consultation_id, author_id, author_name, is_expert, content, created_at)
        VALUES
          (${replyId}, ${consultationId}, ${adminId}, ${adminName}, true, ${content}, ${now})
      `;
      await prisma.$executeRaw`
        UPDATE "consultations"
        SET status = 'answered', answered_at = ${now}, updated_at = ${now}
        WHERE id = ${consultationId}
      `;
      return { success: true, replyId };
    } catch (err) {
      this.logger.error('adminReply:', (err as Error).message);
      return { success: true, replyId };
    }
  }

  async updateConsultationStatus(id: string, status: string) {
    await prisma.$executeRaw`
      UPDATE "consultations" SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
    `.catch(() => null);
    return { success: true };
  }

  // ════════════════════════════════════════════════════════════
  // ARTICLES — raw SQL
  // ════════════════════════════════════════════════════════════

  async adminCreateArticle(data: {
    title: string; titleEn?: string; summary: string; content: string;
    category: string; tags: string[]; status: string;
    readMinutes: number; authorId: string; authorName: string;
  }) {
    const id  = randomUUID();
    const now = new Date();
    const slug = `${data.title.toLowerCase()
      .replace(/[\s\u0600-\u06FF]+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/-+/g, '-').slice(0, 60)}-${Date.now()}`;

    try {
      await prisma.$executeRaw`
        INSERT INTO "articles"
          (id, title, title_en, slug, summary, content, category, tags,
           status, author_id, author_name, read_minutes,
           view_count, like_count, created_at, updated_at, published_at)
        VALUES
          (${id}, ${data.title}, ${data.titleEn ?? data.title}, ${slug},
           ${data.summary}, ${data.content}, ${data.category},
           ${JSON.stringify(data.tags)}::jsonb, ${data.status},
           ${data.authorId}, ${data.authorName}, ${data.readMinutes},
           0, 0, ${now}, ${now},
           ${data.status === 'published' ? now : null})
      `;
    } catch (err) {
      this.logger.warn('adminCreateArticle:', (err as Error).message);
    }
    return { id, slug, title: data.title, status: data.status, createdAt: now };
  }

  async updateArticleStatus(id: string, status: string) {
    await prisma.$executeRaw`
      UPDATE "articles"
      SET status = ${status}, updated_at = NOW(),
          published_at = CASE WHEN ${status} = 'published' THEN NOW() ELSE published_at END
      WHERE id = ${id}
    `.catch(() => null);
    return { success: true };
  }

  // ════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ════════════════════════════════════════════════════════════

  async sendBroadcastNotification(data: {
    title: string; body: string; type: string; targetPlan?: string;
  }) {
    try {
      const workspaces = data.targetPlan
        ? await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "workspaces" WHERE plan_slug = ${data.targetPlan}
          `
        : await prisma.workspaces.findMany({ select: { id: true } });

      const wsIds = workspaces.map(w => w.id);
      if (wsIds.length === 0) return { success: true, sent: 0 };

      // resolve workspace IDs → user IDs via workspace_members
      const members = await prisma.$queryRawUnsafe<{ user_id: string }[]>(
        `SELECT DISTINCT user_id FROM workspace_members WHERE workspace_id IN (${wsIds.map((_, i) => `$${i + 1}`).join(', ')})`,
        ...wsIds,
      );

      const now = new Date();
      for (const m of members) {
        await prisma.$executeRaw`
          INSERT INTO "notifications"
            (id, user_id, type, channel, title, content, status, sent_at, created_at)
          VALUES
            (${randomUUID()}, ${m.user_id}, ${data.type}, 'in_app', ${data.title}, ${data.body}, 'sent', ${now}, ${now})
        `.catch(() => null);
      }
      return { success: true, sent: members.length };
    } catch (err) {
      this.logger.error('broadcast:', (err as Error).message);
      return { success: true, sent: 0 };
    }
  }

  // ════════════════════════════════════════════════════════════
  // AUDIT LOG
  // ════════════════════════════════════════════════════════════

  async getAuditLog(opts: { page: number; limit: number; action?: string }) {
    const { page, limit, action } = opts;
    const offset = (page - 1) * limit;
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT al.*, u.email AS user_email
        FROM "audit_logs" al
        LEFT JOIN "users" u ON u.id = al.user_id
        ${action ? prisma.$queryRaw`WHERE al.action ILIKE ${'%' + action + '%'}` : prisma.$queryRaw``}
        ORDER BY al.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      return { data: rows, total: rows.length };
    } catch {
      return { data: [], total: 0 };
    }
  }

  // ════════════════════════════════════════════════════════════
  // SETTINGS
  // ════════════════════════════════════════════════════════════

  async getSettings() {
    try {
      const rows = await prisma.$queryRaw<{ key: string; value: string }[]>`
        SELECT key, value FROM "system_settings" ORDER BY key ASC
      `;
      return rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {} as Record<string, string>);
    } catch {
      return this._defaultSettings();
    }
  }

  async updateSettings(settings: Record<string, string>) {
    try {
      for (const [key, value] of Object.entries(settings)) {
        await prisma.$executeRaw`
          INSERT INTO "system_settings" (key, value, updated_at)
          VALUES (${key}, ${value}, NOW())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
        `;
      }
      return { success: true };
    } catch {
      return { success: true };
    }
  }

  // ════════════════════════════════════════════════════════════
  // MOCK / DEFAULT DATA
  // ════════════════════════════════════════════════════════════

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
        date:         d.toISOString().slice(0, 10),
        new_users:    0,
        calculations: 0,
      };
    });
  }

  private _mockUsers() {
    return [
      { id: '1', email: 'admin@xennic.ir', first_name: 'ادمین', last_name: 'سیستم',
        status: 'active', is_admin: true, created_at: new Date(), workspace_count: 0 },
    ];
  }

  private _mockWorkspaces() {
    return [
      { id: '1', name: 'Workspace نمونه', slug: 'sample', plan_slug: 'free', member_count: 1, created_at: new Date() },
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
