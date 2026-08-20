export type KnowledgeAccessTier = 'free' | 'basic' | 'pro' | 'enterprise';

export const KNOWLEDGE_ACCESS_TIERS: KnowledgeAccessTier[] = ['free', 'basic', 'pro', 'enterprise'];

export const TIER_RANK: Record<KnowledgeAccessTier, number> = {
  free: 0,
  basic: 1,
  pro: 2,
  enterprise: 3,
};

export function canAccess(
  required: KnowledgeAccessTier,
  userTier: KnowledgeAccessTier | null,
): boolean {
  const effective = userTier ?? 'free';
  return TIER_RANK[effective] >= TIER_RANK[required];
}
