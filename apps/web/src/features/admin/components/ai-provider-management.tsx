'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, Plus, RefreshCw, Trash2, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { useToast } from '@/stores/toast.store';
import { apiClient } from '@/lib/api/client';

type Provider = {
  id: string;
  name: string;
  displayName: string;
  providerType: string;
  baseUrl?: string;
  status: string;
  enabled: boolean;
  priority: number;
};

type Model = {
  id: string;
  providerId: string;
  modelId: string;
  displayName: string;
  modelType: string;
  enabled: boolean;
  status: string;
  supportsVision?: boolean;
  supportsEmbedding?: boolean;
};

const PROVIDER_TYPES = [
  'groq',
  'mistral',
  'openai',
  'anthropic',
  'gemini',
  'openrouter',
  'deepseek',
  'ollama',
  'openai_compatible',
  'custom',
];

export function AiProviderManagement() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [editForm, setEditForm] = useState({
    displayName: '',
    baseUrl: '',
    apiKey: '',
    priority: '0',
  });
  const [form, setForm] = useState({
    name: '',
    displayName: '',
    providerType: 'mistral',
    baseUrl: '',
    apiKey: '',
    priority: '0',
  });

  const providersQuery = useQuery({
    queryKey: ['admin', 'ai-providers'],
    queryFn: () => apiClient.get<{ success: boolean; data: Provider[] }>('/admin/ai/providers'),
  });

  const modelsQuery = useQuery({
    queryKey: ['admin', 'ai-models'],
    queryFn: () => apiClient.get<{ success: boolean; data: Model[] }>('/admin/ai/models'),
  });

  const providers = providersQuery.data?.data ?? [];
  const models = modelsQuery.data?.data ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'ai-providers'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'ai-models'] });
  };

  const createProvider = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiClient.post('/admin/ai/providers', body),
    onSuccess: () => {
      invalidate();
      setShowCreate(false);
      setForm({
        name: '',
        displayName: '',
        providerType: 'mistral',
        baseUrl: '',
        apiKey: '',
        priority: '0',
      });
      toast.success('ارائه‌دهنده AI ثبت شد');
    },
    onError: () => toast.error('ثبت ارائه‌دهنده انجام نشد'),
  });

  const updateProvider = useMutation({
    mutationFn: (input: { id: string; body: Record<string, unknown> }) =>
      apiClient.patch(`/admin/ai/providers/${input.id}`, input.body),
    onSuccess: () => {
      invalidate();
      setEditingProvider(null);
      setEditForm({
        displayName: '',
        baseUrl: '',
        apiKey: '',
        priority: '0',
      });
      toast.success('Provider ویرایش شد و credential جدید ذخیره شد');
    },
    onError: () => toast.error('ویرایش Provider ناموفق بود'),
  });

  const providerAction = useMutation({
    mutationFn: async (input: {
      id: string;
      action: 'enable' | 'disable' | 'delete' | 'health' | 'refresh';
    }) => {
      if (input.action === 'delete') {
        return apiClient.delete(`/admin/ai/providers/${input.id}`);
      }
      if (input.action === 'health') {
        return apiClient.post(`/admin/ai/providers/${input.id}/health/check`);
      }
      if (input.action === 'refresh') {
        return apiClient.post(`/admin/ai/discovery/refresh/${input.id}`);
      }
      return apiClient.put(`/admin/ai/providers/${input.id}/${input.action}`);
    },
    onSuccess: () => {
      invalidate();
      toast.success('عملیات با موفقیت انجام شد');
    },
    onError: () => toast.error('عملیات انجام نشد'),
  });

  const inputClass =
    'w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">ارائه‌دهندگان AI</h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            مدیریت endpoint، API key، مدل‌ها و وضعیت Providerها
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm text-[hsl(var(--primary-foreground))]"
        >
          <Plus className="h-4 w-4" />
          Provider جدید
        </button>
      </div>

      {showCreate && (
        <div className="space-y-3 rounded-xl border border-[hsl(var(--border))] p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">ثبت Provider</h3>
            <button onClick={() => setShowCreate(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              className={inputClass}
              placeholder="نام یکتا، مثلاً mistral-production"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="نام نمایشی"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            />
            <select
              className={inputClass}
              value={form.providerType}
              onChange={(e) => setForm({ ...form, providerType: e.target.value })}
            >
              {PROVIDER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              className={inputClass}
              placeholder="Base URL، مثلاً https://api.mistral.ai/v1"
              value={form.baseUrl}
              onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
            />
            <input
              className={inputClass}
              type="password"
              placeholder="API key"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
            />
            <input
              className={inputClass}
              type="number"
              min="0"
              placeholder="Priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              لغو
            </button>
            <button
              disabled={createProvider.isPending || !form.name || !form.displayName || !form.apiKey}
              onClick={() =>
                createProvider.mutate({
                  name: form.name,
                  displayName: form.displayName,
                  providerType: form.providerType,
                  baseUrl: form.baseUrl || undefined,
                  apiKey: form.apiKey,
                  priority: Number(form.priority) || 0,
                  discover: true,
                })
              }
              className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm text-[hsl(var(--primary-foreground))] disabled:opacity-50"
            >
              {createProvider.isPending && <Loader2 className="mr-1 inline h-4 w-4 animate-spin" />}
              ذخیره امن
            </button>
          </div>
        </div>
      )}

      {editingProvider && (
        <div className="space-y-3 rounded-xl border border-blue-300 bg-blue-50/30 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">ویرایش {editingProvider.displayName}</h3>
            <button onClick={() => setEditingProvider(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              className={inputClass}
              placeholder="نام نمایشی"
              value={editForm.displayName}
              onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Base URL"
              value={editForm.baseUrl}
              onChange={(e) => setEditForm({ ...editForm, baseUrl: e.target.value })}
            />
            <input
              className={inputClass}
              type="password"
              placeholder="API key جدید؛ خالی = بدون تغییر"
              value={editForm.apiKey}
              onChange={(e) => setEditForm({ ...editForm, apiKey: e.target.value })}
            />
            <input
              className={inputClass}
              type="number"
              min="0"
              placeholder="Priority"
              value={editForm.priority}
              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditingProvider(null)}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              لغو
            </button>
            <button
              disabled={updateProvider.isPending}
              onClick={() =>
                updateProvider.mutate({
                  id: editingProvider.id,
                  body: {
                    displayName: editForm.displayName || undefined,
                    baseUrl: editForm.baseUrl || undefined,
                    apiKey: editForm.apiKey || undefined,
                    priority: Number(editForm.priority) || 0,
                  },
                })
              }
              className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm text-[hsl(var(--primary-foreground))] disabled:opacity-50"
            >
              {updateProvider.isPending && <Loader2 className="mr-1 inline h-4 w-4 animate-spin" />}
              ذخیره و تعویض کلید
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--secondary)/0.5)]">
            <tr>
              <th className="px-4 py-3 text-right">Provider</th>
              <th className="px-4 py-3 text-right">Endpoint</th>
              <th className="px-4 py-3 text-right">وضعیت</th>
              <th className="px-4 py-3 text-right">مدل‌ها</th>
              <th className="px-4 py-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
            {providersQuery.isLoading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  <Loader2 className="inline h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : providers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-xs">
                  هنوز Providerای ثبت نشده است
                </td>
              </tr>
            ) : (
              providers.map((provider) => {
                const providerModels = models.filter((model) => model.providerId === provider.id);

                return (
                  <tr key={provider.id}>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{provider.displayName}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {provider.providerType} / {provider.name}
                      </div>
                    </td>
                    <td className="max-w-xs break-all px-4 py-3 text-xs">
                      {provider.baseUrl || 'default endpoint'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={provider.enabled ? 'default' : 'secondary'}>
                        {provider.enabled ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          setSelectedProvider(selectedProvider === provider.id ? null : provider.id)
                        }
                        className="text-xs underline"
                      >
                        {providerModels.length} مدل
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProvider(provider);
                            setEditForm({
                              displayName: provider.displayName,
                              baseUrl: provider.baseUrl ?? '',
                              apiKey: '',
                              priority: String(provider.priority ?? 0),
                            });
                          }}
                          className="rounded border px-2 py-1 text-xs"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() =>
                            providerAction.mutate({
                              id: provider.id,
                              action: provider.enabled ? 'disable' : 'enable',
                            })
                          }
                          className="rounded border px-2 py-1 text-xs"
                        >
                          {provider.enabled ? 'غیرفعال' : 'فعال'}
                        </button>
                        <button
                          onClick={() =>
                            providerAction.mutate({
                              id: provider.id,
                              action: 'health',
                            })
                          }
                          className="rounded border px-2 py-1 text-xs"
                        >
                          Health
                        </button>
                        <button
                          onClick={() =>
                            providerAction.mutate({
                              id: provider.id,
                              action: 'refresh',
                            })
                          }
                          className="rounded border px-2 py-1 text-xs"
                        >
                          <RefreshCw className="inline h-3 w-3" /> مدل‌ها
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('این Provider حذف شود؟')) {
                              providerAction.mutate({
                                id: provider.id,
                                action: 'delete',
                              });
                            }
                          }}
                          className="rounded border border-red-200 px-2 py-1 text-xs text-red-600"
                        >
                          <Trash2 className="inline h-3 w-3" /> حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedProvider && (
        <div className="rounded-xl border p-4">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <h3 className="font-semibold">مدل‌های Provider</h3>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {models
              .filter((model) => model.providerId === selectedProvider)
              .map((model) => (
                <div key={model.id} className="rounded-lg border p-3 text-sm">
                  <div className="font-medium">{model.displayName}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    {model.modelId} / {model.modelType}
                  </div>
                  <Badge variant={model.enabled ? 'default' : 'secondary'}>
                    {model.enabled ? 'فعال' : 'غیرفعال'}
                  </Badge>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
