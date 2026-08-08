/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '@/lib/api/client';
import { KnowledgeArticle, Paginated } from './knowledge-api';

export interface Formula {
  id: string;
  knowledge_id: string;
  latex: string;
  mathml?: string | null;
  description_fa?: string | null;
  description_en?: string | null;
  variables: any[];
  calculator_type?: string | null;
  sort_order: number;
  created_at: string;
}

export interface Example {
  id: string;
  knowledge_id: string;
  title_fa: string;
  title_en?: string | null;
  difficulty: string;
  steps: any[];
  answer?: any;
  calculator_type?: string | null;
  sort_order: number;
  created_at: string;
}

export const manageKnowledgeApi = {
  // ─── Articles ───────────────────────────────────────────────
  list: (params: {
    page?: number;
    limit?: number;
    status?: string;
    q?: string;
    difficulty?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params.page) sp.set('page', String(params.page));
    if (params.limit) sp.set('limit', String(params.limit));
    if (params.status) sp.set('status', params.status);
    if (params.q) sp.set('q', params.q);
    if (params.difficulty) sp.set('difficulty', params.difficulty);
    sp.set('limit', String(params.limit ?? 20));
    // use search endpoint
    return apiClient.get<Paginated<KnowledgeArticle>>(`/knowledge/search?${sp.toString()}`);
  },

  dashboardStats: () =>
    apiClient.get<{ success: boolean; data: any }>(`/knowledge/analytics/dashboard`),

  create: (payload: {
    slug?: string;
    content: any;
    language?: string;
    visibility?: string;
    difficulty?: string;
    taxonomy?: any[];
  }) => apiClient.post<{ success: boolean; data: KnowledgeArticle }>(`/knowledge`, payload),

  update: (id: string, payload: any) =>
    apiClient.patch<{ success: boolean; data: KnowledgeArticle }>(`/knowledge/${id}`, payload),

  delete: (id: string) => apiClient.delete(`/knowledge/${id}`),

  publish: (id: string) => apiClient.post(`/knowledge/${id}/publish`),
  archive: (id: string) => apiClient.post(`/knowledge/${id}/archive`),
  restore: (id: string) => apiClient.post(`/knowledge/${id}/restore`),
  requestReview: (id: string, reviewerId: string) =>
    apiClient.post(`/knowledge/${id}/review`, { reviewerId }),

  // ─── Taxonomy ───────────────────────────────────────────────
  getTaxonomy: (id: string) =>
    apiClient.get<{
      success: boolean;
      data: { id: string; taxonomy_type: string; taxonomy_id: string }[];
    }>(`/knowledge/${id}/taxonomy`),
  addTaxonomy: (id: string, taxonomyType: string, taxonomyId: string) =>
    apiClient.post(`/knowledge/${id}/taxonomy`, { taxonomyType, taxonomyId }),
  removeTaxonomy: (id: string, taxonomyAssignmentId: string) =>
    apiClient.delete(`/knowledge/${id}/taxonomy/${taxonomyAssignmentId}`),

  // ─── Standards ──────────────────────────────────────────────
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
  linkStandard: (id: string, standardId: string) =>
    apiClient.post(`/knowledge/${id}/standards`, { standardId }),
  unlinkStandard: (id: string, standardId: string) =>
    apiClient.delete(`/knowledge/${id}/standards/${standardId}`),

  // ─── Formulas ───────────────────────────────────────────────
  listFormulas: (id: string) =>
    apiClient.get<{ success: boolean; data: Formula[] }>(`/knowledge/${id}/formulas`),
  createFormula: (
    id: string,
    payload: {
      latex: string;
      descriptionFa?: string;
      descriptionEn?: string;
      variables?: any[];
      calculatorType?: string;
      sortOrder?: number;
    },
  ) =>
    apiClient.post<{ success: boolean; data: Formula }>(`/knowledge/${id}/formulas`, {
      latex: payload.latex,
      descriptionFa: payload.descriptionFa,
      descriptionEn: payload.descriptionEn,
      variables: payload.variables,
      calculatorType: payload.calculatorType,
      sortOrder: payload.sortOrder,
    }),
  updateFormula: (id: string, formulaId: string, payload: any) =>
    apiClient.patch<{ success: boolean; data: Formula }>(
      `/knowledge/${id}/formulas/${formulaId}`,
      payload,
    ),
  deleteFormula: (id: string, formulaId: string) =>
    apiClient.delete(`/knowledge/${id}/formulas/${formulaId}`),

  // ─── Examples ───────────────────────────────────────────────
  listExamples: (id: string) =>
    apiClient.get<{ success: boolean; data: Example[] }>(`/knowledge/${id}/examples`),
  createExample: (
    id: string,
    payload: {
      titleFa: string;
      titleEn?: string;
      difficulty?: string;
      steps?: any[];
      answer?: any;
      calculatorType?: string;
      sortOrder?: number;
    },
  ) =>
    apiClient.post<{ success: boolean; data: Example }>(`/knowledge/${id}/examples`, {
      titleFa: payload.titleFa,
      titleEn: payload.titleEn,
      difficulty: payload.difficulty,
      steps: payload.steps,
      answer: payload.answer,
      calculatorType: payload.calculatorType,
      sortOrder: payload.sortOrder,
    }),
  updateExample: (id: string, exampleId: string, payload: any) =>
    apiClient.patch<{ success: boolean; data: Example }>(
      `/knowledge/${id}/examples/${exampleId}`,
      payload,
    ),
  deleteExample: (id: string, exampleId: string) =>
    apiClient.delete(`/knowledge/${id}/examples/${exampleId}`),

  // ─── Workflow & Analytics ───────────────────────────────────
  getWorkflow: (id: string) =>
    apiClient.get<{ success: boolean; data: any }>(`/knowledge/${id}/workflow`),
  submitWorkflow: (id: string, comment: string) =>
    apiClient.post(`/knowledge/${id}/workflow/submit`, { comment }),
  approveWorkflow: (id: string, comment: string) =>
    apiClient.post(`/knowledge/${id}/workflow/approve`, { comment }),
  rejectWorkflow: (id: string, comment: string) =>
    apiClient.post(`/knowledge/${id}/workflow/reject`, { comment }),
  getVersions: (id: string) =>
    apiClient.get<{ success: boolean; data: any[] }>(`/knowledge/${id}/versions`),
  getAnalytics: (id: string) =>
    apiClient.get<{ success: boolean; data: any }>(`/knowledge/${id}/analytics`),
};
