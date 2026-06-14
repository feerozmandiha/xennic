'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare, Plus, Send, Bot, User, Clock,
  CheckCircle2, AlertCircle, ChevronLeft, Loader2, Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge }    from '@/components/ui/badge';
import { useToast } from '@/stores/toast.store';
import { apiClient, ApiError } from '@/lib/api/client';
import { cn }        from '@/lib/utils';
import { UpgradePrompt } from '@/features/subscription/components/upgrade-prompt';

// ─────────────────────────────────────────────────────────────
// types
// ─────────────────────────────────────────────────────────────

interface ConsultationReply {
  id:         string;
  authorName: string;
  isExpert:   boolean;
  content:    string;
  createdAt:  string;
}

interface Consultation {
  id:          string;
  title:       string;
  description: string;
  category:    string;
  priority:    string;
  status:      string;
  tags:        string[];
  replies:     ConsultationReply[];
  createdAt:   string;
}

interface ConsultationsResponse {
  success: boolean;
  data:    Consultation[];
  meta:    { total: number };
}

interface ConsultationResponse {
  success: boolean;
  data:    Consultation;
}

// ─────────────────────────────────────────────────────────────
// constants
// ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:  { label: 'در انتظار',    color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  open:     { label: 'باز',          color: 'bg-blue-100 text-blue-700',     icon: MessageSquare },
  answered: { label: 'پاسخ داده شد', color: 'bg-green-100 text-green-700',   icon: CheckCircle2 },
  closed:   { label: 'بسته',         color: 'bg-gray-100 text-gray-600',     icon: AlertCircle },
};

const PRIORITY_COLOR: Record<string, string> = {
  low:    'text-gray-500',
  normal: 'text-blue-500',
  high:   'text-orange-500',
  urgent: 'text-red-500',
};

const PRIORITY_LABEL: Record<string, string> = {
  low: '🟢 کم', normal: '🔵 عادی', high: '🟠 بالا', urgent: '🔴 فوری',
};

const CATEGORIES = [
  { key: 'general',       label: 'عمومی' },
  { key: 'cable',         label: 'کابل' },
  { key: 'transformer',   label: 'ترانسفورماتور' },
  { key: 'protection',    label: 'حفاظت' },
  { key: 'power_quality', label: 'کیفیت توان' },
  { key: 'grounding',     label: 'زمین' },
  { key: 'renewable',     label: 'تجدیدپذیر' },
  { key: 'motor',         label: 'موتور' },
  { key: 'tariff',        label: 'تعرفه برق' },
];

// ─────────────────────────────────────────────────────────────
// new form
// ─────────────────────────────────────────────────────────────

