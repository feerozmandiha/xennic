'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Sparkles,
  Layers,
  Cpu,
  Calculator,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Wand2,
  FileText,
  Globe,
  Tag,
  Lightbulb,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { KnowledgeEditor } from '../knowledge-editor';
import { TaxonomySelect } from '../taxonomy-select';
import { manageKnowledgeApi } from '@/features/knowledge/lib/manage-api';
import { knowledgeAiClient } from '@/features/knowledge/lib/ai-client';
import { STANDARDS_REGISTRY } from '@/features/knowledge/lib/standards-data';
import { EQUIPMENT_REGISTRY } from '@/features/knowledge/lib/equipment-registry';
import { CALCULATIONS_MAP } from '@/features/knowledge/lib/calculations-map';
import { useToast } from '@/stores/toast.store';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'اطلاعات پایه', icon: FileText, desc: 'عنوان، اسلاگ، زبان، سطح' },
  { id: 2, title: 'محتوا', icon: BookOpen, desc: 'نوشتن مقاله با ویرایشگر هوشمند' },
  { id: 3, title: 'دسته‌بندی', icon: Layers, desc: 'تاکسونومی، برچسب‌ها، مخاطب' },
  { id: 4, title: 'استانداردها و تجهیزات', icon: Cpu, desc: 'IEC/IEEE/NEC و تجهیزات' },
  { id: 5, title: 'فرمول‌ها و مثال‌ها', icon: Calculator, desc: 'LaTeX، محاسبات، مثال‌ها' },
  { id: 6, title: 'بازبینی و انتشار', icon: CheckCircle, desc: 'پیش‌نمایش و انتشار' },
];

const DIFFICULTIES = [
  { value: 'beginner', label: 'مبتدی', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'intermediate', label: 'متوسط', color: 'bg-blue-100 text-blue-700' },
  { value: 'advanced', label: 'پیشرفته', color: 'bg-orange-100 text-orange-700' },
  { value: 'expert', label: 'متخصص', color: 'bg-red-100 text-red-700' },
];

interface Props {
  articleId?: string; // if editing, pass id
}

