'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  FolderKanban, Plus, Search,
  Calendar, ArrowUpRight, Trash2,
  LayoutGrid, List, Filter,
} from 'lucide-react';
import { Input }      from '@/components/ui/input';
import { Badge }      from '@/components/ui/badge';
import { Skeleton }   from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import { useToast }     from '@/stores/toast.store';
import { apiClient }    from '@/lib/api/client';
import { cn }           from '@/lib/utils';
import { NewProjectModal } from './new-project-modal';

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'destructive' | 'warning'> = {
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

// ── Confirm Delete Dialog ──────────────────────────────────────────────────────

function ConfirmDialog({ name, onConfirm, onCancel }: {
  name: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in-fast" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm bg-[hsl(var(--card))] rounded-[var(--radius-xl)] border border-[hsl(var(--border))] shadow-[var(--shadow-lg)] p-6 animate-scale-in">
        <div className="w-12 h-12 rounded-full bg-[hsl(var(--destructive)/0.1)] flex items-center justify-center mx-auto mb-4">
          <Trash2 className="h-5 w-5 text-[hsl(var(--destructive))]" />
        </div>
        <h3 className="text-base font-semibold text-center mb-2">حذف پروژه</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] text-center mb-6">
          آیا از حذف <span className="font-medium text-[hsl(var(--foreground))]">«{name}»</span> مطمئن هستید؟
          این عمل قابل بازگشت نیست.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-9 rounded-[var(--radius)] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--secondary))] transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-9 rounded-[var(--radius)] bg-[hsl(var(--destructive))] text-white text-sm hover:opacity-90 transition-opacity"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Project Card ──────────────────────────────────────────────────────────────

function ProjectCard({ project, locale, onDelete }: {
  project: any; locale: string; onDelete: (id: string, name: string) => void;
}) {
  return (
    <Card className="card-hover group overflow-hidden">
      {/* Status strip */}
      <div className={cn(
        'h-0.5 w-full',
        project.status === 'active'    && 'bg-[hsl(var(--success))]',
        project.status === 'completed' && 'bg-[hsl(var(--primary))]',
        project.status === 'archived'  && 'bg-[hsl(var(--muted-foreground))]',
        project.status === 'cancelled' && 'bg-[hsl(var(--destructive))]',
      )} />

      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[hsl(var(--primary)/0.08)] flex items-center justify-center shrink-0 mt-0.5">
            <FolderKanban className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm leading-tight truncate">{project.name}</h3>
            {project.description ? (
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            ) : (
              <p className="text-xs text-[hsl(var(--muted-foreground)/0.5)] mt-1 italic">بدون توضیحات</p>
            )}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); onDelete(project.id, project.name); }}
            className="p-1.5 rounded-[var(--radius)] hover:bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--muted-foreground)/0.4)] hover:text-[hsl(var(--destructive))] opacity-0 group-hover:opacity-100 transition-all shrink-0"
            title="حذف پروژه"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
          <Badge variant={STATUS_VARIANT[project.status] ?? 'secondary'} className="text-[10px]">
            {STATUS_FA[project.status] ?? project.status}
          </Badge>

          <div className="flex items-center gap-3">
            {project.startDate && (
              <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                <Calendar className="h-3 w-3" />
                {new Date(project.startDate).toLocaleDateString('fa-IR')}
              </span>
            )}
            <a
              href={`/${locale}/projects/${project.id}`}
              className="inline-flex items-center gap-1 text-[10px] text-[hsl(var(--primary))] hover:underline font-medium"
            >
              جزئیات <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Project Row (list view) ───────────────────────────────────────────────────

