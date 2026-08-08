/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '@/lib/api/client';

// ─── Types ──────────────────────────────────────────────────

export interface KnowledgeArticle {
  id: string;
  slug: string;
  status: string;
  visibility: string;
  language: string;
  version: number;
  isActive: boolean;
  content: { title?: string; doc?: any; summary?: string; [k: string]: any };
  searchText?: string | null;
  readingTime?: number | null;
  difficulty?: string | null;
  authorId?: string | null;
  reviewerId?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  reviewedAt?: string | null;
  archivedAt?: string | null;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface KnowledgeRelated {
  standards: {
    id: string;
    code: string;
    title: string;
    organization: string;
    version: string;
    status: string;
  }[];
  taxonomy: { id: string; taxonomy_type: string; taxonomy_id: string }[];
  analytics: { views: number; likes: number; bookmarks: number; lastViewedAt?: string } | null;
  formulas: any[];
  examples: any[];
  versions: { version: number; createdAt: string }[];
  related: {
    id: string;
    slug: string;
    title: string;
    difficulty?: string;
    readingTime?: number;
    publishedAt?: string;
  }[];
}

export interface HubOverview {
  stats: {
    totalArticles: number;
    totalStandards: number;
    totalCategories: number;
    totalTopics: number;
  };
  categories: { id: string; slug: string; name: string; name_en?: string; icon?: string }[];
  topics: { id: string; slug: string; name: string; name_en?: string }[];
  recent: {
    id: string;
    slug: string;
    title: string;
    difficulty?: string;
    readingTime?: number;
    publishedAt?: string;
    views: number;
    standards: { code: string; title: string; organization: string }[];
  }[];
  mostViewed: { id: string; slug?: string; title?: string; views: number }[];
}

export interface TaxonomyItem {
  id: string;
  slug: string;
  name: string;
  name_en?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
}

// ─── Public API (no auth required) ──────────────────────────

export const publicKnowledgeApi = {
  list: (
    params: {
      page?: number;
      limit?: number;
      locale?: string;
      q?: string;
      difficulty?: string;
      standard?: string;
      taxonomyType?: string;
      taxonomyId?: string;
    } = {},
  ) => {
    const sp = new URLSearchParams();
    if (params.page) sp.set('page', String(params.page));
    if (params.limit) sp.set('limit', String(params.limit));
    if (params.locale) sp.set('locale', params.locale);
    if (params.q) sp.set('q', params.q);
    if (params.difficulty) sp.set('difficulty', params.difficulty);
    if (params.standard) sp.set('standard', params.standard);
    if (params.taxonomyType) sp.set('taxonomyType', params.taxonomyType);
    if (params.taxonomyId) sp.set('taxonomyId', params.taxonomyId);
    return apiClient.get<Paginated<KnowledgeArticle>>(`/public/knowledge?${sp.toString()}`);
  },

  hubOverview: () =>
    apiClient.get<{ success: boolean; data: HubOverview }>('/public/knowledge/hub/overview'),

  getBySlug: (slug: string) =>
    apiClient.get<{ success: boolean; data: KnowledgeArticle }>(
      `/public/knowledge/${encodeURIComponent(slug)}`,
    ),

  getRelated: (slug: string) =>
    apiClient.get<{ success: boolean; data: KnowledgeRelated }>(
      `/public/knowledge/${encodeURIComponent(slug)}/related`,
    ),

  recordView: (slug: string) =>
    apiClient
      .post<{
        success: boolean;
        message: string;
      }>(`/public/knowledge/${encodeURIComponent(slug)}/view`)
      .catch(() => ({ success: true, message: 'ok' }) as any),

  categories: (search?: string, limit = 100) => {
    const sp = new URLSearchParams();
    if (search) sp.set('search', search);
    sp.set('limit', String(limit));
    return apiClient
      .get<{ success: boolean; data: TaxonomyItem[] }>(`/categories?${sp.toString()}`)
      .catch(() =>
        apiClient.get<{ success: boolean; data: TaxonomyItem[] }>(
          `/public/taxonomy/categories?${sp.toString()}`,
        ),
      );
  },
  topics: (search?: string, limit = 100) => {
    const sp = new URLSearchParams();
    if (search) sp.set('search', search);
    sp.set('limit', String(limit));
    return apiClient
      .get<{ success: boolean; data: TaxonomyItem[] }>(`/topics?${sp.toString()}`)
      .catch(() =>
        apiClient.get<{ success: boolean; data: TaxonomyItem[] }>(
          `/public/taxonomy/topics?${sp.toString()}`,
        ),
      );
  },
  tags: (search?: string, limit = 100) => {
    const sp = new URLSearchParams();
    if (search) sp.set('search', search);
    sp.set('limit', String(limit));
    return apiClient
      .get<{ success: boolean; data: TaxonomyItem[] }>(`/tags?${sp.toString()}`)
      .catch(() =>
        apiClient.get<{ success: boolean; data: TaxonomyItem[] }>(
          `/public/taxonomy/tags?${sp.toString()}`,
        ),
      );
  },
  disciplines: (search?: string, limit = 100) => {
    const sp = new URLSearchParams();
    if (search) sp.set('search', search);
    sp.set('limit', String(limit));
    return apiClient
      .get<{ success: boolean; data: TaxonomyItem[] }>(`/disciplines?${sp.toString()}`)
      .catch(() =>
        apiClient.get<{ success: boolean; data: TaxonomyItem[] }>(
          `/public/taxonomy/disciplines?${sp.toString()}`,
        ),
      );
  },
  audiences: (search?: string, limit = 100) => {
    const sp = new URLSearchParams();
    if (search) sp.set('search', search);
    sp.set('limit', String(limit));
    return apiClient
      .get<{ success: boolean; data: TaxonomyItem[] }>(`/audiences?${sp.toString()}`)
      .catch(() =>
        apiClient.get<{ success: boolean; data: TaxonomyItem[] }>(
          `/public/taxonomy/audiences?${sp.toString()}`,
        ),
      );
  },
};

// ─── Authenticated API (workspace) ──────────────────────────

export const knowledgeApi = {
  search: (params: {
    q?: string;
    status?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set('q', params.q);
    if (params.status) sp.set('status', params.status);
    if (params.difficulty) sp.set('difficulty', params.difficulty);
    sp.set('page', String(params.page ?? 1));
    sp.set('limit', String(params.limit ?? 20));
    return apiClient.get<Paginated<KnowledgeArticle>>(`/knowledge/search?${sp.toString()}`);
  },

  get: (id: string) =>
    apiClient.get<{ success: boolean; data: KnowledgeArticle }>(`/knowledge/${id}`),

  getTaxonomy: (id: string) =>
    apiClient.get<{
      success: boolean;
      data: { id: string; taxonomy_type: string; taxonomy_id: string }[];
    }>(`/knowledge/${id}/taxonomy`),

  getStandards: (id: string) =>
    apiClient.get<{
      success: boolean;
      data: {
        id: string;
        code: string;
        title: string;
        organization: string;
        version: string;
        status: string;
      }[];
    }>(`/knowledge/${id}/standards`),

  getRelatedCalculations: (id: string) =>
    apiClient.get<{ success: boolean; data: any[] }>(`/knowledge/${id}/related-calculations`),

  getAnalytics: (id: string) =>
    apiClient.get<{ success: boolean; data: any }>(`/knowledge/${id}/analytics`),

  getVersions: (id: string) =>
    apiClient.get<{ success: boolean; data: any[] }>(`/knowledge/${id}/versions`),

  getWorkflow: (id: string) =>
    apiClient.get<{ success: boolean; data: any }>(`/knowledge/${id}/workflow`),

  recordView: (id: string) =>
    apiClient.post(`/knowledge/${id}/view`).catch(() => ({ success: true }) as any),
};

// ─── Standards API ──────────────────────────────────────────

export const standardsApi = {
  list: (params: { q?: string; organization?: string; page?: number; limit?: number } = {}) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set('q', params.q);
    if (params.organization) sp.set('organization', params.organization);
    sp.set('page', String(params.page ?? 1));
    sp.set('limit', String(params.limit ?? 50));
    return apiClient.get<{
      success: boolean;
      data: {
        id: string;
        code: string;
        title: string;
        organization: string;
        version: string;
        status: string;
      }[];
      meta: any;
    }>(`/standards?${sp.toString()}`);
  },
};

// ─── Utility: extract title/summary from content ─────────────

export function getArticleTitle(article: KnowledgeArticle): string {
  return (article.content?.title as string) ?? article.slug ?? 'بدون عنوان';
}

export function getArticleSummary(article: KnowledgeArticle): string {
  const summary = article.content?.summary as string;
  if (summary) return summary;
  // Try extract from doc JSON (tiptap)
  const doc = (article.content as any)?.doc;
  if (doc?.content && Array.isArray(doc.content)) {
    for (const block of doc.content) {
      if (block.type === 'paragraph' && block.content?.[0]?.text) {
        return block.content[0].text.slice(0, 160);
      }
    }
  }
  return '';
}
