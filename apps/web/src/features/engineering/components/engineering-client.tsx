'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Zap, ChevronLeft, Calculator, Clock, AlertCircle, UserPlus } from 'lucide-react';
import { Button }     from '@/components/ui/button';
import { Badge }      from '@/components/ui/badge';
import { Skeleton }   from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient }   from '@/lib/api/client';
import { cn }          from '@/lib/utils';
import { CalculatorForm } from './calculator-form';
import { UpgradePrompt } from '@/features/subscription/components/upgrade-prompt';
import { usePlan } from '@/features/subscription/hooks/use-plan';
import { useGuestQuota } from '@/features/guest/hooks/use-guest-quota';
import { GuestUpgradeModal } from '@/features/guest/components/guest-upgrade-modal';

// ── Catalog ──────────────────────────────────────────────────────────────────

const CALC_META: Record<string, { label: string; labelEn: string; category: string; standard: string; pro?: boolean }> = {
  'BASIC-001': { label: 'قانون اهم',         labelEn: "Ohm's Law",             category: 'basic',         standard: 'IEC 60050' },
  'BASIC-002': { label: 'توان اکتیو',        labelEn: 'Active Power',           category: 'basic',         standard: 'IEC 60050' },
  'BASIC-003': { label: 'توان ظاهری',        labelEn: 'Apparent Power',         category: 'basic',         standard: 'IEC 60050' },
  'BASIC-004': { label: 'توان راکتیو',       labelEn: 'Reactive Power',         category: 'basic',         standard: 'IEC 60050' },
  'BASIC-005': { label: 'ضریب قدرت',         labelEn: 'Power Factor',           category: 'basic',         standard: 'IEEE 1459' },
  'CABLE-001': { label: 'سایزینگ کابل',      labelEn: 'Cable Sizing',           category: 'cable',         standard: 'IEC 60364' },
  'CABLE-002': { label: 'افت ولتاژ',         labelEn: 'Voltage Drop',           category: 'cable',         standard: 'IEC 60364' },
  'CABLE-003': { label: 'اتصال کوتاه کابل',  labelEn: 'Short Circuit',          category: 'cable',         standard: 'IEC 60949' },
  'CABLE-004': { label: 'سایز PE',           labelEn: 'PE Sizing',              category: 'cable',         standard: 'IEC 60364' },
  'TRF-001':   { label: 'سایزینگ ترانسفورماتور', labelEn: 'Transformer Sizing', category: 'transformer',   standard: 'IEC 60076' },
  'TRF-002':   { label: 'تلفات ترانس',       labelEn: 'Transformer Losses',     category: 'transformer',   standard: 'IEC 60076' },
  'TRF-003':   { label: 'تنظیم ولتاژ ترانس', labelEn: 'Voltage Regulation',    category: 'transformer',   standard: 'IEC 60076' },
  'TRF-004':   { label: 'K-Factor ترانس',    labelEn: 'K-Factor',              category: 'transformer',   standard: 'IEEE C57.110' },
  'PROT-001':  { label: 'انتخاب MCCB/ACB',   labelEn: 'MCCB/ACB Selection',    category: 'protection',    standard: 'IEC 60947', pro: true },
  'PQ-001':    { label: 'THD جریان',         labelEn: 'THD',                   category: 'power_quality', standard: 'IEEE 519', pro: true },
  'PQ-002':    { label: 'TDD',               labelEn: 'TDD',                   category: 'power_quality', standard: 'IEEE 519', pro: true },
  'PQ-003':    { label: 'K-Factor بار',      labelEn: 'K-Factor PQ',           category: 'power_quality', standard: 'UL 1561', pro: true },
  'PQ-004':    { label: 'آنالیز رزونانس',   labelEn: 'Resonance Analysis',     category: 'power_quality', standard: 'IEC 61000', pro: true },
  'PQ-005':    { label: 'فیلتر پسیو',        labelEn: 'Passive Filter',         category: 'power_quality', standard: 'IEEE 519', pro: true },
  'PQ-006':    { label: 'سایزینگ APF',       labelEn: 'Active Filter',          category: 'power_quality', standard: 'IEC 61000', pro: true },

  // Renewable Energy & Motors
  'PV-001':    { label: 'سایزینگ PV خورشیدی',  labelEn: 'Solar PV Sizing',        category: 'renewable',     standard: 'IEC 62548', pro: false },
  'MOT-001':   { label: 'راه‌اندازی موتور',    labelEn: 'Motor Starting',         category: 'renewable',     standard: 'IEC 60034', pro: false },
  'EA-001':    { label: 'تحلیل مصرف انرژی',   labelEn: 'Energy Analyzer',        category: 'energy',        standard: 'IEC 61000 / توانیر', pro: false },
  'BAT-001':   { label: 'سایزینگ باتری',       labelEn: 'Battery Storage',        category: 'renewable',     standard: 'IEC 62619', pro: false },

  // Protection Extended ✅ جدید
  'SC-001':    { label: 'اتصال کوتاه سیستم',  labelEn: 'Short Circuit (IEC 60909)', category: 'protection', standard: 'IEC 60909-0:2016', pro: false },
  'PROT-002':  { label: 'آنالیز قوس الکتریکی',labelEn: 'Arc Flash (IEEE 1584)',    category: 'protection',  standard: 'IEEE 1584-2018',   pro: false },
  'GND-001':   { label: 'طراحی سیستم زمین',   labelEn: 'Grounding Design',        category: 'protection',  standard: 'IEC 60364-5-54',   pro: false },
};

