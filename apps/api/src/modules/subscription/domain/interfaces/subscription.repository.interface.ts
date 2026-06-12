import type { PlanEntity } from '../entities/plan.entity.js';
import type { SubscriptionEntity } from '../entities/subscription.entity.js';

export interface ISubscriptionRepository {
  // ── Plans ────────────────────────────────────────────────────────────────
  findAllPlans(): Promise<PlanEntity[]>;
  findPlanById(id: string): Promise<PlanEntity | null>;
  findPlanBySlug(slug: string): Promise<PlanEntity | null>;

  // ── Subscriptions ─────────────────────────────────────────────────────────
  save(subscription: SubscriptionEntity): Promise<void>;
  findById(id: string): Promise<SubscriptionEntity | null>;
  findActiveByWorkspace(workspaceId: string): Promise<SubscriptionEntity | null>;
  findAllByWorkspace(workspaceId: string): Promise<SubscriptionEntity[]>;

  // ── Usage ─────────────────────────────────────────────────────────────────
  logUsage(workspaceId: string, feature: string, amount?: number): Promise<void>;
  getUsageThisMonth(workspaceId: string, feature: string): Promise<number>;
}
