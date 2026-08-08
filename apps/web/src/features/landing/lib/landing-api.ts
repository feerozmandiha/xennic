import { apiClient } from '@/lib/api/client';
import {
  DEFAULT_LANDING_CONTENT,
  mergeLandingContent,
  type CmsImage,
  type LandingContent,
} from '../types/landing-content';

const API_BASE =
  typeof window !== 'undefined'
    ? `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/v1`
    : `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`;

/** محتوای منتشرشده (سرور/کلاینت). در خطا به پیش‌فرض برمی‌گردد. */
export async function fetchPublicLandingContent(locale = 'fa'): Promise<LandingContent> {
  try {
    const res = await fetch(`${API_BASE}/landing/content?locale=${locale}`, {
      next: { revalidate: 60, tags: ['landing-cms'] },
    });
    if (!res.ok) return structuredClone(DEFAULT_LANDING_CONTENT);
    const json = await res.json();
    return mergeLandingContent(json?.data);
  } catch {
    return structuredClone(DEFAULT_LANDING_CONTENT);
  }
}

export async function fetchDraftLandingContent(locale = 'fa') {
  return apiClient.get<{
    success: boolean;
    data: {
      content: LandingContent;
      published: boolean;
      updatedAt: string | null;
      versionNote: string | null;
    };
  }>(`/admin/landing/content?locale=${locale}`);
}

export async function saveDraftLandingContent(
  content: LandingContent,
  versionNote?: string,
  locale = 'fa',
) {
  return apiClient.put<{ success: boolean; data: { content: LandingContent } }>(
    `/admin/landing/content?locale=${locale}`,
    { content, versionNote, locale },
  );
}

export async function publishLandingContent(published = true, versionNote?: string) {
  return apiClient.post<{ success: true }>('/admin/landing/publish', { published, versionNote });
}

export async function resetLandingContent() {
  return apiClient.post<{ success: true; data: LandingContent }>('/admin/landing/reset', {});
}

/** آپلود تصویر از مسیر ادمین CMS (با استفاده از storage در بک‌اند). */
export async function uploadLandingAsset(
  file: File,
  purpose?: string,
): Promise<{ fileId: string; url: string; alt?: string }> {
  const form = new FormData();
  form.append('file', file);
  if (purpose) form.append('purpose', purpose);
  const json = await apiClient.post<{ success: boolean; data: CmsImage }>(
    '/admin/landing/assets',
    form,
  );
  if (!json.data?.url) throw new Error('آدرس تصویر دریافت نشد');
  return { fileId: json.data.fileId!, url: json.data.url, alt: json.data.alt };
}
