import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';

const API_BASE = typeof window !== 'undefined'
  ? `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`
  : `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`;

interface Comment {
  id: string; articleId: string; userId: string;
  authorName: string; authorAvatar: string | null;
  content: string; parentId: string | null;
  likes: number; likedBy: string[];
  isEdited: boolean; createdAt: Date; updatedAt: Date;
  replies: Comment[];
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return useAuthStore.getState().token;
}

export function useComments(articleId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['comments', articleId];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/articles/${articleId}/comments`);
      const json = await res.json();
      return (json.data ?? []) as Comment[];
    },
    enabled: !!articleId,
  });

  const create = useMutation({
    mutationFn: async (data: { content: string; parentId?: string }) => {
      const token = getToken();
      const res = await fetch(`${API_BASE}/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'خطا در ثبت نظر');
      return json.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const update = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const token = getToken();
      const res = await fetch(`${API_BASE}/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'خطا در ویرایش نظر');
      return json.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const token = getToken();
      const res = await fetch(`${API_BASE}/comments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'خطا در حذف نظر');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const toggleLike = useMutation({
    mutationFn: async (id: string) => {
      const token = getToken();
      const res = await fetch(`${API_BASE}/comments/${id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'خطا');
      return json.data as { likes: number; liked: boolean };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { query, create, update, remove, toggleLike };
}
