import { apiClient } from '@/lib/api/client';
import type {
  AdminProduct,
  AdminVendor,
  Paginated,
  ProductLocale,
  ProductStatus,
  ProductTranslation,
  VendorStatus,
} from './types';

export interface ProductFilters {
  q?: string;
  vendorId?: string;
  category?: string;
  status?: ProductStatus | '';
  locale?: ProductLocale;
  limit?: number;
}

function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export interface ProductPayload {
  vendorId: string;
  type: string;
  category?: string;
  sku?: string;
  price: number;
  currency: string;
  specifications?: Record<string, unknown>;
  translations?: { locale: ProductLocale; title: string; description?: string }[];
}

export type ProductUpdatePayload = Partial<Omit<ProductPayload, 'vendorId'>> & {
  status?: ProductStatus;
};

export const marketplaceAdminApi = {
  // ── Products ───────────────────────────────────────────────────────────
  listProducts: (filters: ProductFilters = {}) =>
    apiClient.get<Paginated<AdminProduct>>(
      `/products${buildQuery({
        q: filters.q,
        vendorId: filters.vendorId,
        category: filters.category,
        status: filters.status,
        locale: filters.locale,
        limit: filters.limit ?? 100,
      })}`,
    ),

  createProduct: (body: ProductPayload) => apiClient.post<AdminProduct>('/products', body),

  updateProduct: (id: string, body: ProductUpdatePayload) =>
    apiClient.patch<AdminProduct>(`/products/${id}`, body),

  deleteProduct: (id: string) => apiClient.delete<{ success: boolean }>(`/products/${id}`),

  // ── Product translations (fa / en) ─────────────────────────────────────
  listTranslations: (id: string) =>
    apiClient.get<ProductTranslation[]>(`/products/${id}/translations`),

  upsertTranslation: (
    id: string,
    locale: ProductLocale,
    body: { title: string; description?: string },
  ) => apiClient.put<ProductTranslation>(`/products/${id}/translations/${locale}`, body),

  deleteTranslation: (id: string, locale: ProductLocale) =>
    apiClient.delete<{ success: boolean }>(`/products/${id}/translations/${locale}`),

  // ── Vendors ────────────────────────────────────────────────────────────
  listVendors: (q?: string) =>
    apiClient.get<Paginated<AdminVendor>>(`/vendors${buildQuery({ q, limit: 200 })}`),

  createVendor: (body: { name: string; slug?: string }) =>
    apiClient.post<AdminVendor>('/vendors', body),

  updateVendor: (id: string, body: { name?: string; status?: VendorStatus }) =>
    apiClient.patch<AdminVendor>(`/vendors/${id}`, body),

  deleteVendor: (id: string) => apiClient.delete<{ success: boolean }>(`/vendors/${id}`),
};

/** پیام خطای قابل‌نمایش از پاسخ API. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: string }).message;
    if (message) return message;
  }
  return fallback;
}
