import { apiClient, getToken } from '@/lib/api/client';
import type { CmsContent, CmsDocument, CmsMedia } from './types';

const API_BASE =
  typeof window !== 'undefined'
    ? `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`
    : `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`;

export interface ListResult<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export const cmsApi = {
  // Public (no auth)
  async getPublished(slot: string, locale = 'fa'): Promise<CmsContent | null> {
    const res = await fetch(`${API_BASE}/cms/content/${encodeSlot(slot)}?locale=${locale}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data as CmsContent) ?? null;
  },

  // Admin
  list(params?: {
    locale?: string;
    slotPrefix?: string;
    publishedOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    const qs = new URLSearchParams();
    if (params?.locale) qs.set('locale', params.locale);
    if (params?.slotPrefix) qs.set('slotPrefix', params.slotPrefix);
    if (params?.publishedOnly !== undefined) qs.set('publishedOnly', String(params.publishedOnly));
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return apiClient.get<ListResult<CmsContent>>(`/admin/cms/content?${qs.toString()}`);
  },

  getById(id: string) {
    return apiClient.get<{ data: CmsContent }>(`/admin/cms/content/${id}`);
  },

  getBySlot(slot: string, locale = 'fa') {
    return apiClient.get<{ data: CmsContent }>(
      `/admin/cms/slot/${encodeSlot(slot)}?locale=${locale}`,
    );
  },

  upsert(input: { slot: string; locale: string; document: CmsDocument; publish?: boolean }) {
    return apiClient.post<{ data: CmsContent }>(`/admin/cms/content`, input);
  },

  patch(id: string, input: { document: CmsDocument; publish?: boolean }) {
    return apiClient.patch<{ data: CmsContent }>(`/admin/cms/content/${id}`, input);
  },

  publish(id: string) {
    return apiClient.post<{ data: CmsContent }>(`/admin/cms/content/${id}/publish`);
  },

  unpublish(id: string) {
    return apiClient.post<{ data: CmsContent }>(`/admin/cms/content/${id}/unpublish`);
  },

  remove(id: string) {
    return apiClient.delete<{ success: boolean }>(`/admin/cms/content/${id}`);
  },

  async uploadMedia(file: File, slot = 'landing'): Promise<CmsMedia> {
    const form = new FormData();
    form.append('file', file);
    form.append('slot', slot);
    const token = getToken();
    const res = await fetch(`${API_BASE}/admin/cms/media`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const json = await res.json();
    if (!res.ok || json?.success === false) {
      throw new Error(json?.error?.message ?? 'Upload failed');
    }
    return json.data as CmsMedia;
  },
};

function encodeSlot(slot: string): string {
  // encodeURIComponent هر / را هم کد می‌کند؛ برای خوانایی بهتر فقط قسمت‌ها را کد می‌کنیم
  return slot
    .split('/')
    .map((p) => encodeURIComponent(p))
    .join('/');
}
