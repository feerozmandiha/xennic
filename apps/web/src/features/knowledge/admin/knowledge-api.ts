import { apiClient } from '@/lib/api/client';
import type { ApiEnvelope } from './knowledge-intelligence.types';

async function unwrap<T>(request: Promise<ApiEnvelope<T>>): Promise<T> {
  const response = await request;
  return response.data;
}

export const knowledgeApi = {
  get: <T>(path: string) => unwrap(apiClient.get<ApiEnvelope<T>>(path)),
  post: <T>(path: string, body?: unknown) => unwrap(apiClient.post<ApiEnvelope<T>>(path, body)),
  put: <T>(path: string, body?: unknown) => unwrap(apiClient.put<ApiEnvelope<T>>(path, body)),
  patch: <T>(path: string, body?: unknown) => unwrap(apiClient.patch<ApiEnvelope<T>>(path, body)),
  delete: (path: string) => apiClient.delete(path),
};
