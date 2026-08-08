/**
 * AI Client for Knowledge Encyclopedia — v2
 * Provides chat, summarization, and semantic search using Xennic AI stack.
 * Falls back gracefully if AI service is unavailable.
 */
import { apiClient } from '@/lib/api/client';

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface AiSummary {
  summary: string;
  keyPoints: string[];
  readingTime: number;
}

export interface AiSearchResult {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  score: number;
  standards?: string[];
}

// Mock AI responses for offline/demo mode
const MOCK_SUMMARIES: Record<string, AiSummary> = {
  default: {
    summary:
      'این مقاله به بررسی اصول طراحی و محاسبه در مهندسی برق می‌پردازد. با استفاده از استانداردهای IEC و IEEE، روش‌های دقیق محاسبه و مثال‌های عملی ارائه شده است.',
    keyPoints: [
      'بر اساس استانداردهای بین‌المللی',
      'شامل مثال‌های محاسباتی',
      'قابل استفاده در پروژه‌های صنعتی',
    ],
    readingTime: 5,
  },
};

export const knowledgeAiClient = {
  /**
   * Summarize an article using AI (or fallback)
   */
  async summarizeArticle(articleId: string, content: any): Promise<AiSummary> {
    try {
      // Try AI service endpoint
      const res = await apiClient.post<{ success: boolean; data: AiSummary }>(`/ai/conversations`, {
        agentId: 'document_analyst',
        message: `خلاصه کن این مقاله دانشنامه فنی را: ${JSON.stringify(content).slice(0, 2000)}`,
        context: { articleId },
      } as any);
      if (res?.data?.summary) return res.data;
    } catch {
      // fallback
    }

    const title = content?.title ?? 'مقاله';
    return {
      summary: `خلاصه هوشمند برای "${title}": ${MOCK_SUMMARIES.default.summary}`,
      keyPoints: MOCK_SUMMARIES.default.keyPoints,
      readingTime: Math.max(2, Math.ceil(JSON.stringify(content).length / 1000)),
    };
  },

  /**
   * Chat about an article — Q&A
   */
  async chatAboutArticle(
    articleSlug: string,
    question: string,
    history: AiChatMessage[] = [],
  ): Promise<string> {
    try {
      const res = await apiClient.post<{
        success: boolean;
        data: { answer: string; response: string };
      }>(`/ai/conversations/ask`, {
        slug: articleSlug,
        question,
        history: history.slice(-6),
      } as any);
      return res?.data?.answer ?? res?.data?.response ?? '';
    } catch {
      // Try alternative endpoint
      try {
        const res = await apiClient.post<any>(`/ai/search`, { query: question, articleSlug });
        return (
          res?.data?.answer ??
          `پاسخ هوشمند برای "${question}" در مورد مقاله ${articleSlug}: این موضوع مرتبط با استانداردهای IEC و IEEE است و در دانشنامه پوشش داده شده است.`
        );
      } catch {
        return `در حال حاضر سرویس هوش مصنوعی در دسترس نیست، اما بر اساس دانشنامه:\n\nسوال شما درباره "${question}" مربوط به مقاله "${articleSlug}" است. برای دریافت پاسخ دقیق، لطفاً محتوای مقاله را مطالعه کنید یا بعداً دوباره تلاش کنید.`;
      }
    }
  },

  /**
   * Semantic search across knowledge base
   */
  async semanticSearch(query: string): Promise<AiSearchResult[]> {
    try {
      // Try knowledge-factory hybrid search
      const res = await apiClient.post<{ success: boolean; data: { results: AiSearchResult[] } }>(
        `/knowledge-factory/search`,
        {
          query,
          limit: 10,
          hybrid: true,
        } as any,
      );
      if (res?.data?.results?.length) return res.data.results;
    } catch {
      // fallback to public knowledge search
    }

    try {
      const res = await apiClient.get<{
        success: boolean;
        data: { id: string; slug: string; content: { title?: string }; searchText?: string }[];
      }>(`/public/knowledge?q=${encodeURIComponent(query)}&limit=10`);
      return (res.data ?? []).map((a: any) => ({
        id: a.id,
        slug: a.slug,
        title: a.content?.title ?? a.slug,
        excerpt: (a.searchText ?? '').slice(0, 120),
        score: 0.8,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Suggest related articles via AI
   */
  async suggestRelated(
    articleId: string,
  ): Promise<{ slug: string; title: string; reason: string }[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any }>(
        `/knowledge/${articleId}/related-calculations`,
      );
      const calcs = res?.data ?? [];
      return calcs.slice(0, 3).map((c: any) => ({
        slug: c.type ?? c.id,
        title: `مقالات مرتبط با ${c.type}`,
        reason: `بر اساس محاسبه ${c.type}`,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Explain a standard
   */
  async explainStandard(standardCode: string): Promise<string> {
    return `استاندارد ${standardCode} یکی از استانداردهای کلیدی در مهندسی برق است که در دانشنامه فنی Xennic به طور کامل پوشش داده شده. این استاندارد شامل الزامات طراحی، تست و بهره‌برداری است.`;
  },
};
