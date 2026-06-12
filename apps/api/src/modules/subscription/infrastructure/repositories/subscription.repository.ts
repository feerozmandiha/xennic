import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { ISubscriptionRepository } from '../../domain/interfaces/subscription.repository.interface.js';
import { PlanEntity, type PlanFeatures } from '../../domain/entities/plan.entity.js';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity.js';

@Injectable()
export class SubscriptionRepository implements ISubscriptionRepository {

  // ══════════════════════════════════════════════════════════════════════════
  // PLANS
  // ══════════════════════════════════════════════════════════════════════════

  async findAllPlans(): Promise<PlanEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "plans" WHERE is_active = true ORDER BY monthly_price ASC
      `;
      return rows.map(r => this._mapPlan(r));
    } catch (err) {
      console.error('SubscriptionRepository.findAllPlans error:', (err as Error).message);
      return [];
    }
  }

  async findPlanById(id: string): Promise<PlanEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "plans" WHERE id = ${id} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._mapPlan(rows[0]);
    } catch { return null; }
  }

  async findPlanBySlug(slug: string): Promise<PlanEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "plans" WHERE slug = ${slug} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._mapPlan(rows[0]);
    } catch { return null; }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SUBSCRIPTIONS
  // ══════════════════════════════════════════════════════════════════════════

  async save(sub: SubscriptionEntity): Promise<void> {
    try {
      const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM "subscriptions" WHERE id = ${sub.id} LIMIT 1
      `;

      if (existing && existing.length > 0) {
        await prisma.$executeRaw`
          UPDATE "subscriptions" SET
            status       = ${sub.status},
            ends_at      = ${sub.expiresAt},
            cancelled_at = ${sub.cancelledAt},
            updated_at   = ${sub.updatedAt}
          WHERE id = ${sub.id}
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO "subscriptions"
            (id, workspace_id, plan_id, status, starts_at, ends_at, cancelled_at, created_at, updated_at)
          VALUES
            (${sub.id}, ${sub.workspaceId}, ${sub.planId}, ${sub.status},
             ${sub.startsAt}, ${sub.expiresAt}, ${sub.cancelledAt},
             ${sub.createdAt}, ${sub.updatedAt})
        `;
      }
    } catch (err) {
      throw new Error(`SubscriptionRepository.save failed: ${(err as Error).message}`);
    }
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT s.*, p.slug as plan_slug
        FROM "subscriptions" s
        JOIN "plans" p ON p.id = s.plan_id
        WHERE s.id = ${id} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._mapSub(rows[0]);
    } catch { return null; }
  }

  async findActiveByWorkspace(workspaceId: string): Promise<SubscriptionEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT s.*, p.slug as plan_slug
        FROM "subscriptions" s
        JOIN "plans" p ON p.id = s.plan_id
        WHERE s.workspace_id = ${workspaceId}
          AND s.status = 'active'
          AND (s.ends_at IS NULL OR s.ends_at > NOW())
        ORDER BY s.created_at DESC
        LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._mapSub(rows[0]);
    } catch { return null; }
  }

  async findAllByWorkspace(workspaceId: string): Promise<SubscriptionEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT s.*, p.slug as plan_slug
        FROM "subscriptions" s
        JOIN "plans" p ON p.id = s.plan_id
        WHERE s.workspace_id = ${workspaceId}
        ORDER BY s.created_at DESC
      `;
      return rows.map(r => this._mapSub(r));
    } catch { return []; }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // USAGE
  // ══════════════════════════════════════════════════════════════════════════

  async logUsage(workspaceId: string, feature: string, amount = 1): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO "usage_logs" (id, workspace_id, feature, amount, logged_at)
        VALUES (${crypto.randomUUID()}, ${workspaceId}, ${feature}, ${amount}, NOW())
      `;
    } catch (err) {
      console.error('SubscriptionRepository.logUsage error:', (err as Error).message);
    }
  }

  async getUsageThisMonth(workspaceId: string, feature: string): Promise<number> {
    try {
      const result = await prisma.$queryRaw<{ total: string }[]>`
        SELECT COALESCE(SUM(amount), 0)::text as total
        FROM "usage_logs"
        WHERE workspace_id = ${workspaceId}
          AND feature      = ${feature}
          AND logged_at   >= date_trunc('month', NOW())
      `;
      return Number(result[0]?.total ?? 0);
    } catch { return 0; }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MAPPERS
  // ══════════════════════════════════════════════════════════════════════════

  private _mapPlan(row: any): PlanEntity {
    let features: PlanFeatures;
    try {
      features = typeof row.features === 'string'
        ? JSON.parse(row.features)
        : row.features;
    } catch {
      features = {
        projects: 3, calculations_month: 100, ai_requests_month: 50,
        storage_gb: 1, api_access: false, report_formats: ['pdf'],
      };
    }

    return PlanEntity.reconstitute({
      id:           row.id,
      name:         row.name,
      slug:         row.slug,
      monthlyPrice: Number(row.monthly_price),
      yearlyPrice:  Number(row.yearly_price),
      features,
      isActive:     row.is_active,
      createdAt:    row.created_at,
      updatedAt:    row.updated_at,
    });
  }

  private _mapSub(row: any): SubscriptionEntity {
    return SubscriptionEntity.reconstitute({
      id:          row.id,
      workspaceId: row.workspace_id,
      planId:      row.plan_id,
      planSlug:    row.plan_slug ?? 'free',
      status:      row.status,
      startsAt:    row.starts_at,
      expiresAt:   row.ends_at     ?? null,
      cancelledAt: row.cancelled_at ?? null,
      createdAt:   row.created_at,
      updatedAt:   row.updated_at,
    });
  }
}
