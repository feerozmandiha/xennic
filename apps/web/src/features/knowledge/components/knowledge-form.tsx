'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import { X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth.store';
import { useToast }     from '@/stores/toast.store';
import { apiClient }    from '@/lib/api/client';

interface Props {
  open:    boolean;
  onClose: () => void;
}

const DIFFICULTIES = [
  { value: 'beginner',     label: 'مبتدی' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced',     label: 'پیشرفته' },
  { value: 'expert',       label: 'متخصص' },
];

export function NewKnowledgeDialog({ open, onClose }: Props) {
  const t           = useTranslations('knowledge');
  const tCommon     = useTranslations('common');
  const params      = useParams();
  const locale      = (params?.locale as string) ?? 'fa';
  const router      = useRouter();
  const wsId        = useAuthStore(s => s.workspaceId);
  const queryClient = useQueryClient();
  const toast       = useToast();

  const [title, setTitle]     = useState('');
  const [slug, setSlug]       = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [error, setError]           = useState('');

  const mutation = useMutation({
    mutationFn: (body: any) =>
      apiClient.post<any>('/knowledge', body),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge', wsId] });
      toast.success('مقاله ایجاد شد');
      handleClose();
      router.push(`/${locale}/knowledge/${res.data.id}/edit`);
    },
    onError: (err: any) => {
      setError(err?.message ?? 'خطا در ایجاد مقاله');
    },
  });

  function handleClose() {
    setTitle(''); setSlug(''); setDifficulty(''); setError('');
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('عنوان مقاله الزامی است'); return; }
    if (!slug.trim()) { setError('slug مقاله الزامی است'); return; }
    setError('');
    mutation.mutate({
      slug: slug.trim(),
      content: { title: title.trim() },
      difficulty: difficulty || undefined,
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2
                     rounded-[var(--radius-xl)] border border-[hsl(var(--border))]
                     bg-[hsl(var(--card))] shadow-xl p-6 animate-fade-in
                     focus:outline-none"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-[hsl(var(--primary))]" />
              </div>
              <Dialog.Title className="font-semibold text-base">
                {t('newArticle')}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.2)] rounded-[var(--radius)] px-3 py-2 text-center">
                {error}
              </div>
            )}

            <Input
              label="عنوان"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="عنوان مقاله"
              required
              autoFocus
              disabled={mutation.isPending}
            />

            <Input
              label={t('slug')}
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="مثال: understanding-arc-flash"
              required
              disabled={mutation.isPending}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium">سطح دشواری</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                disabled={mutation.isPending}
                className="flex w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50"
              >
                <option value="">بدون سطح</option>
                {DIFFICULTIES.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
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

          <p className="text-xs text-[hsl(var(--muted-foreground))] text-center mt-4">
            پس از ایجاد، می‌توانید محتوا و دسته‌بندی را در صفحه ویرایش تکمیل کنید
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
