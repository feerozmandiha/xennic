'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, FolderKanban, Users, FileText,
  Plus, Trash2, Calendar, Zap, MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge }    from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuthStore } from '@/stores/auth.store';
import { useToast }     from '@/stores/toast.store';
import { apiClient }    from '@/lib/api/client';
import { cn }           from '@/lib/utils';

const STATUS_VARIANT: Record<string, any> = {
  active:    'success',
  completed: 'secondary',
  archived:  'secondary',
  cancelled: 'destructive',
};

const STATUS_FA: Record<string, string> = {
  active:    'فعال',
  completed: 'تکمیل‌شده',
  archived:  'آرشیو',
  cancelled: 'لغوشده',
};

// ── Add Note Modal ────────────────────────────────────────────────────────────

function AddNoteModal({ projectId, onClose, open }: {
  projectId: string; open: boolean; onClose: () => void;
}) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: () => apiClient.post(`/projects/${projectId}/notes`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-notes', projectId] });
      toast.success('یادداشت اضافه شد');
      setContent('');
      onClose();
    },
    onError: () => toast.error('خطا در ثبت یادداشت'),
  });

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-xl)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl p-6 animate-fade-in focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="font-semibold">یادداشت جدید</Dialog.Title>
            <Dialog.Close className="p-1.5 rounded-[var(--radius)] hover:bg-[hsl(var(--secondary))] transition-colors">
              <span className="text-[hsl(var(--muted-foreground))] text-lg leading-none">×</span>
            </Dialog.Close>
          </div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="یادداشت خود را بنویسید..."
            rows={4}
            autoFocus
            className="w-full resize-none rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 h-9 rounded-[var(--radius)] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--secondary))] transition-colors"
            >
              انصراف
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={!content.trim() || mutation.isPending}
              className="flex-1 h-9 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {mutation.isPending ? 'در حال ثبت...' : 'ثبت'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function ProjectDetailClient({ projectId }: { projectId: string }) {
  const t           = useTranslations('projects');
  const tCommon     = useTranslations('common');
  const params      = useParams();
  const locale      = (params?.locale as string) ?? 'fa';
  const wsId        = useAuthStore(s => s.workspaceId);
  const toast       = useToast();
  const queryClient = useQueryClient();
  const [addNote, setAddNote] = useState(false);

  // Project data
  const { data: proj, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn:  () => apiClient.get<any>(`/projects/${projectId}`),
    enabled:  !!wsId,
  });

  // Notes
  const { data: notesData } = useQuery({
    queryKey: ['project-notes', projectId],
    queryFn:  () => apiClient.get<any>(`/projects/${projectId}/notes`),
    enabled:  !!wsId,
  });

  // Members
  const { data: membersData } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn:  () => apiClient.get<any>(`/projects/${projectId}/members`),
    enabled:  !!wsId,
  });

  // Delete note
  const deleteNote = useMutation({
    mutationFn: (noteId: string) => apiClient.delete(`/projects/${projectId}/notes/${noteId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-notes', projectId] });
      toast.success('یادداشت حذف شد');
    },
  });

  const project = proj?.data;
  const notes   = notesData?.data ?? [];
  const members = membersData?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48 lg:col-span-2" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-[hsl(var(--muted-foreground))]">پروژه یافت نشد</p>
        <a href={`/${locale}/projects`} className="text-[hsl(var(--primary))] text-sm hover:underline mt-2 inline-block">
          بازگشت به پروژه‌ها
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <a
          href={`/${locale}/projects`}
          className="mt-1 p-1.5 rounded-[var(--radius)] hover:bg-[hsl(var(--secondary))] transition-colors shrink-0"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        </a>
        <PageHeader
          title={project.name}
          description={project.description ?? undefined}
          action={
            <Badge variant={STATUS_VARIANT[project.status]}>
              {STATUS_FA[project.status] ?? project.status}
            </Badge>
          }
        />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'وضعیت', value: STATUS_FA[project.status] ?? project.status, icon: '🔖' },
          { label: 'اعضا', value: members.length, icon: '👥' },
          { label: 'یادداشت', value: notes.length, icon: '📝' },
          {
            label: 'تاریخ شروع',
            value: project.startDate
              ? new Date(project.startDate).toLocaleDateString('fa-IR')
              : '—',
            icon: '📅',
          },
        ].map(item => (
          <Card key={item.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{item.label}</p>
                <p className="text-sm font-bold truncate">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Notes */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              یادداشت‌ها
            </CardTitle>
            <button
              onClick={() => setAddNote(true)}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[var(--radius)] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-xs font-medium hover:bg-[hsl(var(--primary)/0.15)] transition-colors"
            >
              <Plus className="h-3 w-3" />
              افزودن
            </button>
          </CardHeader>
          <CardContent className="p-0">
            {notes.length > 0 ? (
              <ul className="divide-y divide-[hsl(var(--border))]">
                {notes.map((note: any) => (
                  <li key={note.id} className="flex items-start gap-3 px-5 py-3 group hover:bg-[hsl(var(--secondary)/0.3)] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed">{note.content}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">
                        {new Date(note.createdAt).toLocaleString('fa-IR')}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteNote.mutate(note.id)}
                      className="p-1 rounded hover:bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-8 w-8 opacity-20 mb-2" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">یادداشتی وجود ندارد</p>
                <button
                  onClick={() => setAddNote(true)}
                  className="text-xs text-[hsl(var(--primary))] hover:underline mt-1"
                >
                  اولین یادداشت را اضافه کنید
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members + Quick Actions */}
        <div className="space-y-4">
          {/* Members */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                {t('members')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {members.length > 0 ? (
                <ul className="divide-y divide-[hsl(var(--border))]">
                  {members.map((m: any) => (
                    <li key={m.id} className="flex items-center gap-3 px-5 py-2.5">
                      <div className="w-7 h-7 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-[hsl(var(--primary))]">
                          {m.userId?.slice(0, 1).toUpperCase() ?? 'U'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs truncate">{m.userId?.slice(0, 8)}...</p>
                        <Badge variant="secondary" className="text-[9px] py-0 mt-0.5">{m.role}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-5 py-6 text-center">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">عضوی وجود ندارد</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick link to Engineering */}
          <Card className="border-dashed">
            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
              <Zap className="h-6 w-6 text-[hsl(var(--primary))] opacity-60" />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                برای این پروژه محاسبه انجام دهید
              </p>
              <a
                href={`/${locale}/engineering`}
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-xs hover:opacity-90 transition-opacity"
              >
                <Zap className="h-3 w-3" />
                محاسبات مهندسی
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddNoteModal
        projectId={projectId}
        open={addNote}
        onClose={() => setAddNote(false)}
      />
    </div>
  );
}