function NewConsultationForm({ onDone, onCancel }: {
  onDone:   (id: string) => void;
  onCancel: () => void;
}) {
  const toast    = useToast();
  const qc       = useQueryClient();
  const [form, setForm] = useState({
    title: '', description: '', category: 'general', priority: 'normal', tags: '',
  });
  const [planBlocked, setPlanBlocked] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: () => apiClient.post<ConsultationResponse>('/consultations', {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['consultations'] });
      toast.success('سوال ارسال شد');
      onDone(res.data.id);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 403) {
        setPlanBlocked(true);
      } else {
        toast.error('خطا در ارسال سوال');
      }
    },
  });

  if (planBlocked) {
    return (
      <div className="space-y-4">
        <UpgradePrompt feature="ارسال مشاوره مهندسی" />
        <button onClick={() => setPlanBlocked(false)} className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
          بازگشت به فرم
        </button>
      </div>
    );
  }

  const inputCls = 'w-full px-3 py-2 rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm outline-none focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)] transition-all';

  return (
    <Card className="border-[hsl(var(--primary)/0.3)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-[hsl(var(--primary))]">
          <Plus className="h-4 w-4" />ارسال سوال مشاوره مهندسی
        </CardTitle>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          سوال خود را شرح دهید — Xennic AI پاسخ تخصصی ارائه می‌دهد
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs font-medium block mb-1">
            عنوان سوال <span className="text-[hsl(var(--destructive))]">*</span>
          </label>
          <input value={form.title} onChange={set('title')}
            placeholder="مثال: محاسبه سایز کابل برای موتور ۳۷ کیلووات"
            className={inputCls} />
        </div>

        <div>
          <label className="text-xs font-medium block mb-1">
            توضیحات کامل <span className="text-[hsl(var(--destructive))]">*</span>
          </label>
          <textarea value={form.description} onChange={set('description')} rows={5}
            placeholder="جزئیات مسئله، ولتاژ، توان، شرایط نصب و هر اطلاعات مرتبط را بنویسید..."
            className={cn(inputCls, 'resize-none')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium block mb-1">موضوع</label>
            <select value={form.category} onChange={set('category')} className={inputCls}>
              {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">اولویت</label>
            <select value={form.priority} onChange={set('priority')} className={inputCls}>
              {Object.entries(PRIORITY_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1">برچسب‌ها (با کاما جدا کنید)</label>
          <input value={form.tags} onChange={set('tags')}
            placeholder="کابل، موتور، IEC 60364"
            className={inputCls} />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onCancel}
            className="h-8 px-4 text-xs rounded-[var(--radius-lg)] border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] transition-colors">
            انصراف
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.title.trim() || !form.description.trim()}
            className="h-8 px-5 text-xs rounded-[var(--radius-lg)] flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {mutation.isPending
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Send className="h-3.5 w-3.5" />}
            {mutation.isPending ? 'در حال ارسال...' : 'ارسال سوال'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// detail
// ─────────────────────────────────────────────────────────────

function ConsultationDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const toast = useToast();
  const qc    = useQueryClient();
  const [reply,     setReply]     = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['consultation', id],
    queryFn:  () => apiClient.get<ConsultationResponse>(`/consultations/${id}`),
    refetchInterval: 5000,
  });

  const c = data?.data;

  const replyMut = useMutation({
    mutationFn: () => apiClient.post(`/consultations/${id}/reply`, { content: reply }),
    onSuccess:  () => {
      setReply('');
      qc.invalidateQueries({ queryKey: ['consultation', id] });
      toast.success('پاسخ ارسال شد');
    },
    onError: () => toast.error('خطا در ارسال پاسخ'),
  });

  const handleAiReply = async () => {
    setAiLoading(true);
    try {
      await apiClient.post(`/consultations/${id}/ai-reply`);
      qc.invalidateQueries({ queryKey: ['consultation', id] });
      toast.success('پاسخ AI دریافت شد');
    } catch {
      toast.error('خطا در دریافت پاسخ AI');
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
    </div>
  );
  if (!c) return null;

  const statusCfg  = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;
  const catLabel   = CATEGORIES.find(cat => cat.key === c.category)?.label ?? c.category;

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
        <ChevronLeft className="h-4 w-4" />بازگشت به مشاوره‌ها
      </button>

      {/* question */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-bold leading-relaxed flex-1">{c.title}</h2>
            <span className={cn('flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full shrink-0', statusCfg.color)}>
              <StatusIcon className="h-3 w-3" />{statusCfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
            <span>دسته: {catLabel}</span>
            <span className={cn('font-medium', PRIORITY_COLOR[c.priority])}>
              {PRIORITY_LABEL[c.priority] ?? c.priority}
            </span>
            <span>{new Date(c.createdAt).toLocaleDateString('fa-IR')}</span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-[hsl(var(--foreground)/0.85)]">
            {c.description}
          </p>
          {c.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {c.tags.map(tag => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--secondary))]">#{tag}</span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* replies */}
      {c.replies.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">پاسخ‌ها</p>
          {c.replies.map(r => (
            <div key={r.id} className={cn(
              'flex gap-3 p-4 rounded-[var(--radius-xl)] border',
              r.isExpert
                ? 'bg-[hsl(var(--primary)/0.04)] border-[hsl(var(--primary)/0.2)]'
                : 'bg-[hsl(var(--secondary)/0.4)] border-[hsl(var(--border))]',
            )}>
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                r.isExpert ? 'bg-[hsl(var(--primary)/0.15)]' : 'bg-[hsl(var(--secondary))]')}>
                {r.isExpert
                  ? <Bot  className="h-4 w-4 text-[hsl(var(--primary))]" />
                  : <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn('text-xs font-semibold', r.isExpert && 'text-[hsl(var(--primary))]')}>
                    {r.authorName}
                  </span>
                  {r.isExpert && (
                    <span className="text-[9px] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] px-1.5 py-0.5 rounded-full font-semibold">
                      کارشناس AI
                    </span>
                  )}
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] mr-auto">
                    {new Date(r.createdAt).toLocaleString('fa-IR')}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{r.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI reply button */}
      {c.status === 'pending' && c.replies.length === 0 && (
        <button onClick={handleAiReply} disabled={aiLoading}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-[var(--radius-xl)] border-2 border-dashed border-[hsl(var(--primary)/0.4)] text-sm text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.04)] disabled:opacity-50 transition-all">
          {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
          {aiLoading ? 'در حال دریافت پاسخ AI...' : 'دریافت پاسخ از Xennic AI'}
        </button>
      )}

      {/* reply box */}
      {c.status !== 'closed' && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-medium">افزودن پاسخ / اطلاعات بیشتر:</p>
            <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3}
              placeholder="پاسخ یا اطلاعات تکمیلی را بنویسید..."
              className="w-full px-3 py-2 rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm outline-none focus:border-[hsl(var(--primary))] resize-none" />
            <div className="flex justify-end">
              <button onClick={() => replyMut.mutate()}
                disabled={replyMut.isPending || !reply.trim()}
                className="h-8 px-5 text-xs rounded-[var(--radius-lg)] flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50">
                {replyMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                ارسال
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// list item
// ─────────────────────────────────────────────────────────────

function ConsultationItem({ item, onClick }: { item: Consultation; onClick: () => void }) {
  const statusCfg  = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  return (
    <Card className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      onClick={onClick}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold leading-relaxed flex-1 line-clamp-2">{item.title}</h3>
          <span className={cn('flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0', statusCfg.color)}>
            <StatusIcon className="h-3 w-3" />{statusCfg.label}
          </span>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between text-[10px] text-[hsl(var(--muted-foreground))]">
          <span>{CATEGORIES.find(c => c.key === item.category)?.label ?? item.category}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />{item.replies.length} پاسخ
            </span>
            <span>{new Date(item.createdAt).toLocaleDateString('fa-IR')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// main
// ─────────────────────────────────────────────────────────────

export function ConsultationsClient() {
  const toast = useToast();
  const qc    = useQueryClient();

  const [showNew,      setShowNew]    = useState(false);
  const [selectedId,   setSelected]   = useState<string | null>(null);
  const [statusFilter, setStatus]     = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['consultations', statusFilter],
    queryFn:  () => apiClient.get<ConsultationsResponse>(
      `/consultations?limit=50${statusFilter ? `&status=${statusFilter}` : ''}`,
    ),
  });

  const consultations = data?.data  ?? [];
  const total         = data?.meta?.total ?? consultations.length;

  if (selectedId) {
    return <ConsultationDetail id={selectedId} onBack={() => setSelected(null)} />;
  }

  if (showNew) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl font-black flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-[hsl(var(--primary))]" />مشاوره مهندسی برق
        </h1>
        <NewConsultationForm
          onDone={id => { setShowNew(false); setSelected(id); }}
          onCancel={() => setShowNew(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[hsl(var(--primary))]" />مشاوره مهندسی برق
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            سوالات تخصصی خود را مطرح کنید — Xennic AI پاسخ می‌دهد
          </p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius-lg)] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm hover:opacity-90 self-start sm:self-auto">
          <Plus className="h-4 w-4" />سوال جدید
        </button>
      </div>

      {/* filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: '',         label: 'همه' },
          { key: 'pending',  label: '⏳ در انتظار' },
          { key: 'answered', label: '✅ پاسخ داده شد' },
          { key: 'closed',   label: '🔒 بسته' },
        ].map(s => (
          <button key={s.key} onClick={() => setStatus(s.key)}
            className={cn(
              'h-7 px-3 text-xs rounded-full border transition-all',
              statusFilter === s.key
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]',
            )}>
            {s.label}
          </button>
        ))}
        <Badge variant="secondary" className="mr-auto">{total} مشاوره</Badge>
      </div>

      {/* list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-[var(--radius-xl)] bg-[hsl(var(--secondary)/0.5)] animate-pulse" />
          ))}
        </div>
      ) : consultations.length === 0 ? (
        <div className="text-center py-20 text-[hsl(var(--muted-foreground))]">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm mb-4">هنوز مشاوره‌ای ندارید</p>
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-2 h-9 px-5 mx-auto rounded-[var(--radius-lg)] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm hover:opacity-90">
            <Plus className="h-4 w-4" />اولین سوال را بپرسید
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 text-right">
            {[
              { icon: Bot,           title: 'پاسخ AI فوری',   desc: 'Xennic AI با Groq llama-3.3 پاسخ تخصصی مهندسی برق ارائه می‌دهد' },
              { icon: Zap,           title: 'استانداردها',    desc: 'پاسخ‌ها با ذکر IEC، IEEE و NEMA ارائه می‌شوند' },
              { icon: MessageSquare, title: 'مشاوره تخصصی',   desc: 'کابل، ترانس، حفاظت، کیفیت توان، زمین، موتور و تعرفه' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-4 rounded-[var(--radius-lg)] bg-[hsl(var(--secondary)/0.5)] border border-[hsl(var(--border))]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
                  <span className="text-sm font-semibold">{title}</span>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map(item => (
            <ConsultationItem key={item.id} item={item} onClick={() => setSelected(item.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
