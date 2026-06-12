'use client';

import { useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Upload, FileText, Zap, CheckCircle2, AlertCircle,
  BarChart3, Loader2, RefreshCw, ChevronDown, ChevronUp,
  Cpu, TrendingUp, AlertTriangle, Edit3, Send, Sun,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/stores/toast.store';
import { cn }       from '@/lib/utils';

// NestJS proxy → Python 8001 (CORS-safe)
const API_BASE = typeof window !== 'undefined'
  ? `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`
  : 'http://localhost:3000/api/v1';

// ─────────────────────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────────────────────

function authHeaders() {
  return {
    'Authorization':  `Bearer ${localStorage.getItem('xennic_token') ?? ''}`,
    'x-workspace-id': localStorage.getItem('xennic_workspace_id') ?? '',
  };
}

// ─────────────────────────────────────────────────────────────
// SECTION CARD
// ─────────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, color, children, defaultOpen = true }: {
  title: string; icon: React.ElementType; color: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn('text-sm flex items-center gap-2', color)}>
            <Icon className="h-4 w-4" />{title}
          </CardTitle>
          {open
            ? <ChevronUp   className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            : <ChevronDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />}
        </div>
      </CardHeader>
      {open && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// KV ROW
// ─────────────────────────────────────────────────────────────

function KVRow({ label, value, unit, highlight }: {
  label: string; value: any; unit?: string; highlight?: 'good' | 'warn' | 'bad';
}) {
  if (value === null || value === undefined) return null;
  const color =
    highlight === 'good' ? 'text-[hsl(var(--success))]'
    : highlight === 'warn' ? 'text-[hsl(var(--warning))]'
    : highlight === 'bad'  ? 'text-[hsl(var(--destructive))]'
    : 'text-[hsl(var(--foreground))]';
  const display =
    typeof value === 'boolean' ? (value ? '✅ بله' : '❌ خیر')
    : typeof value === 'number' ? value.toLocaleString('fa-IR')
    : String(value);
  return (
    <div className="flex items-center justify-between py-1 border-b border-[hsl(var(--border)/0.4)] last:border-0">
      <span className="text-xs text-[hsl(var(--muted-foreground))]">{label}</span>
      <span className={cn('text-xs font-bold font-mono', color)}>
        {display}{unit ? ` ${unit}` : ''}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INPUT / SELECT helpers
// ─────────────────────────────────────────────────────────────

const inputCls = cn(
  'h-8 px-3 rounded-[var(--radius-lg)] border border-[hsl(var(--border))]',
  'bg-[hsl(var(--background))] text-sm outline-none w-full transition-all',
  'focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)]',
  'placeholder:text-[hsl(var(--muted-foreground)/0.5)]',
);

function FLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1 block">
      {children}
      {required && <span className="text-[hsl(var(--destructive))] mr-0.5"> *</span>}
    </label>
  );
}

function FInput({ label, value, onChange, unit, required, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  unit?: string; required?: boolean; hint?: string;
}) {
  return (
    <div>
      <FLabel required={required}>
        {label}{unit && <span className="text-[hsl(var(--muted-foreground))] font-normal"> ({unit})</span>}
      </FLabel>
      <input
        type="number" step="any" value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={hint ?? ''}
        className={inputCls}
      />
    </div>
  );
}

function FSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <FLabel>{label}</FLabel>
      <select value={value} onChange={e => onChange(e.target.value)}
        className={inputCls}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MANUAL FORM STATE
// ─────────────────────────────────────────────────────────────

interface FormState {
  // اجباری
  kwh_consumed:    string;
  billing_days:    string;
  // نوع و منطقه
  subscriber_type: string;
  climate_zone:    string;
  contract_type:   string;
  voltage_level:   string;
  // اوج/میان/کم‌بار TOU
  peak_kwh:        string;
  mid_kwh:         string;
  off_peak_kwh:    string;
  peak_kwh_friday: string;
  // ماکسیمتر
  current_peak_kw: string;
  maximeter_kw:    string;
  contract_kw:     string;
  // راکتیو
  kvarh_consumed:  string;
  power_factor:    string;
  // مبلغ
  amount_rials:    string;
  // شبکه
  transformer_kva: string;
  cable_length_m:  string;
  cable_size_mm2:  string;
}

const EMPTY_FORM: FormState = {
  kwh_consumed: '', billing_days: '30',
  subscriber_type: 'residential', climate_zone: 'moderate',
  contract_type: 'normal', voltage_level: 'LV',
  peak_kwh: '', mid_kwh: '', off_peak_kwh: '', peak_kwh_friday: '',
  current_peak_kw: '', maximeter_kw: '', contract_kw: '',
  kvarh_consumed: '', power_factor: '', amount_rials: '',
  transformer_kva: '', cable_length_m: '', cable_size_mm2: '',
};

const TARIFF_MAP: Record<string, string> = {
  residential:      'tavanir_residential',
  commercial:       'tavanir_commercial',
  industrial_lv:    'tavanir_industrial_lv',
  industrial_mv:    'tavanir_industrial_mv',
  industrial_hv:    'tavanir_industrial_hv',
  agricultural:     'tavanir_agricultural',
};

const VOLTAGE_MAP: Record<string, string> = {
  residential:   'LV',
  commercial:    'LV',
  industrial_lv: 'LV',
  industrial_mv: 'MV',
  industrial_hv: 'HV',
  agricultural:  'LV',
};

const SUPPLY_KV_MAP: Record<string, number> = {
  LV: 0.4, MV: 20.0, HV: 63.0,
};

// ─────────────────────────────────────────────────────────────
// MANUAL ENTRY FORM
// ─────────────────────────────────────────────────────────────

function ManualEntryForm({
  prefill, onResult, onCancel,
}: {
  prefill?: Partial<FormState>;
  onResult: (data: any) => void;
  onCancel: () => void;
}) {
  const [form,    setForm]    = useState<FormState>({ ...EMPTY_FORM, ...prefill });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [section, setSection] = useState<'basic' | 'tou' | 'network'>('basic');
  const toast = useToast();

  const set = (k: keyof FormState) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  // وقتی نوع مشترک تغییر می‌کند — auto fill voltage و tariff
  const handleTypeChange = (v: string) => {
    const vl = VOLTAGE_MAP[v] ?? 'LV';
    setForm(f => ({
      ...f,
      subscriber_type: v,
      voltage_level:   vl,
      contract_type:   v.startsWith('industrial') ? 'tou' : 'normal',
    }));
  };

  const isTOU     = form.contract_type === 'tou';
  const isIndustr = form.subscriber_type.startsWith('industrial');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const kwh = parseFloat(form.kwh_consumed);
    if (!form.kwh_consumed || kwh <= 0) {
      setError('مصرف kWh اجباری است و باید بزرگتر از صفر باشد');
      return;
    }
    setError(null);
    setLoading(true);

    const body: Record<string, any> = {
      kwh_consumed:    kwh,
      billing_days:    parseInt(form.billing_days || '30'),
      subscriber_type: form.subscriber_type,
      tariff_code:     TARIFF_MAP[form.subscriber_type] ?? 'tavanir_residential',
      climate_zone:    form.climate_zone,
      contract_type:   form.contract_type,
      voltage_level:   form.voltage_level,
      supply_voltage_kv: SUPPLY_KV_MAP[form.voltage_level] ?? 0.4,
    };

    // فیلدهای عددی اختیاری
    const numFields: (keyof FormState)[] = [
      'peak_kwh', 'mid_kwh', 'off_peak_kwh', 'peak_kwh_friday',
      'current_peak_kw', 'maximeter_kw', 'contract_kw',
      'kvarh_consumed', 'power_factor', 'amount_rials',
      'transformer_kva', 'cable_length_m', 'cable_size_mm2',
    ];
    for (const k of numFields) {
      if (form[k]) {
        const v = parseFloat(form[k]);
        if (!isNaN(v)) body[k] = v;
      }
    }

    try {
      const res = await fetch(`${API_BASE}/engineering/energy/manual-analyze`, {
        method:  'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail?.message ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      onResult(data);
      toast.success('تحلیل قبض با موفقیت انجام شد');
    } catch (err: any) {
      const msg = err.message ?? 'خطا در تحلیل';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const tabCls = (t: typeof section) => cn(
    'px-3 py-1.5 text-xs rounded-[var(--radius-lg)] transition-colors',
    section === t
      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]',
  );

  return (
    <Card className="border-[hsl(var(--primary)/0.3)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-[hsl(var(--primary))]">
          <Edit3 className="h-4 w-4" />
          ورود دستی داده قبض برق
        </CardTitle>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          مقادیر را از قبض وارد کنید — فیلدهای ستاره‌دار اجباری هستند
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Tab navigation ── */}
          <div className="flex gap-1 p-1 rounded-[var(--radius-lg)] bg-[hsl(var(--muted)/0.4)]">
            <button type="button" className={tabCls('basic')}   onClick={() => setSection('basic')}>اطلاعات پایه</button>
            <button type="button" className={tabCls('tou')}     onClick={() => setSection('tou')}>اوج/میان/کم‌بار</button>
            <button type="button" className={tabCls('network')} onClick={() => setSection('network')}>شبکه</button>
          </div>

          {/* ════════════════════ TAB: اطلاعات پایه ════════════════════ */}
          {section === 'basic' && (
            <div className="space-y-3">
              {/* مصرف — مهمترین فیلد */}
              <div className="p-3 rounded-[var(--radius-lg)] bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.2)]">
                <FInput
                  label="مصرف این دوره"
                  value={form.kwh_consumed}
                  onChange={set('kwh_consumed')}
                  unit="kWh" required hint="مثال: 4500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FInput label="تعداد روز دوره" value={form.billing_days} onChange={set('billing_days')} unit="روز" hint="30" />
                <FInput label="مبلغ قابل پرداخت" value={form.amount_rials} onChange={set('amount_rials')} unit="ریال" hint="اختیاری" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FSelect label="نوع مشترک" value={form.subscriber_type} onChange={handleTypeChange}
                  options={[
                    { value: 'residential',   label: '🏠 خانگی' },
                    { value: 'commercial',    label: '🏪 عمومی / تجاری' },
                    { value: 'industrial_lv', label: '🏭 صنعتی — فشارضعیف' },
                    { value: 'industrial_mv', label: '🏭 صنعتی — فشارمتوسط' },
                    { value: 'industrial_hv', label: '⚡ صنعتی — فشارقوی' },
                    { value: 'agricultural',  label: '🌾 کشاورزی' },
                  ]}
                />
                <FSelect label="منطقه آب‌وهوایی" value={form.climate_zone} onChange={set('climate_zone')}
                  options={[
                    { value: 'hot',      label: '☀️ گرمسیری (خوزستان، بوشهر...)' },
                    { value: 'moderate', label: '🌤️ معتدل (اکثر استان‌ها)' },
                    { value: 'cold',     label: '❄️ سردسیری (آذربایجان، کردستان...)' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FSelect label="نوع قرارداد" value={form.contract_type} onChange={set('contract_type')}
                  options={[
                    { value: 'normal',        label: 'قرارداد عادی' },
                    { value: 'tou',           label: 'TOU — اوج/میان/کم‌بار' },
                    { value: 'interruptible', label: 'قابل قطع' },
                    { value: 'green',         label: 'انرژی سبز' },
                  ]}
                />
                <FSelect label="سطح ولتاژ" value={form.voltage_level} onChange={set('voltage_level')}
                  options={[
                    { value: 'LV', label: 'فشارضعیف (<1kV)' },
                    { value: 'MV', label: 'فشارمتوسط (1-63kV)' },
                    { value: 'HV', label: 'فشارقوی (>63kV)' },
                  ]}
                />
              </div>

              {/* ماکسیمتر و توان */}
              {(isIndustr || form.subscriber_type === 'commercial') && (
                <div className="p-3 rounded-[var(--radius-lg)] bg-[hsl(var(--secondary)/0.5)] space-y-3">
                  <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">ماکسیمتر و توان</p>
                  <div className="grid grid-cols-3 gap-3">
                    <FInput label="قرائت ماکسیمتر" value={form.maximeter_kw} onChange={set('maximeter_kw')} unit="kW" hint="از قبض" />
                    <FInput label="توان اوج دوره" value={form.current_peak_kw} onChange={set('current_peak_kw')} unit="kW" hint="peak demand" />
                    <FInput label="توان قراردادی" value={form.contract_kw} onChange={set('contract_kw')} unit="kW" hint="مندرج در قرارداد" />
                  </div>
                </div>
              )}

              {/* ضریب قدرت */}
              <div className="grid grid-cols-2 gap-3">
                <FInput label="ضریب قدرت" value={form.power_factor} onChange={set('power_factor')} hint="مثال: 0.87" />
                <FInput label="مصرف راکتیو" value={form.kvarh_consumed} onChange={set('kvarh_consumed')} unit="kVArh" hint="اختیاری" />
              </div>
            </div>
          )}

          {/* ════════════════════ TAB: اوج/میان/کم‌بار ════════════════════ */}
          {section === 'tou' && (
            <div className="space-y-3">
              <div className="p-3 rounded-[var(--radius-lg)] bg-[hsl(var(--warning)/0.05)] border border-[hsl(var(--warning)/0.15)] text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                <p className="font-semibold text-[hsl(var(--warning))] mb-1">📋 راهنمای ساعات TOU (توانیر ۱۴۰۳)</p>
                <p>• <strong>اوج‌بار:</strong> تابستان ۱۷–۲۱ | زمستان ۷–۱۰ و ۱۷–۲۱</p>
                <p>• <strong>کم‌بار:</strong> ۲۳–۷ (همه فصول)</p>
                <p>• <strong>میان‌بار:</strong> سایر ساعات</p>
                <p>• <strong>اوج جمعه:</strong> ساعات اوج روزهای جمعه (نرخ کمتر)</p>
                <p className="mt-1 text-[hsl(var(--primary))]">اگر ندارید خالی بگذارید — سیستم از نرخ تک‌نرخی استفاده می‌کند</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FInput label="مصرف اوج‌بار" value={form.peak_kwh} onChange={set('peak_kwh')} unit="kWh" hint="ساعات اوج" />
                <FInput label="مصرف میان‌بار" value={form.mid_kwh} onChange={set('mid_kwh')} unit="kWh" hint="ساعات میانی" />
                <FInput label="مصرف کم‌بار" value={form.off_peak_kwh} onChange={set('off_peak_kwh')} unit="kWh" hint="شب ۲۳–۷" />
                <FInput label="اوج‌بار جمعه" value={form.peak_kwh_friday} onChange={set('peak_kwh_friday')} unit="kWh" hint="اختیاری" />
              </div>

              {/* نمایش جمع TOU */}
              {(form.peak_kwh || form.mid_kwh || form.off_peak_kwh) && (
                <div className="flex items-center justify-between p-2 rounded bg-[hsl(var(--primary)/0.06)] border border-[hsl(var(--primary)/0.2)] text-xs">
                  <span className="text-[hsl(var(--muted-foreground))]">جمع TOU:</span>
                  <span className="font-mono font-bold text-[hsl(var(--primary))]">
                    {(
                      (parseFloat(form.peak_kwh) || 0) +
                      (parseFloat(form.mid_kwh) || 0) +
                      (parseFloat(form.off_peak_kwh) || 0) +
                      (parseFloat(form.peak_kwh_friday) || 0)
                    ).toLocaleString('fa-IR')} kWh
                  </span>
                  <span className="text-[hsl(var(--muted-foreground))]">از {parseFloat(form.kwh_consumed || '0').toLocaleString('fa-IR')} kWh</span>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════ TAB: شبکه ════════════════════ */}
          {section === 'network' && (
            <div className="space-y-3">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                اطلاعات شبکه برای Load Flow با pandapower — همه اختیاری
              </p>
              <div className="grid grid-cols-3 gap-3">
                <FInput label="ترانسفورماتور" value={form.transformer_kva} onChange={set('transformer_kva')} unit="kVA" hint="مثال: 630" />
                <FInput label="طول کابل" value={form.cable_length_m} onChange={set('cable_length_m')} unit="متر" hint="مثال: 80" />
                <FInput label="سطح مقطع کابل" value={form.cable_size_mm2} onChange={set('cable_size_mm2')} unit="mm²" hint="مثال: 240" />
              </div>
            </div>
          )}

          {/* خطا */}
          {error && (
            <div className="flex items-center gap-2 p-2 rounded bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--destructive))] text-xs">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />{error}
            </div>
          )}

          {/* دکمه‌ها */}
          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={onCancel}
              className="h-8 px-4 text-xs rounded-[var(--radius-lg)] border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] transition-colors">
              انصراف
            </button>
            <div className="flex items-center gap-2">
              {section !== 'basic' && (
                <button type="button"
                  onClick={() => setSection(section === 'tou' ? 'basic' : 'tou')}
                  className="h-8 px-3 text-xs rounded-[var(--radius-lg)] border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] transition-colors">
                  ← قبلی
                </button>
              )}
              {section !== 'network' ? (
                <button type="button"
                  onClick={() => setSection(section === 'basic' ? 'tou' : 'network')}
                  className="h-8 px-3 text-xs rounded-[var(--radius-lg)] bg-[hsl(var(--secondary))] hover:opacity-90 transition-opacity">
                  بعدی →
                </button>
              ) : null}
              <button type="submit" disabled={loading}
                className="h-8 px-5 text-xs rounded-[var(--radius-lg)] flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50 transition-opacity">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {loading ? 'در حال تحلیل...' : 'تحلیل کن'}
              </button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// RESULTS RENDERER
// ─────────────────────────────────────────────────────────────

const METHOD_LABEL: Record<string, string> = {
  pdf_text_layer:              'PDF text layer',
  'pdf_text_layer+groq_ai':    'PDF + Groq AI',
  pdf_image_tesseract:         'PDF → Tesseract',
  'tesseract+groq_ai':         'Tesseract + Groq AI',
  tesseract:                   'Tesseract OCR',
  groq_ai:                     'Groq AI',
  manual:                      'ورود دستی',
};

function AnalysisResults({ result, onEdit, onReset }: {
  result: any;
  onEdit: () => void;
  onReset: () => void;
}) {
  const ocr  = result?.ocr;
  const an   = result?.analysis;
  const norm = ocr?.normalized ?? {};
  const cons = an?.consumption ?? {};
  const pf   = an?.power_factor ?? {};
  const cost = an?.cost ?? {};
  const lf   = an?.load_flow ?? {};
  const eff  = an?.energy_efficiency ?? {};
  const sum  = an?.summary ?? {};
  const recs = an?.recommendations ?? [];
  const warns = [...(an?.warnings ?? []), ...(ocr?.warnings ?? [])];

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[hsl(var(--success)/0.08)] border border-[hsl(var(--success)/0.25)]">
        <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[hsl(var(--success))]">تحلیل با موفقیت انجام شد</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            روش: <span className="font-mono">{METHOD_LABEL[ocr?.method] ?? ocr?.method ?? '—'}</span>
            {result?.file?.name && ` | فایل: ${result.file.name}`}
            {sum.climate_zone && sum.climate_zone !== 'moderate' &&
              ` | ${sum.climate_zone === 'hot' ? '☀️ گرمسیری' : '❄️ سردسیری'}`}
          </p>
        </div>
        {eff?.grade && (
          <div className={cn(
            'w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 text-center',
            eff.grade === 'A' ? 'bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]'
            : eff.grade === 'B' ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
            : eff.grade === 'C' ? 'bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))]'
            : 'bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]',
          )}>
            <span className="text-lg font-black leading-none">{eff.grade}</span>
            <span className="text-[8px] leading-none">EEI</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* داده استخراج شده */}
        <SectionCard title="داده‌های قبض" icon={FileText} color="text-[hsl(var(--primary))]">
          <KVRow label="نوع مشترک"       value={norm.subscriber_type} />
          <KVRow label="منطقه"            value={norm.climate_zone === 'hot' ? 'گرمسیری' : norm.climate_zone === 'cold' ? 'سردسیری' : norm.climate_zone ? 'معتدل' : null} />
          <KVRow label="نوع قرارداد"     value={norm.contract_type === 'tou' ? 'TOU (اوج/میان/کم‌بار)' : norm.contract_type} />
          <KVRow label="مصرف این دوره"   value={norm.kwh_consumed} unit="kWh" />
          <KVRow label="تعداد روز"       value={norm.billing_days} unit="روز" />
          <KVRow label="توان اوج"        value={norm.current_peak_kw} unit="kW" />
          <KVRow label="ماکسیمتر"        value={norm.maximeter_kw} unit="kW" />
          <KVRow label="توان قراردادی"   value={norm.contract_kw} unit="kW" />
          <KVRow label="ضریب قدرت"       value={norm.power_factor} />
          <KVRow label="kVArh"           value={norm.kvarh_consumed} />
          <KVRow label="مبلغ قبض"        value={norm.amount_rials} unit="ریال" />
          <KVRow label="نام مشترک"       value={norm.subscriber_name} />
          <KVRow label="شماره کنتور"     value={norm.meter_number} />
        </SectionCard>

        {/* مصرف */}
        {cons.kwh_total && (
          <SectionCard title="شاخص‌های مصرف" icon={BarChart3} color="text-[hsl(var(--primary))]">
            <KVRow label="کل مصرف"           value={cons.kwh_total} unit="kWh" />
            <KVRow label="میانگین روزانه"     value={cons.daily_avg_kwh} unit="kWh/day" />
            <KVRow label="توان متوسط"         value={cons.avg_kw} unit="kW" />
            <KVRow label="توان اوج"           value={cons.peak_kw} unit="kW" />
            <KVRow label="ضریب بار"
              value={cons.load_factor != null ? (cons.load_factor * 100).toFixed(1) + '%' : null}
              highlight={cons.load_factor >= 0.65 ? 'good' : cons.load_factor >= 0.45 ? 'warn' : 'bad'}
            />
            {/* TOU breakdown */}
            {cons.kwh_peak && <KVRow label="مصرف اوج‌بار"  value={cons.kwh_peak} unit="kWh" />}
            {cons.kwh_mid  && <KVRow label="مصرف میان‌بار" value={cons.kwh_mid}  unit="kWh" />}
            {cons.kwh_off_peak && <KVRow label="مصرف کم‌بار" value={cons.kwh_off_peak} unit="kWh" />}
            {eff?.overall_score != null && (
              <>
                <KVRow label="امتیاز کارایی" value={`${eff.overall_score}/100`}
                  highlight={eff.grade === 'A' ? 'good' : eff.grade === 'D' ? 'bad' : 'warn'} />
                <KVRow label="درجه کارایی"   value={`${eff.grade} — ${eff.interpretation}`} />
              </>
            )}
          </SectionCard>
        )}

        {/* ضریب قدرت */}
        {(pf.measured != null || pf.status) && (
          <SectionCard title="ضریب قدرت و جبران‌سازی" icon={TrendingUp}
            color={pf.below_threshold ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--success))]'}>
            <KVRow label="ضریب قدرت اندازه‌گیری"
              value={pf.measured}
              highlight={pf.measured >= 0.95 ? 'good' : pf.measured >= 0.85 ? 'warn' : 'bad'} />
            <KVRow label="وضعیت"              value={pf.status} />
            <KVRow label="حد الزامی توانیر"   value={pf.pf_threshold} />
            <KVRow label="توان راکتیو"         value={pf.reactive_kvar} unit="kVAR" />
            <KVRow label="جریمه ضریب قدرت"    value={pf.penalty_rials} unit="ریال"
              highlight={pf.penalty_rials ? 'bad' : undefined} />
            {pf.capacitor_kvar && (
              <div className="mt-2 p-2 rounded bg-[hsl(var(--primary)/0.06)] border border-[hsl(var(--primary)/0.15)] text-xs">
                <p className="font-semibold text-[hsl(var(--primary))]">💡 پیشنهاد</p>
                <p className="mt-0.5">
                  خازن: <strong>{pf.capacitor_kvar} kVAR</strong>
                  {pf.savings_rials_month
                    ? ` — صرفه‌جویی: ${(pf.savings_rials_month / 1e6).toFixed(1)} میلیون ریال/ماه`
                    : ''}
                </p>
              </div>
            )}
          </SectionCard>
        )}

        {/* هزینه */}
        {cost.total_rials && (
          <SectionCard title="هزینه تعرفه توانیر ۱۴۰۳" icon={Zap} color="text-[hsl(var(--warning))]">
            <KVRow label="هزینه انرژی"        value={cost.energy_cost_rials}   unit="ریال" />
            <KVRow label="هزینه demand"        value={cost.demand_cost_rials}   unit="ریال" />
            <KVRow label="جریمه تجاوز توان"   value={cost.overload_cost_rials} unit="ریال"
              highlight={cost.overload_cost_rials ? 'bad' : undefined} />
            <KVRow label="مالیات ۹٪"          value={cost.tax_rials}           unit="ریال" />
            <KVRow label="جمع کل (محاسبه)"    value={cost.total_rials}         unit="ریال" />
            <KVRow label="نرخ میانگین"         value={cost.avg_price_kwh}       unit="ریال/kWh" />
            {cost.ratchet_demand_kw && (
              <KVRow label="demand ratchet"    value={cost.ratchet_demand_kw}   unit="kW" />
            )}
            {cost.climate_multiplier && cost.climate_multiplier !== 1 && (
              <KVRow label="ضریب منطقه‌ای"    value={`×${cost.climate_multiplier}`} />
            )}
            {cost.actual_bill_rials && (
              <KVRow label="اختلاف با قبض"
                value={cost.difference_rials}
                unit={`ریال (${cost.difference_pct?.toFixed(1)}%)`}
                highlight={Math.abs(cost.difference_pct ?? 0) < 5 ? 'good' : 'warn'}
              />
            )}
            {/* TOU breakdown */}
            {cost.tou_breakdown && (
              <div className="mt-2 p-2 rounded bg-[hsl(var(--secondary)/0.5)] text-xs space-y-1">
                <p className="font-semibold text-[hsl(var(--muted-foreground))] text-[10px] uppercase">تفکیک TOU</p>
                <KVRow label="اوج‌بار"   value={cost.tou_breakdown.peak_kwh}    unit="kWh" />
                <KVRow label="میان‌بار"  value={cost.tou_breakdown.mid_kwh}     unit="kWh" />
                <KVRow label="کم‌بار"    value={cost.tou_breakdown.off_peak_kwh} unit="kWh" />
              </div>
            )}
          </SectionCard>
        )}

        {/* Load Flow */}
        {lf && Object.keys(lf).length > 0 && (
          <SectionCard title="Load Flow — pandapower" icon={Cpu} color="text-[hsl(var(--accent))]">
            {lf.converged === false ? (
              <>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{lf.note || lf.method}</p>
                {lf.simple_estimate?.voltage_drop_pct != null && (
                  <>
                    <KVRow label="افت ولتاژ (تخمین)" value={lf.simple_estimate.voltage_drop_pct} unit="%" highlight={lf.simple_estimate.voltage_ok ? 'good' : 'bad'} />
                    <KVRow label="جریان"              value={lf.simple_estimate.current_a} unit="A" />
                    <KVRow label="تلفات (تخمین)"      value={lf.simple_estimate.loss_kw} unit="kW" />
                  </>
                )}
              </>
            ) : (
              <>
                <KVRow label="ولتاژ" value={lf.voltage_pu ? `${lf.voltage_pu} pu` : null} highlight={lf.voltage_ok ? 'good' : 'bad'} />
                <KVRow label="وضعیت ولتاژ" value={lf.voltage_ok ? 'در محدوده مجاز' : 'خارج از محدوده'} highlight={lf.voltage_ok ? 'good' : 'bad'} />
                <KVRow label="تلفات توان"  value={lf.loss_kw} unit="kW" highlight={(lf.loss_pct ?? 0) > 3 ? 'warn' : 'good'} />
                <KVRow label="تلفات %"     value={lf.loss_pct?.toFixed(2)} unit="%" />
                <KVRow label="تلفات ماهانه" value={lf.loss_kwh_month} unit="kWh" />
                <KVRow label="بارگذاری ترانس" value={lf.transformer_loading_pct} unit="%" highlight={(lf.transformer_loading_pct ?? 0) > 80 ? 'bad' : 'good'} />
              </>
            )}
          </SectionCard>
        )}

        {/* توصیه‌ها */}
        {recs.length > 0 && (
          <SectionCard title="توصیه‌های بهینه‌سازی" icon={TrendingUp} color="text-[hsl(var(--success))]">
            <ul className="space-y-2">
              {recs.map((r: string, i: number) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed">
                  <span className="text-[hsl(var(--primary))] shrink-0">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
      </div>

      {/* هشدارها */}
      {warns.length > 0 && (
        <div className="space-y-2">
          {warns.map((w: string, i: number) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-[var(--radius-lg)] bg-[hsl(var(--warning)/0.06)] border border-[hsl(var(--warning)/0.2)] text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--warning))] shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* اکشن‌ها */}
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <button onClick={onReset}
          className="flex items-center gap-2 h-9 px-5 rounded-[var(--radius-lg)] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--secondary))] transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />تحلیل قبض جدید
        </button>
        {ocr?.method !== 'manual' && (
          <button onClick={onEdit}
            className="flex items-center gap-2 h-9 px-5 rounded-[var(--radius-lg)] border border-[hsl(var(--primary)/0.4)] text-sm text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)] transition-colors">
            <Edit3 className="h-3.5 w-3.5" />ویرایش دستی
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export function BillAnalyzer() {
  const toast  = useToast();

  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging,       setDragging]       = useState(false);
  const [uploading,      setUploading]      = useState(false);
  const [file,           setFile]           = useState<File | null>(null);
  const [ocrRaw,         setOcrRaw]         = useState<any>(null);
  const [finalResult,    setFinalResult]    = useState<any>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  async function handleUpload(f: File) {
    setFile(f); setOcrRaw(null); setFinalResult(null);
    setShowManualForm(false); setError(null); setUploading(true);

    try {
      const form = new FormData();
      form.append('file', f);
      form.append('run_analysis', 'true');

      const res = await fetch(`${API_BASE}/engineering/energy/ocr-bill`, {
        method: 'POST', headers: authHeaders(), body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail?.message ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setOcrRaw(data);

      if (data.analysis && data.ocr?.kwh_found) {
        setFinalResult(data);
        toast.success('تحلیل قبض برق با موفقیت انجام شد');
      } else {
        setShowManualForm(true);
        // ← fix: استفاده از info به جای warning که وجود ندارد
        toast.info('OCR مصرف kWh را نیافت — لطفاً دستی وارد کنید');
      }
    } catch (err: any) {
      const msg = err.message ?? 'خطا در پردازش';
      setError(msg); toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleUpload(f);
  }, []);

  function reset() {
    setOcrRaw(null); setFinalResult(null);
    setShowManualForm(false); setFile(null); setError(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function buildPrefill(): Partial<FormState> {
    const norm = ocrRaw?.ocr?.normalized ?? {};
    return {
      billing_days:    String(norm.billing_days ?? 30),
      subscriber_type: norm.subscriber_type === 'industrial' ? 'industrial_mv' : (norm.subscriber_type ?? 'residential'),
      current_peak_kw: norm.current_peak_kw ? String(norm.current_peak_kw) : '',
      kvarh_consumed:  norm.kvarh_consumed  ? String(norm.kvarh_consumed)  : '',
      contract_kw:     norm.contract_kw     ? String(norm.contract_kw)     : '',
      power_factor:    norm.power_factor    ? String(norm.power_factor)    : '',
      amount_rials:    norm.amount_rials    ? String(norm.amount_rials)    : '',
    };
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-black flex items-center gap-2">
          <Zap className="h-6 w-6 text-[hsl(var(--primary))]" />
          تحلیل هوشمند قبض برق
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
          آپلود PDF قبض → OCR + Groq AI → تعرفه کامل توانیر ۱۴۰۳ → pandapower
        </p>
      </div>

      {/* Upload Zone */}
      {!finalResult && !showManualForm && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !uploading && fileRef.current?.click()}
          className={cn(
            'relative rounded-[var(--radius-2xl)] border-2 border-dashed cursor-pointer',
            'flex flex-col items-center justify-center gap-4 p-10 transition-all',
            dragging
              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] scale-[1.01]'
              : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--secondary)/0.4)]',
            uploading && 'opacity-60 cursor-wait',
          )}
        >
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
            disabled={uploading} />

          <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center transition-all',
            dragging ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--primary)/0.1)]')}>
            {uploading
              ? <Loader2 className="h-7 w-7 text-[hsl(var(--primary))] animate-spin" />
              : <Upload  className={cn('h-7 w-7', dragging ? 'text-white' : 'text-[hsl(var(--primary))]')} />}
          </div>

          <div className="text-center">
            <p className="font-semibold text-base">
              {uploading ? 'در حال پردازش قبض...' : 'قبض برق را اینجا بکشید'}
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              PDF · JPG · PNG · WEBP — حداکثر ۱۰ مگابایت
            </p>
            {file && <p className="text-xs text-[hsl(var(--primary))] mt-2">📄 {file.name}</p>}
          </div>

          <div className="flex items-center gap-3 text-[10px] text-[hsl(var(--muted-foreground))]">
            {[{ n:'1',t:'آپلود'},{ n:'2',t:'OCR+AI'},{ n:'3',t:'تعرفه'},{ n:'4',t:'pandapower'}].map((s,i,a) => (
              <div key={s.n} className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] flex items-center justify-center text-[9px] font-bold">{s.n}</span>
                <span>{s.t}</span>
                {i < a.length-1 && <span className="opacity-40">→</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* خطا */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-[var(--radius-lg)] bg-[hsl(var(--destructive)/0.06)] border border-[hsl(var(--destructive)/0.2)]">
          <AlertCircle className="h-4 w-4 text-[hsl(var(--destructive))] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[hsl(var(--destructive))]">خطا در پردازش</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{error}</p>
          </div>
          <button onClick={reset} className="text-xs underline text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            تلاش مجدد
          </button>
        </div>
      )}

      {/* فرم ورود دستی */}
      {showManualForm && (
        <div className="space-y-3">
          {ocrRaw?.ocr && (
            <div className="p-3 rounded-[var(--radius-lg)] bg-[hsl(var(--warning)/0.06)] border border-[hsl(var(--warning)/0.2)] text-xs space-y-1">
              <p className="font-semibold text-[hsl(var(--warning))] flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                OCR مصرف kWh را استخراج نکرد
              </p>
              <p className="text-[hsl(var(--muted-foreground))]">
                روش امتحان شده: <span className="font-mono">{ocrRaw.ocr.method}</span>
                {ocrRaw.file?.name && ` | فایل: ${ocrRaw.file.name}`}
              </p>
              {ocrRaw.ocr.normalized?.amount_rials && (
                <p>مبلغ خوانده‌شده: <strong>{ocrRaw.ocr.normalized.amount_rials.toLocaleString('fa-IR')} ریال</strong></p>
              )}
            </div>
          )}
          <ManualEntryForm
            prefill={buildPrefill()}
            onResult={data => { setFinalResult(data); setShowManualForm(false); }}
            onCancel={reset}
          />
        </div>
      )}

      {/* نتایج */}
      {finalResult && !uploading && (
        <AnalysisResults
          result={finalResult}
          onEdit={() => { setShowManualForm(true); setFinalResult(null); }}
          onReset={reset}
        />
      )}

      {/* Info cards */}
      {!finalResult && !showManualForm && !uploading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: FileText,  title:'OCR + Groq AI',  desc:'PDF text layer → regex → Groq AI fallback برای استخراج دقیق داده قبض' },
            { icon: Zap,       title:'تعرفه کامل ۱۴۰۳', desc:'TOU اوج/میان/کم‌بار، منطقه گرمسیری/سردسیری، ماکسیمتر، ratchet' },
            { icon: Cpu,       title:'pandapower',      desc:'Load Flow Newton-Raphson — ولتاژ، تلفات، بارگذاری ترانس، پیشنهادات' },
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
      )}
    </div>
  );
}
