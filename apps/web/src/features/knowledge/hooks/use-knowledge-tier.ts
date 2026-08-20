'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api/client';
import type { AccessTier } from '../lib/access-tiers';

/**
 * Resolves the current user's knowledge access tier by calling the API.
 * Unauthenticated users get 'free'. Logged-in users without a paid plan
 * get 'basic'. The API returns the highest tier unlocked by any active
 * subscription in their current workspace.
 */
export function useKnowledgeTier() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  const query = useQuery({
    queryKey: ['knowledge-tier', isAuthenticated, token],
    queryFn: async (): Promise<AccessTier> => {
      if (!isAuthenticated || !token) return 'free';
      try {
        const res = await apiClient.get<{ success: boolean; data: { tier: AccessTier } }>(
          '/knowledge/my-tier',
        );
        return res.data?.tier ?? 'basic';
      } catch {
        return 'basic';
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  return {
    tier: query.data ?? (isAuthenticated ? 'basic' : 'free'),
    isLoading: query.isLoading,
    canAccess: (required: AccessTier) => {
      const current = query.data ?? (isAuthenticated ? 'basic' : 'free');
      const rank: Record<AccessTier, number> = { free: 0, basic: 1, pro: 2, enterprise: 3 };
      return rank[current] >= rank[required];
    },
  };
}
