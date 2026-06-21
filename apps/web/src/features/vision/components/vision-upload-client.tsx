'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Upload, FileText, ScanEye, CheckCircle2, AlertCircle,
  Loader2, RefreshCw, ChevronDown, ChevronUp,
  Cpu, TrendingUp, AlertTriangle, Image, WifiOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/stores/toast.store';
import { cn } from '@/lib/utils';

const VISION_API = typeof window !== 'undefined'
  ? `${process.env.NEXT_PUBLIC_VISION_API_URL ?? 'http://localhost:8003'}/api/v1`
  : 'http://localhost:8003/api/v1';

function authHeaders() {
  return {
    'Authorization': `Bearer ${localStorage.getItem('xennic_token') ?? ''}`,
    'x-workspace-id': localStorage.getItem('xennic_workspace_id') ?? '',
  };
}

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
            ? <ChevronUp className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            : <ChevronDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />}
        </div>
      </CardHeader>
      {open && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}

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

function NameplateResults({ data }: { data: any }) {
  const extracted = data.nameplate ?? data.extracted ?? data;
  const validation = data.validation ?? {};
  const knowledge = data.knowledge ?? {};
  const rawText = data.combined_text ?? '';

  return (
    <div className="space-y-4">
      <SectionCard title="مشخصات پلاک" icon={FileText} color="text-[hsl(var(--primary))]">
        <KVRow label="سازنده" value={extracted.manufacturer} />
        <KVRow label="مدل" value={extracted.model} />
        <KVRow label="سریال" value={extracted.serial_number} />
        <KVRow label="سال ساخت" value={extracted.year_of_manufacture} />
        <KVRow label="توان نامی" value={extracted.power_kw} unit="kW" />
        <KVRow label="توان نامی" value={extracted.power_hp} unit="HP" />
        <KVRow label="ولتاژ نامی" value={extracted.voltage_v} unit="V" />
        <KVRow label="جریان نامی" value={extracted.current_a} unit="A" />
        <KVRow label="فرکانس" value={extracted.frequency_hz} unit="Hz" />
        <KVRow label="سرعت نامی" value={extracted.speed_rpm} unit="RPM" />
        <KVRow label="ضریب قدرت" value={extracted.power_factor} />
        <KVRow label="راندمان" value={extracted.efficiency_pct} unit="%" />
        <KVRow label="تعداد قطب" value={extracted.poles} />
        <KVRow label="کلاس عایقی" value={extracted.insulation_class} />
        <KVRow label="نوع محفظه" value={extracted.enclosure_type} />
        <KVRow label="نوع اتصال" value={extracted.connection_type} />
      </SectionCard>

      {validation.valid !== undefined && (
        <SectionCard title="اعتبارسنجی" icon={CheckCircle2} color={validation.valid ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'}>
          <KVRow label="وضعیت" value={validation.valid ? 'معتبر' : 'نامعتبر'} highlight={validation.valid ? 'good' : 'bad'} />
          {validation.errors?.map((err: string, i: number) => (
            <div key={i} className="flex items-center gap-2 py-1 text-xs text-[hsl(var(--destructive))]">
              <AlertCircle className="h-3 w-3 shrink-0" />{err}
            </div>
          ))}
          {validation.warnings?.map((w: string, i: number) => (
            <div key={i} className="flex items-center gap-2 py-1 text-xs text-[hsl(var(--warning))]">
              <AlertTriangle className="h-3 w-3 shrink-0" />{w}
            </div>
          ))}
        </SectionCard>
      )}

      {knowledge.motor_type && (
        <SectionCard title="دانش فنی" icon={Cpu} color="text-[hsl(var(--accent))]">
          <KVRow label="نوع موتور" value={knowledge.motor_type} />
          <KVRow label="نوع روتور" value={knowledge.rotor_type} />
          <KVRow label="تعداد قطب" value={knowledge.pole_count} />
          <KVRow label="لغزش نامی" value={knowledge.nominal_slip} />
          <KVRow label="گشتاور نامی" value={knowledge.nominal_torque_nm} unit="N·m" />
          <KVRow label="جریان راه‌اندازی" value={knowledge.starting_current_a} unit="A" highlight={'warn'} />
          <KVRow label="جریان بی‌باری" value={knowledge.no_load_current_a} unit="A" />
        </SectionCard>
      )}

      {rawText && (
        <SectionCard title="متن OCR" icon={FileText} color="text-[hsl(var(--muted-foreground))]">
          <pre className="text-xs whitespace-pre-wrap font-mono bg-[hsl(var(--muted)/0.3)] p-3 rounded-[var(--radius)] leading-relaxed max-h-48 overflow-y-auto">
            {rawText}
          </pre>
        </SectionCard>
      )}
    </div>
  );
}

function BillResults({ data }: { data: any }) {
  const extracted = data.bill ?? data.extracted ?? data;
  const validation = data.validation ?? {};
  const rawText = data.combined_text ?? '';

  return (
    <div className="space-y-4">
      <SectionCard title="داده‌های قبض" icon={FileText} color="text-[hsl(var(--primary))]">
        <KVRow label="شماره قبض" value={extracted.bill_number} />
        <KVRow label="نام مشترک" value={extracted.customer_name} />
        <KVRow label="شناسه مشترک" value={extracted.customer_id} />
        <KVRow label="نشانی" value={extracted.address} />
        <KVRow label="دوره" value={extracted.billing_period} />
        <KVRow label="تاریخ صدور" value={extracted.issue_date} />
        <KVRow label="تاریخ سررسید" value={extracted.due_date} />
        <KVRow label="قرائت قبلی" value={extracted.previous_reading_kwh} unit="kWh" />
        <KVRow label="قرائت فعلی" value={extracted.current_reading_kwh} unit="kWh" />
        <KVRow label="مصرف این دوره" value={extracted.consumption_kwh} unit="kWh" />
        <KVRow label="Mبلغ قابل پرداخت" value={extracted.total_amount} unit="ریال" />
        <KVRow label="هزینه انرژی" value={extracted.energy_charge} unit="ریال" />
        <KVRow label="هزینه انتقال" value={extracted.transmission_charge} unit="ریال" />
        <KVRow label="هزینه توزیع" value={extracted.distribution_charge} unit="ریال" />
        <KVRow label="مالیات" value={extracted.tax} unit="ریال" />
      </SectionCard>

      {validation.valid !== undefined && (
        <SectionCard title="اعتبارسنجی" icon={CheckCircle2} color={validation.valid ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'}>
          <KVRow label="وضعیت" value={validation.valid ? 'معتبر' : 'نامعتبر'} highlight={validation.valid ? 'good' : 'bad'} />
          {validation.errors?.map((err: string, i: number) => (
            <div key={i} className="flex items-center gap-2 py-1 text-xs text-[hsl(var(--destructive))]">
              <AlertCircle className="h-3 w-3 shrink-0" />{err}
            </div>
          ))}
        </SectionCard>
      )}

      {rawText && (
        <SectionCard title="متن OCR" icon={FileText} color="text-[hsl(var(--muted-foreground))]">
          <pre className="text-xs whitespace-pre-wrap font-mono bg-[hsl(var(--muted)/0.3)] p-3 rounded-[var(--radius)] leading-relaxed max-h-48 overflow-y-auto">
            {rawText}
          </pre>
        </SectionCard>
      )}
    </div>
  );
}

function GenericResults({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <SectionCard title="متن استخراج‌شده" icon={FileText} color="text-[hsl(var(--primary))]">
        <pre className="text-xs whitespace-pre-wrap font-mono bg-[hsl(var(--muted)/0.3)] p-3 rounded-[var(--radius)] leading-relaxed max-h-96 overflow-y-auto">
          {data.combined_text ?? '(متن استخراج نشد)'}
        </pre>
      </SectionCard>
    </div>
  );
}

export function VisionUploadClient() {
  const toast = useToast();

  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(f: File) {
    setFile(f);
    setResult(null);
    setError(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append('file', f);

      const res = await fetch(`${VISION_API}/vision/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: form,
        signal: AbortSignal.timeout(120_000),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.detail ?? errBody.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      toast.success('تحلیل با موفقیت انجام شد');
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message?.includes('fetch')) {
        setError('سرویس بینایی ماشین در دسترس نیست. لطفا vision-service را راه‌اندازی کنید.');
      } else {
        setError(err.message ?? 'خطا در پردازش');
      }
      toast.error(err.message ?? 'خطا در پردازش');
    } finally {
      setUploading(false);
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleUpload(f);
  }, []);

  function reset() {
    setResult(null);
    setFile(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const resultData = result?.data ?? result ?? {};
  const detectedType = resultData.detected_type;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black flex items-center gap-2">
          <ScanEye className="h-6 w-6 text-[hsl(var(--primary))]" />
          بینایی ماشین
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
          آپلود تصویر یا PDF — تشخیص خودکار سند (قبض برق / پلاک تجهیزات)
        </p>
      </div>

      {!result && (
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
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp,.tiff"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
            disabled={uploading}
          />

          <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center transition-all',
            dragging ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--primary)/0.1)]')}>
            {uploading
              ? <Loader2 className="h-7 w-7 text-[hsl(var(--primary))] animate-spin" />
              : <Upload className={cn('h-7 w-7', dragging ? 'text-white' : 'text-[hsl(var(--primary))]')} />}
          </div>

          <div className="text-center">
            <p className="font-semibold text-base">
              {uploading ? 'در حال پردازش...' : 'فایل را اینجا بکشید'}
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              PDF · JPG · PNG · WEBP · BMP — حداکثر ۲۰ مگابایت
            </p>
            {file && <p className="text-xs text-[hsl(var(--primary))] mt-2">📄 {file.name}</p>}
          </div>

          <div className="flex items-center gap-3 text-[10px] text-[hsl(var(--muted-foreground))]">
            {[
              { n:'1', t:'آپلود' },
              { n:'2', t:'پیش‌پردازش' },
              { n:'3', t:'تشخیص نوع' },
              { n:'4', t:'OCR' },
              { n:'5', t:'استخراج' },
              { n:'6', t:'اعتبارسنجی' },
            ].map((s,i,a) => (
              <div key={s.n} className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] flex items-center justify-center text-[9px] font-bold">{s.n}</span>
                <span>{s.t}</span>
                {i < a.length-1 && <span className="opacity-40">→</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="space-y-3">
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
          <div className="flex items-start gap-3 p-4 rounded-[var(--radius-lg)] bg-[hsl(var(--warning)/0.06)] border border-[hsl(var(--warning)/0.2)]">
            <WifiOff className="h-4 w-4 text-[hsl(var(--warning))] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[hsl(var(--warning))]">سرویس بینایی ماشین در دسترس نیست</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                برای آپلود خودکار، vision-service باید روی پورت 8003 اجرا شود.
                {' '}در غیر این صورت می‌توانید از روش دستی در
                {' '}<Link href={`/${locale}/energy`} className="text-[hsl(var(--primary))] underline">تحلیل انرژی</Link>
                {' '}استفاده کنید.
              </p>
            </div>
          </div>
        </div>
      )}

      {result && !uploading && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[hsl(var(--success)/0.08)] border border-[hsl(var(--success)/0.25)]">
            <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[hsl(var(--success))]">
                تحلیل با موفقیت انجام شد
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                نوع سند: <span className="font-mono">{detectedType === 'bill' ? 'قبض برق' : detectedType === 'nameplate' ? 'پلاک تجهیزات' : 'عمومی'}</span>
                {file?.name && ` | فایل: ${file.name}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {detectedType === 'nameplate' && <NameplateResults data={resultData} />}
            {detectedType === 'bill' && <BillResults data={resultData} />}
            {detectedType !== 'nameplate' && detectedType !== 'bill' && <GenericResults data={resultData} />}
          </div>

          <div className="flex justify-center pt-2">
            <button onClick={reset}
              className="flex items-center gap-2 h-9 px-5 rounded-[var(--radius-lg)] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--secondary))] transition-colors">
              <RefreshCw className="h-3.5 w-3.5" />تحلیل جدید
            </button>
          </div>
        </div>
      )}

      {!result && !uploading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Image,      title:'تشخیص نوع سند',      desc:'تشخیص خودکار قبض برق یا پلاک تجهیزات با استفاده از هوش مصنوعی' },
            { icon: FileText,   title:'OCR پیشرفته',        desc:'PaddleOCR + Vision LLM برای استخراج اعداد و حروف فارسی و انگلیسی' },
            { icon: TrendingUp, title:'استخراج ساختاریافته', desc:'تبدیل متن استخراج‌شده به داده‌های قابل محاسبه با اعتبارسنجی' },
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
