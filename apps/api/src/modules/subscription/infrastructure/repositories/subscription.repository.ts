import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import * as crypto from 'crypto';
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
      const rows = await prisma.plans.findMany({
        where: { is_active: true },
        orderBy: { monthly_price: 'asc' },
      });
      return rows.map(r => this._mapPlan(r));
    } catch (err) {
      console.error('SubscriptionRepository.findAllPlans error:', (err as Error).message);
      return [];
    }
  }

  async findPlanById(id: string): Promise<PlanEntity | null> {
    try {
      const row = await prisma.plans.findUnique({ where: { id } });
      if (!row) return null;
      return this._mapPlan(row);
    } catch { return null; }
  }

  async findPlanBySlug(slug: string): Promise<PlanEntity | null> {
    try {
      const row = await prisma.plans.findUnique({ where: { slug } });
      if (!row) return null;
      return this._mapPlan(row);
    } catch { return null; }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SUBSCRIPTIONS
  // ══════════════════════════════════════════════════════════════════════════

  async save(sub: SubscriptionEntity): Promise<void> {
    try {
      const data = {
        workspace_id: sub.workspaceId,
        plan_id: sub.planId,
        status: sub.status,
        starts_at: sub.startsAt,
        ends_at: sub.expiresAt,
        cancelled_at: sub.cancelledAt,
        updated_at: sub.updatedAt,
      };
      await prisma.subscriptions.upsert({
        where: { id: sub.id },
        create: { id: sub.id, ...data, created_at: sub.createdAt },
        update: data,
      });
    } catch (err) {
      throw new Error(`SubscriptionRepository.save failed: ${(err as Error).message}`);
    }
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    try {
      const row = await prisma.subscriptions.findUnique({
        where: { id },
        include: { plan: { select: { slug: true } } },
      });
      if (!row) return null;
      return this._mapSub(row);
    } catch { return null; }
  }

  async findActiveByWorkspace(workspaceId: string): Promise<SubscriptionEntity | null> {
    try {
      const row = await prisma.subscriptions.findFirst({
        where: {
          workspace_id: workspaceId,
          status: 'active',
          OR: [{ ends_at: null }, { ends_at: { gt: new Date() } }],
        },
        include: { plan: { select: { slug: true } } },
        orderBy: { created_at: 'desc' },
      });
      if (!row) return null;
      return this._mapSub(row);
    } catch { return null; }
  }

  async findAllByWorkspace(workspaceId: string): Promise<SubscriptionEntity[]> {
    try {
      const rows = await prisma.subscriptions.findMany({
        where: { workspace_id: workspaceId },
        include: { plan: { select: { slug: true } } },
        orderBy: { created_at: 'desc' },
      });
      return rows.map(r => this._mapSub(r));
    } catch { return []; }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // USAGE
  // ══════════════════════════════════════════════════════════════════════════

  async logUsage(workspaceId: string, feature: string, amount = 1): Promise<void> {
    try {
      await prisma.usage_logs.create({
        data: {
          id: crypto.randomUUID(),
          workspace_id: workspaceId,
          feature,
          amount,
          logged_at: new Date(),
        },
      });
    } catch (err) {
      console.error('SubscriptionRepository.logUsage error:', (err as Error).message);
    }
  }

  async getUsageThisMonth(workspaceId: string, feature: string): Promise<number> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const result = await prisma.usage_logs.aggregate({
        where: {
          workspace_id: workspaceId,
          feature,
          logged_at: { gte: startOfMonth },
        },
        _sum: { amount: true },
      });
      return result._sum.amount ?? 0;
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
      planSlug:    (row.plan?.slug ?? row.plan_slug) ?? 'free',
      status:      row.status,
      startsAt:    row.starts_at,
      expiresAt:   row.ends_at     ?? null,
      cancelledAt: row.cancelled_at ?? null,
      createdAt:   row.created_at,
      updatedAt:   row.updated_at,
    });
  }
}
