'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api/client';

interface UsageStats {
  planSlug: string;
  calculations: { used: number; limit: number };
  aiRequests: { used: number; limit: number };
}

export function usePlan() {
  const wsId = useAuthStore(s => s.workspaceId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['usage', wsId],
    queryFn:  () => apiClient.get<{ success: boolean; data: UsageStats }>(`/workspaces/${wsId}/subscription/usage`),
    enabled:  !!wsId,
    staleTime: 60_000,
  });

  const planSlug = data?.data?.planSlug ?? 'free';
  const isFree   = planSlug === 'free';
  const isPro    = planSlug === 'pro';
  const isEnterprise = planSlug === 'enterprise';

  const calcLimit  = data?.data?.calculations?.limit ?? 100;
  const calcUsed   = data?.data?.calculations?.used ?? 0;
  const aiLimit    = data?.data?.aiRequests?.limit ?? 10;
  const aiUsed     = data?.data?.aiRequests?.used ?? 0;

  return {
    planSlug,
    isFree,
    isPro,
    isEnterprise,
    calcUsed,
    calcLimit,
    aiUsed,
    aiLimit,
    isLoading,
    error,
  };
}