const CATEGORIES = [
  { key: 'all',          label: 'همه' },
  { key: 'basic',        label: 'الکتریک پایه' },
  { key: 'cable',        label: 'کابل' },
  { key: 'transformer',  label: 'ترانسفورماتور' },
  { key: 'protection',   label: 'حفاظت' },
  { key: 'power_quality',label: 'کیفیت توان' },
  { key: 'renewable',    label: 'انرژی تجدیدپذیر' },
  { key: 'energy',       label: 'آنالیز انرژی' },
];

// ── Calc Card ─────────────────────────────────────────────────────────────────

function CalcCard({ code, meta, onSelect, disabled }: {
  code: string;
  meta: typeof CALC_META[string];
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'w-full text-start p-4 rounded-[var(--radius-lg)] border border-[hsl(var(--border))]',
        'bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.5)] hover:shadow-sm',
        'transition-all duration-150 group',
        disabled && 'opacity-60 cursor-not-allowed hover:border-[hsl(var(--border))] hover:shadow-none',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="w-8 h-8 rounded-[var(--radius)] bg-[hsl(var(--primary)/0.1)] flex items-center justify-center shrink-0 group-hover:bg-[hsl(var(--primary)/0.15)] transition-colors">
          <Zap className="h-4 w-4 text-[hsl(var(--primary))]" />
        </div>
        <div className="flex items-center gap-1.5">
          {meta.pro && (
            <Badge variant="warning" className="text-[10px] py-0">Pro</Badge>
          )}
          <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono">{code}</span>
        </div>
      </div>
      <p className="text-sm font-semibold mb-0.5">{meta.label}</p>
      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{meta.standard}</p>
    </button>
  );
}

// ── History Item ──────────────────────────────────────────────────────────────

function HistoryItem({ calc }: { calc: any }) {
  const meta = CALC_META[calc.type];
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--secondary)/0.5)] transition-colors">
      <div className="w-8 h-8 rounded-[var(--radius)] bg-[hsl(var(--success)/0.1)] flex items-center justify-center shrink-0">
        <Calculator className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{meta?.label ?? calc.type}</p>
        <p className="text-[10px] text-[hsl(var(--muted-foreground))] flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(calc.createdAt).toLocaleString('fa-IR')}
        </p>
      </div>
      <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono shrink-0">
        {calc.durationMs}ms
      </span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const GUEST_CODES = ['BASIC-001','BASIC-002','BASIC-003','BASIC-004','BASIC-005','CABLE-001','CABLE-002'];

