'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit3, Trash2, Tags, FolderTree, Hash, BookOpen, Users, Layers, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/stores/toast.store';
import { cn } from '@/lib/utils';

type TaxType = 'category' | 'topic' | 'tag' | 'discipline' | 'audience';

const TYPES: { key: TaxType; label: string; labelEn: string; icon: any; color: string }[] = [
  { key: 'category', label: 'دسته‌بندی', labelEn: 'Category', icon: FolderTree, color: 'bg-blue-100 text-blue-700' },
  { key: 'topic', label: 'موضوع', labelEn: 'Topic', icon: Hash, color: 'bg-purple-100 text-purple-700' },
  { key: 'tag', label: 'برچسب', labelEn: 'Tag', icon: Tags, color: 'bg-gray-100 text-gray-700' },
  { key: 'discipline', label: 'رشته', labelEn: 'Discipline', icon: BookOpen, color: 'bg-amber-100 text-amber-700' },
  { key: 'audience', label: 'مخاطب', labelEn: 'Audience', icon: Users, color: 'bg-green-100 text-green-700' },
];

export function TaxonomyManagerHub() {
  const [type, setType] = useState<TaxType>('category');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ slug: '', name: '', name_en: '', icon: '', color: '', description: '' });
  const toast = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['taxonomy-manage', type, search],
    queryFn: async () => {
      // Try admin first, then public
      try {
        const res = await apiClient.get<{ success: boolean; data: any[] }>(`/admin/taxonomy/${type}${search ? `?search=${encodeURIComponent(search)}` : ''}`);
        return res.data;
      } catch {
        try {
          const res = await apiClient.get<{ success: boolean; data: any[] }>(`/taxonomy/${type}?q=${encodeURIComponent(search)}&limit=100`);
          return res.data;
        } catch {
          const res = await apiClient.get<{ success: boolean; data: any[] }>(`/public/taxonomy/${type}?search=${encodeURIComponent(search)}&limit=100`);
          return res.data;
        }
      }
    },
  });

  const items = (data as any[]) ?? [];

  const createMutation = useMutation({
    mutationFn: () => apiClient.post(`/admin/taxonomy/${type}`, { ...form, is_active: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taxonomy-manage'] });
      qc.invalidateQueries({ queryKey: ['taxonomy'] });
      toast.success('ایجاد شد');
      setShowForm(false);
      setForm({ slug: '', name: '', name_en: '', icon: '', color: '', description: '' });
    },
    onError: (e: any) => toast.error(e?.message ?? 'خطا در ایجاد - شاید اسلاگ تکراری است'),
  });

  const updateMutation = useMutation({
    mutationFn: () => apiClient.patch(`/admin/taxonomy/${type}/${editing.id}`, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taxonomy-manage'] });
      toast.success('به‌روزرسانی شد');
      setShowForm(false);
      setEditing(null);
    },
    onError: () => toast.error('خطا در به‌روزرسانی'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/taxonomy/${type}/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taxonomy-manage'] });
      toast.success('حذف شد');
    },
    onError: () => toast.error('خطا در حذف - ممکن است در مقالات استفاده شده باشد'),
  });

  const current = TYPES.find((t) => t.key === type)!;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-accent/5 p-5">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" /> مدیریت تاکسونومی دانشنامه
        </h2>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          اینجا می‌توانید دسته‌بندی‌ها، موضوعات، برچسب‌ها، رشته‌ها و مخاطبان را ثبت کنید. این‌ها در صفحه ایجاد مقاله (جادوگر) به عنوان گزینه‌های انتخاب نمایش داده می‌شوند. اگر لیست خالی بود، با دکمه «جدید» اولین مورد را بسازید یا اسکریپت سید را اجرا کنید: <code className="bg-muted px-1 rounded">node prisma/seed-knowledge-taxonomy.js</code>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={cn(
                'flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-medium border transition-colors',
                type === t.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-secondary',
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              <Badge variant="secondary" className="text-[10px] ml-1">
                {t.labelEn}
              </Badge>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <current.icon className="h-4 w-4" /> {current.label}
            <Badge className={current.color + ' border-0 text-[10px]'}>{items.length} مورد</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`جستجو در ${current.label}...`}
                className="h-8 pr-8 pl-3 rounded-lg border bg-background text-xs w-48 outline-none focus:border-primary"
              />
            </div>
            <Button size="sm" onClick={() => { setEditing(null); setForm({ slug: '', name: '', name_en: '', icon: '', color: '', description: '' }); setShowForm(true); }}>
              <Plus className="h-4 w-4" /> جدید
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">{editing ? 'ویرایش' : 'ایجاد'} {current.label}</h4>
                <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditing(null); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium">اسلاگ * (انگلیسی، بدون فاصله)</label>
                  <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} placeholder="cable-systems" className="w-full h-9 px-3 rounded-lg border bg-background text-sm outline-none focus:border-primary" dir="ltr" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium">نام فارسی *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="سیستم‌های کابل" className="w-full h-9 px-3 rounded-lg border bg-background text-sm outline-none focus:border-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium">نام انگلیسی</label>
                  <input value={form.name_en} onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))} placeholder="Cable Systems" className="w-full h-9 px-3 rounded-lg border bg-background text-sm outline-none focus:border-primary" dir="ltr" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium">آیکون (اموجی)</label>
                  <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="🔌" className="w-full h-9 px-3 rounded-lg border bg-background text-sm outline-none focus:border-primary" />
                </div>
                {type === 'category' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium">رنگ HEX</label>
                    <input value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} placeholder="#3B82F6" className="w-full h-9 px-3 rounded-lg border bg-background text-sm outline-none focus:border-primary" dir="ltr" />
                  </div>
                )}
                {type === 'audience' && (
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-medium">توضیحات</label>
                    <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="توضیح مخاطب" className="w-full h-9 px-3 rounded-lg border bg-background text-sm outline-none focus:border-primary" />
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setEditing(null); }}>
                  انصراف
                </Button>
                <Button size="sm" onClick={() => (editing ? updateMutation.mutate() : createMutation.mutate())} disabled={!form.slug || !form.name || createMutation.isPending || updateMutation.isPending}>
                  {editing ? 'ذخیره' : 'ایجاد'} {current.label}
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-xl">
              <Tags className="h-8 w-8 mx-auto text-muted-foreground opacity-20 mb-2" />
              <p className="text-sm font-medium">هنوز موردی ثبت نشده</p>
              <p className="text-xs text-muted-foreground mt-1">اولین {current.label} را بساز یا سید را اجرا کن: <code className="bg-muted px-1 rounded">node prisma/seed-knowledge-taxonomy.js</code></p>
              <Button size="sm" className="mt-3" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" /> ایجاد {current.label}
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {items.map((item: any, idx: number) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-secondary/50 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-muted-foreground font-mono w-6">{idx + 1}</span>
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-sm">{item.icon ?? '📁'}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        <span className="font-mono">{item.slug}</span> {item.name_en ? `• ${item.name_en}` : ''}
                      </p>
                    </div>
                    {item.color && <div className="w-4 h-4 rounded-full border ml-2" style={{ backgroundColor: item.color }} />}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditing(item);
                        setForm({ slug: item.slug, name: item.name, name_en: item.name_en ?? '', icon: item.icon ?? '', color: item.color ?? '', description: item.description ?? '' });
                        setShowForm(true);
                      }}
                      className="w-7 h-7 rounded-lg border bg-card hover:bg-secondary flex items-center justify-center"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`حذف ${item.name}؟`)) deleteMutation.mutate(item.id);
                      }}
                      className="w-7 h-7 rounded-lg border bg-card hover:bg-red-50 text-red-500 flex items-center justify-center"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
