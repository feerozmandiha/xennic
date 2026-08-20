import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { KnowledgeAccessTier } from '../../../knowledge/domain/value-objects/knowledge-access-tier.vo.js';

@Injectable()
export class PlanEntitlementService {
  async getWorkspaceKnowledgeTier(
    workspaceId: string | null | undefined,
  ): Promise<KnowledgeAccessTier | null> {
    if (!workspaceId) return null;
    const sub = await prisma.subscriptions.findFirst({
      where: {
        workspace_id: workspaceId,
        status: 'active',
        OR: [{ ends_at: null }, { ends_at: { gt: new Date() } }],
      },
      include: { plan: true },
      orderBy: { created_at: 'desc' },
    });
    if (!sub?.plan) return 'basic';
    switch (sub.plan.slug.toLowerCase()) {
      case 'enterprise':
      case 'organization':
      case 'business':
        return 'enterprise';
      case 'pro':
      case 'professional':
        return 'pro';
      default:
        return 'basic';
    }
  }
}
