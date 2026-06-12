'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient }    from '@/lib/api/client';

interface Props {
  open:    boolean;
  onClose: () => void;
}

export function NewProjectModal({ open, onClose }: Props) {
  const t           = useTranslations('projects');
  const tCommon     = useTranslations('common');
  const wsId        = useAuthStore(s => s.workspaceId);
  const queryClient = useQueryClient();

  const [name, setName]           = useState('');
  const [description, setDesc]    = useState('');
  const [error, setError]         = useState('');

  const mutation = useMutation({
    mutationFn: (body: any) =>
      apiClient.post('/projects', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', wsId] });
      handleClose();
    },
    onError: (err: any) => {
      setError(err?.message ?? 'خطا در ایجاد پروژه');
    },
  });

  function handleClose() {
    setName(''); setDesc(''); setError('');
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('نام پروژه الزامی است'); return; }
    mutation.mutate({ name: name.trim(), description: description.trim() || undefined });
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && handleClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in" />

        {/* Content */}
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2
                     rounded-[var(--radius-xl)] border border-[hsl(var(--border))]
                     bg-[hsl(var(--card))] shadow-xl p-6 animate-fade-in
                     focus:outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                <FolderPlus className="h-4 w-4 text-[hsl(var(--primary))]" />
              </div>
              <Dialog.Title className="font-semibold text-base">
                {t('newProject')}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-[var(--radius)] hover:bg-[hsl(var(--secondary))] transition-colors"
              >
                <X className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.2)] rounded-[var(--radius)] px-3 py-2 text-center">
                {error}
              </div>
            )}

            <Input
              label={t('projectName')}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: پروژه برق‌رسانی کارخانه"
              required
              autoFocus
              disabled={mutation.isPending}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium">
                {t('description')}
                <span className="text-[hsl(var(--muted-foreground))] font-normal text-xs me-1">
                  (اختیاری)
                </span>
              </label>
              <textarea
                value={description}
                onChange={e => setDesc(e.target.value)}
                placeholder="توضیحات پروژه..."
                disabled={mutation.isPending}
                rows={3}
                className="flex w-full rounded-[var(--radius)] border border-[hsl(var(--input))]
                           bg-transparent px-3 py-2 text-sm shadow-sm resize-none
                           placeholder:text-[hsl(var(--muted-foreground))]
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]
                           disabled:opacity-50"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={mutation.isPending}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                loading={mutation.isPending}
              >
                {tCommon('save')}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