export function KnowledgeCreateWizard({ articleId }: Props) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [language, setLanguage] = useState('fa');
  const [visibility, setVisibility] = useState('public');
  const [difficulty, setDifficulty] = useState('beginner');
  const [taxonomy, setTaxonomy] = useState<Record<string, string[]>>({
    category: [],
    topic: [],
    tag: [],
    discipline: [],
    audience: [],
  });
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [aiSuggesting, setAiSuggesting] = useState(false);

  // If editing, load article
  const { data: existingData } = useQuery({
    queryKey: ['manage-knowledge', articleId],
    queryFn: () => manageKnowledgeApi.list({ page: 1, limit: 1 }).then(() => null), // placeholder, we will fetch via detail if needed
    enabled: false,
  });

  useEffect(() => {
    if (articleId) {
      // fetch article data
      import('@/lib/api/client').then(({ apiClient }) => {
        apiClient.get<any>(`/knowledge/${articleId}`).then((res) => {
          const d = res.data;
          if (d) {
            setSlug(d.slug ?? '');
            const c = d.content ?? {};
            setTitle((c as any).title ?? '');
            setContent((c as any).doc ?? c);
            setDifficulty(d.difficulty ?? 'beginner');
            setVisibility(d.visibility ?? 'public');
            setLanguage(d.language ?? 'fa');
          }
        });
      });
    }
  }, [articleId]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        slug: slug.trim() || undefined,
        content: { title: title.trim(), doc: content, summary: '' },
        language,
        visibility,
        difficulty,
      };
      if (articleId) {
        const res = await manageKnowledgeApi.update(articleId, payload);
        return res.data;
      } else {
        const res = await manageKnowledgeApi.create(payload);
        return res.data;
      }
    },
    onSuccess: async (data: any) => {
      const id = data?.id ?? articleId;
      // Save taxonomy
      if (id) {
        // For simplicity, we save taxonomy one by one (existing managed separately)
        // Standards
        for (const stdCode of selectedStandards) {
          const std = STANDARDS_REGISTRY.find((s) => s.code === stdCode);
          if (std) {
            // need to resolve standard id via API, for now we try to link by searching standards
            try {
              const search = await import('@/features/knowledge/lib/manage-api').then(
                (m) => m.manageKnowledgeApi,
              );
              // we need actual standard id - we will fetch via standardsApi
              const { standardsApi } = await import('@/features/knowledge/lib/knowledge-api');
              const res = await standardsApi.list({ q: std.code, limit: 1 });
              const found = res.data?.[0];
              if (found) await manageKnowledgeApi.linkStandard(id, found.id);
            } catch {}
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ['manage-knowledge'] });
      toast.success(articleId ? 'مقاله به‌روزرسانی شد' : 'مقاله ایجاد شد');
      if (!articleId && data?.id) router.push(`/${locale}/knowledge-manage/${data.id}/edit`);
      else if (step < 6) setStep((s) => s + 1);
      else router.push(`/${locale}/knowledge-manage`);
    },
    onError: (e: any) => toast.error(e?.message ?? 'خطا در ذخیره'),
  });

  const handleAiSuggest = async () => {
    setAiSuggesting(true);
    try {
      const textForAi = `${title} ${JSON.stringify(content).slice(0, 2000)}`;
      // Suggest taxonomy via AI client (mock)
      const suggested = await knowledgeAiClient.semanticSearch(textForAi.slice(0, 200));
      // For demo, pick first 2 categories
      if (suggested.length > 0) {
        toast.success('پیشنهادهای هوشمند اعمال شد');
        // Example: auto-select some standards based on equipment
        const eqMatch = EQUIPMENT_REGISTRY.filter((eq) =>
          textForAi.toLowerCase().includes(eq.nameEn.toLowerCase()),
        ).slice(0, 2);
        if (eqMatch.length) setSelectedEquipment(eqMatch.map((e) => e.id));
      }
    } finally {
      setAiSuggesting(false);
    }
  };

  const canNext = () => {
    if (step === 1) return title.trim().length >= 3;
    if (step === 2) return Object.keys(content).length > 0;
    return true;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title={articleId ? 'ویرایش مقاله' : 'ایجاد مقاله جدید'}
        description={`مرحله ${step} از ${STEPS.length}: ${STEPS[step - 1].title}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              انصراف
            </Button>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="h-4 w-4" /> قبلی
              </Button>
            )}
            {step < 6 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
                بعدی <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !canNext()}
                loading={createMutation.isPending}
              >
                <CheckCircle className="h-4 w-4" /> {articleId ? 'ذخیره و انتشار' : 'ایجاد مقاله'}
              </Button>
            )}
          </div>
        }
      />

      {/* Stepper */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <button
                  onClick={() => setStep(s.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 h-10 rounded-xl border text-xs font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground border-primary'
                      : done
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-card',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{s.title}</span>
                  {done && <CheckCircle className="h-3 w-3" />}
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={cn('w-6 h-px', done ? 'bg-emerald-300' : 'bg-border')} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" /> اطلاعات پایه
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="عنوان مقاله *"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلا: محاسبه افت ولتاژ کابل LV"
                />
                <Input
                  label="اسلاگ (اختیاری)"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="cable-voltage-drop-lv"
                  dir="ltr"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">زبان</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full h-10 rounded-xl border bg-background px-3 text-sm"
                    >
                      <option value="fa">فارسی</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">دید</label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-full h-10 rounded-xl border bg-background px-3 text-sm"
                    >
                      <option value="public">عمومی</option>
                      <option value="workspace">فضای کاری</option>
                      <option value="private">خصوصی</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">سطح</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full h-10 rounded-xl border bg-background px-3 text-sm"
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 p-3 flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-violet-600 mt-0.5" />
                  <p className="text-xs text-violet-800 dark:text-violet-300">
                    عنوان را دقیق و شامل کلیدواژه استاندارد (مثلا IEC 60364) بنویس تا جستجوی AI بهتر
                    کار کند.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> محتوای مقاله
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAiSuggest}
                    disabled={aiSuggesting}
                  >
                    <Wand2 className="h-4 w-4" />{' '}
                    {aiSuggesting ? 'در حال تحلیل...' : 'پیشنهاد هوشمند AI'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <KnowledgeEditor
                  content={content}
                  onChange={setContent}
                  placeholder="شروع به نوشتن مقاله فنی..."
                />
                <p className="text-[11px] text-muted-foreground mt-3">
                  از ابزار فرمول (∑) برای LaTeX و جدول برای داده‌های فنی استفاده کن.
                </p>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4" /> دسته‌بندی و تگ‌ها
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <TaxonomySelect
                  type="category"
                  selected={taxonomy.category}
                  onChange={(ids) => setTaxonomy((p) => ({ ...p, category: ids }))}
                />
                <TaxonomySelect
                  type="topic"
                  selected={taxonomy.topic}
                  onChange={(ids) => setTaxonomy((p) => ({ ...p, topic: ids }))}
                />
                <TaxonomySelect
                  type="tag"
                  selected={taxonomy.tag}
                  onChange={(ids) => setTaxonomy((p) => ({ ...p, tag: ids }))}
                />
                <TaxonomySelect
                  type="discipline"
                  selected={taxonomy.discipline}
                  onChange={(ids) => setTaxonomy((p) => ({ ...p, discipline: ids }))}
                />
                <TaxonomySelect
                  type="audience"
                  selected={taxonomy.audience}
                  onChange={(ids) => setTaxonomy((p) => ({ ...p, audience: ids }))}
                />
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4" /> استانداردهای مرتبط
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    استانداردها را بر اساس محتوای مقاله انتخاب کن. مثلا برای کابل LV: IEC 60364-5-52
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                    {STANDARDS_REGISTRY.slice(0, 12).map((std) => {
                      const selected = selectedStandards.includes(std.code);
                      return (
                        <button
                          key={std.code}
                          onClick={() =>
                            setSelectedStandards((p) =>
                              selected ? p.filter((c) => c !== std.code) : [...p, std.code],
                            )
                          }
                          className={cn(
                            'text-right p-3 rounded-xl border text-xs transition-colors',
                            selected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card hover:bg-secondary',
                          )}
                        >
                          <p className="font-mono font-bold">{std.code}</p>
                          <p className="text-[11px] opacity-80 line-clamp-2">{std.titleFa}</p>
                        </button>
                      );
                    })}
                  </div>
                  {selectedStandards.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {selectedStandards.map((code) => (
                        <Badge key={code} variant="secondary" className="font-mono text-[11px]">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Cpu className="h-4 w-4" /> تجهیزات مرتبط
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {EQUIPMENT_REGISTRY.slice(0, 8).map((eq) => {
                      const selected = selectedEquipment.includes(eq.id);
                      return (
                        <button
                          key={eq.id}
                          onClick={() =>
                            setSelectedEquipment((p) =>
                              selected ? p.filter((id) => id !== eq.id) : [...p, eq.id],
                            )
                          }
                          className={cn(
                            'text-right p-3 rounded-xl border text-xs',
                            selected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-card hover:bg-secondary',
                          )}
                        >
                          <p>
                            {eq.icon} {eq.nameFa}
                          </p>
                          <p className="text-[10px] opacity-70">{eq.nameEn}</p>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="h-4 w-4" /> فرمول‌ها و مثال‌ها
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-dashed p-6 text-center">
                  <Calculator className="h-8 w-8 mx-auto text-muted-foreground opacity-30 mb-2" />
                  <p className="text-sm font-medium">مدیریت فرمول‌ها و مثال‌ها</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    بعد از ایجاد مقاله، در صفحه جزئیات می‌توانی فرمول LaTeX و مثال‌های محاسباتی
                    اضافه کنی.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 justify-center">
                    {Object.keys(CALCULATIONS_MAP)
                      .slice(0, 5)
                      .map((calc) => (
                        <Badge key={calc} variant="outline" className="text-[10px] font-mono">
                          {calc}
                        </Badge>
                      ))}
                  </div>
                </div>
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 p-3">
                  <p className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <Tag className="h-4 w-4 mt-0.5" />
                    نکته: فرمول‌ها با استاندارد مرتبط لینک می‌شوند و در صفحه عمومی نمایش داده خواهند
                    شد.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 6 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" /> بازبینی و انتشار
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">عنوان</span>
                    <span className="font-medium">{title || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">اسلاگ</span>
                    <span className="font-mono text-xs">{slug || '(auto)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">سطح</span>
                    <span>{DIFFICULTIES.find((d) => d.value === difficulty)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">استانداردها</span>
                    <span>{selectedStandards.length} مورد</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">تجهیزات</span>
                    <span>{selectedEquipment.length} مورد</span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending}
                  loading={createMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4" /> ایجاد و رفتن به مدیریت
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-0">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> دستیار هوشمند نویسنده
              </h4>
              <p className="text-xs opacity-90 mt-2 leading-relaxed">
                {step === 1 && 'عنوان باید شامل کلیدواژه اصلی + استاندارد باشد.'}
                {step === 2 && 'محتوا را با مقدمه، فرمول، مثال و نتیجه‌گیری بنویس.'}
                {step === 3 && 'دسته‌بندی دقیق باعث می‌شود مقاله در هاب عمومی بهتر دیده شود.'}
                {step === 4 &&
                  'استاندارد IEC/IEEE مرتبط را انتخاب کن تا مقاله به تجهیزات لینک شود.'}
                {step === 5 && 'فرمول LaTeX و مثال با محاسبه واقعی ارزش مقاله را ۳ برابر می‌کند.'}
                {step === 6 && 'قبل از انتشار یک بار پیش‌نمایش عمومی را چک کن.'}
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 w-full bg-white text-violet-600"
                onClick={handleAiSuggest}
                disabled={aiSuggesting}
              >
                <Wand2 className="h-4 w-4" /> پیشنهاد هوشمند
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">وضعیت تکمیل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {STEPS.map((s) => {
                const done =
                  (s.id === 1 && title.trim().length >= 3) ||
                  (s.id === 2 && Object.keys(content).length > 0) ||
                  s.id < step;
                return (
                  <div key={s.id} className="flex items-center gap-2 text-xs">
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center',
                        done ? 'bg-emerald-100 text-emerald-600' : 'bg-secondary',
                      )}
                    >
                      {done ? <CheckCircle className="h-3 w-3" /> : <span>{s.id}</span>}
                    </div>
                    <span className={cn(done ? 'text-foreground' : 'text-muted-foreground')}>
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
