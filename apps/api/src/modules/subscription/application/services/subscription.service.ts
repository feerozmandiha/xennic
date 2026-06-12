import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import type { ISubscriptionRepository } from '../../domain/interfaces/subscription.repository.interface.js';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity.js';
import { PlanEntity } from '../../domain/entities/plan.entity.js';

// ── Feature keys برای usage tracking ──────────────────────────────────────
export const FEATURE = {
  CALCULATIONS: 'calculations',
  AI_REQUESTS:  'ai_requests',
  STORAGE_GB:   'storage_gb',
} as const;

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  // ── Plans ─────────────────────────────────────────────────────────────────

  async getPlans(): Promise<PlanEntity[]> {
    return this.subscriptionRepository.findAllPlans();
  }

  async getPlan(id: string): Promise<PlanEntity> {
    const plan = await this.subscriptionRepository.findPlanById(id);
    if (!plan) throw new NotFoundException(`Plan "${id}" not found`);
    return plan;
  }

  // ── Subscriptions ─────────────────────────────────────────────────────────

  /**
   * دریافت subscription فعال workspace
   * اگر نباشد، plan رایگان را برمی‌گرداند
   */
  async getActiveSubscription(workspaceId: string): Promise<SubscriptionEntity | null> {
    return this.subscriptionRepository.findActiveByWorkspace(workspaceId);
  }

  /**
   * دریافت plan slug فعال workspace (برای سریع‌ترین دسترسی)
   */
  async getActivePlanSlug(workspaceId: string): Promise<string> {
    const sub = await this.subscriptionRepository.findActiveByWorkspace(workspaceId);
    return sub?.planSlug ?? 'free';
  }

  /**
   * دریافت plan فعال workspace (شامل features)
   */
  async getActivePlan(workspaceId: string): Promise<PlanEntity> {
    const sub = await this.subscriptionRepository.findActiveByWorkspace(workspaceId);

    if (sub) {
      const plan = await this.subscriptionRepository.findPlanById(sub.planId);
      if (plan) return plan;
    }

    // fallback: plan رایگان
    const freePlan = await this.subscriptionRepository.findPlanBySlug('free');
    if (!freePlan) throw new NotFoundException('Free plan not found in database');
    return freePlan;
  }

  /**
   * تاریخچه subscriptions workspace
   */
  async getWorkspaceSubscriptions(workspaceId: string): Promise<SubscriptionEntity[]> {
    return this.subscriptionRepository.findAllByWorkspace(workspaceId);
  }

  /**
   * subscribe کردن workspace به یک plan
   */
  async subscribe(
    workspaceId: string,
    planId: string,
    expiresAt?: Date,
  ): Promise<SubscriptionEntity> {
    // بررسی plan وجود دارد
    const plan = await this.subscriptionRepository.findPlanById(planId);
    if (!plan) throw new NotFoundException(`Plan "${planId}" not found`);

    // اگر subscription فعال وجود دارد، لغو کن
    const existing = await this.subscriptionRepository.findActiveByWorkspace(workspaceId);
    if (existing && existing.planId === planId) {
      throw new ConflictException('Workspace already has an active subscription to this plan');
    }
    if (existing) {
      existing.cancel();
      await this.subscriptionRepository.save(existing);
    }

    const subscription = SubscriptionEntity.create({
      workspaceId,
      planId,
      planSlug: plan.slug,
      expiresAt: expiresAt ?? null,
    });

    await this.subscriptionRepository.save(subscription);
    return subscription;
  }

  /**
   * لغو subscription فعال
   */
  async cancel(subscriptionId: string, workspaceId: string): Promise<SubscriptionEntity> {
    const sub = await this.subscriptionRepository.findById(subscriptionId);
    if (!sub) throw new NotFoundException(`Subscription "${subscriptionId}" not found`);
    if (sub.workspaceId !== workspaceId) throw new ForbiddenException('Access denied');
    if (sub.isCancelled()) throw new ConflictException('Subscription already cancelled');

    sub.cancel();
    await this.subscriptionRepository.save(sub);
    return sub;
  }

  // ── Usage Tracking ────────────────────────────────────────────────────────

  async logUsage(workspaceId: string, feature: string, amount = 1): Promise<void> {
    await this.subscriptionRepository.logUsage(workspaceId, feature, amount);
  }

  /**
   * بررسی می‌کند آیا workspace به حد limit رسیده یا نه
   * @returns true اگر هنوز مجاز است
   */
  async checkLimit(workspaceId: string, feature: string): Promise<{
    allowed: boolean;
    used: number;
    limit: number;
    planSlug: string;
  }> {
    const plan  = await this.getActivePlan(workspaceId);
    const used  = await this.subscriptionRepository.getUsageThisMonth(workspaceId, feature);

    let limit = -1; // unlimited by default

    switch (feature) {
      case FEATURE.CALCULATIONS:
        limit = plan.features.calculations_month;
        break;
      case FEATURE.AI_REQUESTS:
        limit = plan.features.ai_requests_month;
        break;
    }

    const allowed = limit === -1 || used < limit;

    return { allowed, used, limit, planSlug: plan.slug };
  }

  /**
   * بررسی و ثبت usage در یک مرحله
   * اگر به حد limit رسیده باشد، خطا می‌دهد
   */
  async consumeQuota(workspaceId: string, feature: string): Promise<void> {
    const check = await this.checkLimit(workspaceId, feature);

    if (!check.allowed) {
      throw new ForbiddenException(
        `Monthly ${feature} limit reached (${check.used}/${check.limit}). ` +
        `Upgrade to Pro for unlimited access.`
      );
    }

    await this.logUsage(workspaceId, feature, 1);
  }

  // ── Usage Stats ───────────────────────────────────────────────────────────

  async getUsageStats(workspaceId: string): Promise<{
    planSlug: string;
    calculations: { used: number; limit: number };
    ai_requests: { used: number; limit: number };
  }> {
    const plan     = await this.getActivePlan(workspaceId);
    const calcUsed = await this.subscriptionRepository.getUsageThisMonth(workspaceId, FEATURE.CALCULATIONS);
    const aiUsed   = await this.subscriptionRepository.getUsageThisMonth(workspaceId, FEATURE.AI_REQUESTS);

    return {
      planSlug: plan.slug,
      calculations: {
        used:  calcUsed,
        limit: plan.features.calculations_month,
      },
      ai_requests: {
        used:  aiUsed,
        limit: plan.features.ai_requests_month,
      },
    };
  }
}
