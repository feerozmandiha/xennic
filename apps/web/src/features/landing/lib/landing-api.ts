import { apiClient, getToken, getWorkspaceId } from '@/lib/api/client';
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

export async function fetchPublicLandingContent(locale = 'fa'): Promise<LandingContent> {
  try {
    const res = await fetch(`${API_BASE}/landing/content?locale=${locale}`, {
      cache: 'no-store',
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

/**
 * آپلود تصویر از endpoint رسمی storage: POST /storage/upload
 * رکورد فایل در جدول files ذخیره می‌شود.
 */
export async function uploadLandingAsset(
  file: File,
  _purpose?: string,
): Promise<{ fileId: string; url: string; alt?: string }> {
  const token = getToken();
  if (!token) throw new Error('برای آپلود باید وارد شده باشید');
  const workspaceId = getWorkspaceId() ?? '';

  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_BASE}/storage/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(workspaceId ? { 'x-workspace-id': workspaceId } : {}),
    },
    body: form,
  });

  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error?.message ?? 'خطا در آپلود فایل');
  }
  const data = json?.data;
  if (!data?.id) throw new Error('پاسخ storage فاقد شناسه فایل است');
  const url: string | undefined = data.downloadUrl ?? data.url;
  return { fileId: data.id, url: url ?? '', alt: data.originalName ?? file.name };
}

export async function getFileDownloadUrl(fileId: string): Promise<string | undefined> {
  try {
    const json = await apiClient.get<{ success: boolean; data: { downloadUrl?: string } }>(
      `/storage/files/${fileId}`,
    );
    return json?.data?.downloadUrl;
  } catch {
    return undefined;
  }
}