function ProjectRow({ project, locale, onDelete }: {
  project: any; locale: string; onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-[hsl(var(--secondary)/0.4)] transition-colors group border-b border-[hsl(var(--border))] last:border-0">
      <div className="w-8 h-8 rounded-[var(--radius)] bg-[hsl(var(--primary)/0.08)] flex items-center justify-center shrink-0">
        <FolderKanban className="h-4 w-4 text-[hsl(var(--primary))]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{project.name}</p>
        {project.description && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{project.description}</p>
        )}
      </div>
      <Badge variant={STATUS_VARIANT[project.status] ?? 'secondary'} className="text-[10px] shrink-0">
        {STATUS_FA[project.status] ?? project.status}
      </Badge>
      {project.startDate && (
        <span className="hidden sm:flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))] shrink-0">
          <Calendar className="h-3 w-3" />
          {new Date(project.startDate).toLocaleDateString('fa-IR')}
        </span>
      )}
      <div className="flex items-center gap-1 shrink-0">
        <a
          href={`/${locale}/projects/${project.id}`}
          className="p-1.5 rounded-[var(--radius)] hover:bg-[hsl(var(--secondary))] transition-colors"
        >
          <ArrowUpRight className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
        </a>
        <button
          onClick={() => onDelete(project.id, project.name)}
          className="p-1.5 rounded-[var(--radius)] hover:bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--muted-foreground)/0.4)] hover:text-[hsl(var(--destructive))] opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Status Filter ─────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { key: 'all',       label: 'همه' },
  { key: 'active',    label: 'فعال' },
  { key: 'completed', label: 'تکمیل‌شده' },
  { key: 'archived',  label: 'آرشیو' },
];

// ── Main ──────────────────────────────────────────────────────────────────────

export function ProjectsClient() {
  const t           = useTranslations('projects');
  const tCommon     = useTranslations('common');
  const params      = useParams();
  const locale      = (params?.locale as string) ?? 'fa';
  const wsId        = useAuthStore(s => s.workspaceId);
  const toast       = useToast();
  const queryClient = useQueryClient();

  const [search,      setSearch]      = useState('');
  const [statusFilter, setStatus]     = useState('all');
  const [viewMode,    setViewMode]    = useState<'grid' | 'list'>('grid');
  const [showNew,     setShowNew]     = useState(false);
  const [deleteTarget, setDelete]     = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['projects', wsId],
    queryFn:  () => apiClient.get<any>('/projects?limit=100'),
    enabled:  !!wsId,
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('پروژه حذف شد');
      setDelete(null);
    },
    onError: () => toast.error('خطا در حذف پروژه'),
  });

  const projects = (data?.data ?? []).filter((p: any) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = data?.meta?.total ?? 0;

  return (
    <div>
      <PageHeader
        title={t('title')}
        description={`${total} ${tCommon('total')}`}
        badge={total > 0 ? undefined : undefined}
        action={
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-[0_2px_8px_hsl(var(--primary)/0.3)]"
          >
            <Plus className="h-4 w-4" />
            {t('newProject')}
          </button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <Input
          placeholder={tCommon('search')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          startIcon={<Search className="h-4 w-4" />}
          className="max-w-xs"
        />

        {/* Status filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                statusFilter === f.key
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--muted))]',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 border border-[hsl(var(--border))] rounded-[var(--radius)] p-0.5 ms-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-[var(--radius-sm)] transition-colors',
              viewMode === 'grid' ? 'bg-[hsl(var(--secondary))]' : 'hover:bg-[hsl(var(--secondary)/0.5)]',
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-[var(--radius-sm)] transition-colors',
              viewMode === 'list' ? 'bg-[hsl(var(--secondary))]' : 'hover:bg-[hsl(var(--secondary)/0.5)]',
            )}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
            : 'space-y-0',
        )}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((p: any) => (
              <ProjectCard
                key={p.id}
                project={p}
                locale={locale}
                onDelete={(id, name) => setDelete({ id, name })}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              {projects.map((p: any) => (
                <ProjectRow
                  key={p.id}
                  project={p}
                  locale={locale}
                  onDelete={(id, name) => setDelete({ id, name })}
                />
              ))}
            </CardContent>
          </Card>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center mb-5">
            <FolderKanban className="h-9 w-9 text-[hsl(var(--muted-foreground))] opacity-30" />
          </div>
          <h3 className="font-semibold text-base mb-2">{tCommon('noData')}</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 max-w-xs">
            {search || statusFilter !== 'all'
              ? 'هیچ پروژه‌ای با این فیلتر پیدا نشد'
              : 'اولین پروژه مهندسی خود را ایجاد کنید'}
          </p>
          {!search && statusFilter === 'all' && (
            <button
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-2 h-9 px-5 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              {t('newProject')}
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <NewProjectModal open={showNew} onClose={() => setShowNew(false)} />

      {deleteTarget && (
        <ConfirmDialog
          name={deleteTarget.name}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDelete(null)}
        />
      )}
    </div>
  );
}