export function EngineeringClient() {
  const t       = useTranslations('engineering');
  const tCommon = useTranslations('common');
  const locale  = useLocale();
  const wsId    = useAuthStore(s => s.workspaceId);
  const isAuth  = useAuthStore(s => s.isAuthenticated);

  const [activeCategory, setCategory] = useState('all');
  const [selectedCalc,   setSelected] = useState<string | null>(null);

  const guest = useGuestQuota();

  // Catalog از backend
  const { data: catalogData } = useQuery({
    queryKey: ['engineering-catalog', wsId],
    queryFn:  () => apiClient.get<{ success: boolean; data: string[] }>('/engineering/catalog'),
    enabled:  !!wsId,
  });

  // تاریخچه محاسبات
  const { data: historyData, isLoading: histLoading } = useQuery({
    queryKey: ['calculations', wsId],
    queryFn:  () => apiClient.get<{ success: boolean; data: any[] }>('/engineering/calculations?limit=10'),
    enabled:  !!wsId,
  });

  const availableCodes = catalogData?.data ?? [];

  const { isFree } = usePlan();

  // فیلتر محاسبات بر اساس catalog و category
  const filtered = Object.entries(CALC_META)
    .filter(([code]) => {
      if (!isAuth && !GUEST_CODES.includes(code)) return false;
      if (!isAuth) return activeCategory === 'all' || CALC_META[code]?.category === activeCategory;
      const isNew = ['PV-001','MOT-001','BAT-001'].includes(code);
      if (!isNew && !availableCodes.includes(code) && availableCodes.length > 0) return false;
      if (activeCategory !== 'all' && CALC_META[code]?.category !== activeCategory) return false;
      return true;
    });

  const selectedMeta = selectedCalc ? CALC_META[selectedCalc] : null;

  function handleGuestCalculate(): boolean {
    return guest.consume();
  }

  return (
    <div>
      <PageHeader
        title={t('title')}
        description={`${availableCodes.length} ${t('catalog')}`}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── ستون چپ/راست: کاتالوگ ──────────────────────────── */}
        <div className="xl:col-span-2 space-y-4">

          {/* Guest banner */}
          {!isAuth && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[#3b82f6]/20 bg-[#3b82f6]/5 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Zap className="h-4 w-4 text-[#3b82f6]" />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {guest.remaining} {tCommon('remaining', { defaultValue: 'محاسبه رایگان باقی‌مانده' })}
                </p>
              </div>
              <a
                href={`/${locale}/register`}
                className="text-xs font-medium text-[#3b82f6] hover:underline"
              >
                عضویت رایگان
              </a>
            </div>
          )}

          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  activeCategory === cat.key
                    ? 'bg-[hsl(var(--primary))] text-white'
                    : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--muted))]',
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(([code, meta]) => (
              <CalcCard
                key={code}
                code={code}
                meta={meta}
                onSelect={() => setSelected(code)}
                // همیشه قابل کلیک — اگر Pro باشد، UpgradePrompt نمایش می‌دهد
                //disabled={meta.pro && availableCodes.length > 0 && !availableCodes.includes(code)}
              />
            ))}
          </div>
        </div>

        {/* ── ستون راست/چپ: calculator + history ──────────────── */}
        <div className="space-y-4">

          {/* Calculator */}
          {selectedCalc && selectedMeta ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[hsl(var(--primary))]" />
                    {selectedMeta.label}
                  </CardTitle>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                  </button>
                </div>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  {selectedMeta.standard} • {selectedCalc}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                {!isAuth && guest.remaining <= 0 ? (
                  <div className="space-y-4 py-4 text-center">
                    <UserPlus className="h-10 w-10 mx-auto text-[hsl(var(--muted-foreground))] opacity-40" />
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      سهمیه محاسبات رایگان شما تمام شده
                    </p>
                    <Button size="sm" onClick={() => guest.setShowModal(true)}>
                      عضویت رایگان
                    </Button>
                  </div>
                ) : !isAuth && !selectedMeta?.pro ? (
                  <div className="space-y-2">
                    {guest.remaining > 0 && (
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))] text-start flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {guest.remaining} محاسبه رایگان باقی‌مانده
                      </p>
                    )}
                    <CalculatorForm
                      code={selectedCalc}
                      onSuccess={() => {}}
                      guestMode
                      onGuestConsume={handleGuestCalculate}
                    />
                  </div>
                ) : selectedMeta.pro && isFree && !availableCodes.includes(selectedCalc) ? (
                  <div className="space-y-4">
                    <UpgradePrompt feature={selectedMeta.label} />
                    <div className="p-4 rounded-lg bg-[hsl(var(--secondary)/0.3)] border border-dashed border-[hsl(var(--border))] text-center">
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        محاسبات {selectedMeta.label} نیاز به پلن Pro دارند
                      </p>
                    </div>
                  </div>
                ) : (
                  <CalculatorForm
                    code={selectedCalc}
                    onSuccess={() => {}}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <Calculator className="h-8 w-8 text-[hsl(var(--muted-foreground))] opacity-30 mb-3" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  یک محاسبه را از کاتالوگ انتخاب کنید
                </p>
              </CardContent>
            </Card>
          )}

          {/* History */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                {t('history')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {histLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : historyData?.data?.length ? (
                <div className="divide-y divide-[hsl(var(--border))]">
                  {historyData.data.map((calc: any) => (
                    <HistoryItem key={calc.id} calc={calc} />
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    هنوز محاسبه‌ای انجام نشده
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <GuestUpgradeModal open={guest.showModal} onOpenChange={guest.setShowModal} />
    </div>
  );
}
