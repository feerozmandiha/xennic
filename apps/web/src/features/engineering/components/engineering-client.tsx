'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Zap, Lock, Crown, X, ArrowLeft, CheckCircle2, UserPlus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';

import { CalculatorForm } from './calculator-form';
import { usePlan } from '@/features/subscription/hooks/use-plan';
import { useGuestQuota } from '@/features/guest/hooks/use-guest-quota';
import { GuestUpgradeModal } from '@/features/guest/components/guest-upgrade-modal';

// ─────────────────────────────────────────────────────────────────────────────
// نقش‌هایی که دسترسی کامل (مثل Pro) دارند — بدون نیاز به پلن Pro
// ─────────────────────────────────────────────────────────────────────────────
const FULL_ACCESS_ROLES = ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'SUPPORT_ADMIN', 'OWNER', 'ADMIN', 'ENGINEER', 'REVIEWER'];

// ─────────────────────────────────────────────────────────────────────────────
// Catalog
// pro: true  → نیاز به پلن Pro (یا نقش با دسترسی کامل)
// pro: false → در پلن رایگان هم در دسترس است
// ─────────────────────────────────────────────────────────────────────────────
const CALC_META: Record<string, {
  label: string;
  labelEn: string;
  category: string;
  standard: string;
  pro: boolean;
}> = {
  // ── الکتریک پایه — همه رایگان ───────────────────────────────────────────
  'BASIC-001': { label: 'قانون اهم',             labelEn: "Ohm's Law",            category: 'basic',         standard: 'IEC 60050',                    pro: false },
  'BASIC-002': { label: 'توان اکتیو',            labelEn: 'Active Power',          category: 'basic',         standard: 'IEC 60050',                    pro: false },
  'BASIC-003': { label: 'توان ظاهری',            labelEn: 'Apparent Power',        category: 'basic',         standard: 'IEC 60050',                    pro: false },
  'BASIC-004': { label: 'توان راکتیو',           labelEn: 'Reactive Power',        category: 'basic',         standard: 'IEC 60050',                    pro: false },
  'BASIC-005': { label: 'ضریب قدرت',             labelEn: 'Power Factor',          category: 'basic',         standard: 'IEEE 1459',                    pro: false },
  // ── کابل ────────────────────────────────────────────────────────────────
  'CABLE-001': { label: 'سایزینگ کابل',          labelEn: 'Cable Sizing',          category: 'cable',         standard: 'IEC 60364-5-52',               pro: false },
  'CABLE-002': { label: 'افت ولتاژ',             labelEn: 'Voltage Drop',          category: 'cable',         standard: 'IEC 60364-5-52',               pro: false },
  'CABLE-003': { label: 'اتصال کوتاه کابل',      labelEn: 'Short Circuit Cable',   category: 'cable',         standard: 'IEC 60949',                    pro: true  },
  'CABLE-004': { label: 'سایز هادی PE',          labelEn: 'PE Conductor Sizing',   category: 'cable',         standard: 'IEC 60364-5-54',               pro: true  },
  'CABLE-005': { label: 'نردبان کابل',            labelEn: 'Cable Tray Sizing',     category: 'cable',         standard: 'IEC 61537',                    pro: true  },
  // ── ترانسفورماتور ───────────────────────────────────────────────────────
  'TRF-001':   { label: 'سایزینگ ترانسفورماتور', labelEn: 'Transformer Sizing',    category: 'transformer',   standard: 'IEC 60076',                    pro: false },
  'TRF-002':   { label: 'تلفات ترانس',            labelEn: 'Transformer Losses',    category: 'transformer',   standard: 'IEC 60076',                    pro: true  },
  'TRF-003':   { label: 'تنظیم ولتاژ ترانس',     labelEn: 'Voltage Regulation',    category: 'transformer',   standard: 'IEC 60076',                    pro: true  },
  'TRF-004':   { label: 'K-Factor ترانس',         labelEn: 'K-Factor',             category: 'transformer',   standard: 'IEEE C57.110',                 pro: true  },
  'TRF-005':   { label: 'بازدهی انرژی ترانس',    labelEn: 'Energy Efficiency',     category: 'transformer',   standard: 'EU 548/2014',                  pro: true  },
  // ── حفاظت ───────────────────────────────────────────────────────────────
  'PROT-004':  { label: 'انتخاب فیوز',            labelEn: 'Fuse Selection',        category: 'protection',    standard: 'IEC 60269',                    pro: false },
  'PROT-001':  { label: 'انتخاب MCCB/ACB',        labelEn: 'MCCB/ACB Selection',   category: 'protection',    standard: 'IEC 60947-2',                  pro: true  },
  'SC-001':    { label: 'اتصال کوتاه سیستم',      labelEn: 'Short Circuit',         category: 'protection',    standard: 'IEC 60909-0:2016',             pro: true  },
  'PROT-002':  { label: 'آنالیز قوس الکتریکی',    labelEn: 'Arc Flash',             category: 'protection',    standard: 'IEEE 1584-2018',               pro: true  },
  'ARC-001':   { label: 'انرژی وقوعی قوس',        labelEn: 'Incident Energy',       category: 'protection',    standard: 'IEEE 1584-2018 / NFPA 70E',    pro: true  },
  'PROT-003':  { label: 'آنالیز سلکتیویته',       labelEn: 'Selectivity Analysis',  category: 'protection',    standard: 'IEC 60947-2',                  pro: true  },
  'PROT-005':  { label: 'هماهنگی حفاظتی (TCC)',   labelEn: 'Protection Coord.',     category: 'protection',    standard: 'IEC 60255-151',                pro: true  },
  'SWT-001':   { label: 'کلید اصلی (اینکامر)',    labelEn: 'Main Switch / Incomer', category: 'protection',    standard: 'IEC 61439-1',                  pro: true  },
  'GND-001':   { label: 'طراحی سیستم زمین',       labelEn: 'Grounding Design',      category: 'protection',    standard: 'IEC 60364-5-54',               pro: true  },
  'GND-002':   { label: 'شبکه زمین پیشرفته',      labelEn: 'Grounding Grid',        category: 'protection',    standard: 'IEEE Std 80-2013',             pro: true  },
  // ── کیفیت توان ──────────────────────────────────────────────────────────
  'CAP-001':   { label: 'اصلاح ضریب قدرت',        labelEn: 'Power Factor Correction',category: 'power_quality',standard: 'IEC 60831',                   pro: false },
  'PQ-001':    { label: 'THD جریان',               labelEn: 'THD',                   category: 'power_quality', standard: 'IEEE 519',                    pro: true  },
  'PQ-002':    { label: 'TDD',                     labelEn: 'TDD',                   category: 'power_quality', standard: 'IEEE 519',                    pro: true  },
  'PQ-003':    { label: 'K-Factor بار',            labelEn: 'K-Factor PQ',           category: 'power_quality', standard: 'UL 1561',                     pro: true  },
  'PQ-004':    { label: 'آنالیز رزونانس',         labelEn: 'Resonance Analysis',    category: 'power_quality', standard: 'IEC 61000',                    pro: true  },
  'PQ-005':    { label: 'فیلتر پسیو',             labelEn: 'Passive Filter',         category: 'power_quality', standard: 'IEEE 519',                   pro: true  },
  'PQ-006':    { label: 'سایزینگ APF',            labelEn: 'Active Filter (APF)',    category: 'power_quality', standard: 'IEC 61000',                   pro: true  },
  'HARM-001':  { label: 'هارمونیک پیشرفته',       labelEn: 'Advanced Harmonic',     category: 'power_quality', standard: 'IEC 61000-4-7 / IEEE 519',     pro: true  },
  'PFC-001':   { label: 'بانک خازنی',             labelEn: 'Capacitor Bank',         category: 'power_quality', standard: 'IEC 60831-1',                 pro: true  },
  // ── انرژی تجدیدپذیر ─────────────────────────────────────────────────────
  'PV-001':    { label: 'طراحی نیروگاه خورشیدی',  labelEn: 'Solar PV Sizing',       category: 'renewable',     standard: 'IEC 62548',                    pro: false },
  'MOT-001':   { label: 'راه‌اندازی موتور',        labelEn: 'Motor Starting',        category: 'renewable',     standard: 'IEC 60034',                    pro: false },
  'BAT-001':   { label: 'سایزینگ باتری',           labelEn: 'Battery Storage',       category: 'renewable',     standard: 'IEC 61427',                    pro: true  },
  'BAT-BU-001':{ label: 'زمان پشتیبانی باتری',    labelEn: 'Battery Backup Time',   category: 'renewable',     standard: 'IEC 62169 / IEEE 1013',        pro: true  },
  'BATTERY-002':{ label: 'انتخاب شارژر باتری',    labelEn: 'Battery Charger',       category: 'renewable',     standard: 'IEEE 485 / IEC 60364',         pro: true  },
  'SOLAR-002': { label: 'سایزینگ اینورتر خورشیدی',labelEn: 'Inverter Sizing',       category: 'renewable',     standard: 'IEC 62548:2016',               pro: true  },
  'SOLAR-003': { label: 'سایزینگ باتری خورشیدی',  labelEn: 'Solar Battery Sizing',  category: 'renewable',     standard: 'IEC 62548 / IEC 62619',        pro: true  },
  'MOT-002':   { label: 'راندمان موتور',           labelEn: 'Motor Efficiency',      category: 'renewable',     standard: 'IEC 60034-30-1',               pro: true  },
  // ── آنالیز انرژی ────────────────────────────────────────────────────────
  'EA-001':    { label: 'تحلیل مصرف انرژی',       labelEn: 'Energy Analyzer',       category: 'energy',        standard: 'IEC 61000 / توانیر',           pro: false },
  // ── روشنایی ─────────────────────────────────────────────────────────────
  'LIGHT-001': { label: 'طراحی روشنایی داخلی',    labelEn: 'Interior Lighting',     category: 'lighting',      standard: 'CIE 190 / EN 12464-1',         pro: false },
  'LIGHT-002': { label: 'روشنایی معابر',           labelEn: 'Road Lighting',         category: 'lighting',      standard: 'EN 13201 / CIE 115',           pro: true  },
  // ── اقتصادی — همه Pro ───────────────────────────────────────────────────
  'ECO-001':   { label: 'بازگشت سرمایه (ROI)',     labelEn: 'ROI',                   category: 'economics',     standard: 'ISO 15686-5',                  pro: true  },
  'ECO-002':   { label: 'ارزش خالص فعلی (NPV)',    labelEn: 'NPV',                   category: 'economics',     standard: 'ISO 15686-5',                  pro: true  },
  'ECO-003':   { label: 'نرخ بازده داخلی (IRR)',   labelEn: 'IRR',                   category: 'economics',     standard: 'ISO 15686-5',                  pro: true  },
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
  { key: 'lighting',     label: 'روشنایی' },
  { key: 'economics',    label: 'اقتصادی' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Pro Upgrade Modal
// ─────────────────────────────────────────────────────────────────────────────
function ProUpgradeModal({
  open, onClose, featureName, locale,
}: {
  open: boolean; onClose: () => void; featureName: string; locale: string;
}) {
  const proFeatures = [
    'دسترسی به تمام ۴۵+ محاسبه تخصصی',
    'محاسبات نامحدود در ماه',
    'خروجی PDF و Excel گزارش‌ها',
    'دسترسی به API (سطح ۱)',
    'AI مهندسی (۱۰,۰۰۰ درخواست / ماه)',
    'پشتیبانی اولویت‌دار',
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        {/* Header gradient */}
        <div className="relative bg-[hsl(var(--primary)/0.06)] p-6 border-b border-[hsl(var(--border))]">
          <Button variant="ghost" size="icon" onClick={onClose}
            className="absolute left-3 top-3 rounded-full h-7 w-7">
            <X className="h-3.5 w-3.5" />
          </Button>
          <div className="flex flex-col items-center text-center gap-3 pt-1">
            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--primary)/0.12)] flex items-center justify-center">
              <Crown className="h-7 w-7 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <Lock className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                <span className="text-xs text-[hsl(var(--muted-foreground))]">نیاز به پلن Pro</span>
              </div>
              <DialogTitle className="text-lg font-bold">{featureName}</DialogTitle>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                این محاسبه در پلن رایگان در دسترس نیست.
                <br />برای استفاده، پلن Pro را فعال کنید.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="p-6 space-y-3">
          <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            با پلن Pro دریافت می‌کنید:
          </p>
          <ul className="space-y-2.5">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--primary))] shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 space-y-2">
          <Link
            href={`/${locale}/billing/checkout?plan=pro`}
            onClick={onClose}
            className={cn(
              'flex items-center justify-center gap-2 w-full h-11 rounded-[var(--radius-lg)]',
              'bg-[hsl(var(--primary))] text-white text-sm font-semibold hover:opacity-90 transition-opacity',
            )}
          >
            <Crown className="h-4 w-4" />
            فعال‌سازی پلن Pro
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
          <Link
            href={`/${locale}/settings?tab=plan`}
            onClick={onClose}
            className="flex items-center justify-center w-full h-9 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            مقایسه پلن‌ها
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Calc Card
// ─────────────────────────────────────────────────────────────────────────────
function CalcCard({
  code, meta, onSelect, isLocked, hasFullAccess,
}: {
  code: string;
  meta: typeof CALC_META[string];
  onSelect: () => void;
  isLocked: boolean;
  hasFullAccess: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative w-full text-start p-4 rounded-[var(--radius-lg)] border transition-all duration-150 group',
        'border-[hsl(var(--border))] bg-[hsl(var(--card))]',
        isLocked
          ? 'hover:border-[hsl(var(--primary)/0.3)] hover:shadow-sm'
          : 'hover:border-[hsl(var(--primary)/0.5)] hover:shadow-sm',
      )}
    >
      {/* Pro ribbon — فقط اگر دسترسی کامل ندارد */}
      {meta.pro && !hasFullAccess && (
        <div className="absolute top-0 left-0 overflow-hidden w-14 h-14 rounded-tl-[var(--radius-lg)] pointer-events-none">
          <div
            className="absolute -top-1 -left-1 w-18 flex items-center justify-center py-0.5 text-[8px] font-bold text-white tracking-widest"
            style={{
              width: '72px',
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
              transform: 'rotate(-45deg) translateY(10px)',
            }}
          >
            PRO
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className={cn(
          'w-8 h-8 rounded-[var(--radius)] flex items-center justify-center shrink-0 transition-colors',
          isLocked
            ? 'bg-[hsl(var(--primary)/0.07)] group-hover:bg-[hsl(var(--primary)/0.13)]'
            : 'bg-[hsl(var(--primary)/0.1)] group-hover:bg-[hsl(var(--primary)/0.16)]',
        )}>
          {isLocked
            ? <Lock className="h-3.5 w-3.5 text-[hsl(var(--primary)/0.6)]" />
            : <Zap className="h-4 w-4 text-[hsl(var(--primary))]" />
          }
        </div>
        <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono mt-0.5">{code}</span>
      </div>

      <p className={cn('text-sm font-semibold mb-0.5', isLocked && 'text-[hsl(var(--foreground)/0.65)]')}>
        {meta.label}
      </p>
      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{meta.standard}</p>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
export function EngineeringClient() {
  const t      = useTranslations('engineering');
  const locale = useLocale();
  const wsId   = useAuthStore(s => s.workspaceId);
  const isAuth = useAuthStore(s => s.isAuthenticated);
  const isAdmin = useAuthStore(s => s.isAdmin);

  const [activeCategory, setCategory] = useState('all');
  const [selectedCalc,   setSelected] = useState<string | null>(null);
  const [isCalcOpen,     setCalcOpen] = useState(false);
  const [isProOpen,      setProOpen]  = useState(false);

  const guest        = useGuestQuota();
  const { isFree }   = usePlan();

  // نقش‌های کاربر — از API
  const { data: rolesData } = useQuery({
    queryKey: ['my-roles', wsId],
    queryFn:  () => apiClient.get<{ success: boolean; data: { slug: string }[] }>('/roles/me'),
    enabled:  !!wsId && isAuth,
  });

  const userRoleSlugs: string[] = rolesData?.data?.map((r: { slug: string }) => r.slug) ?? [];

  // آیا کاربر دسترسی کامل دارد؟ (ادمین یا نقش‌های خاص)
  const hasFullAccess = isAdmin || userRoleSlugs.some(r => FULL_ACCESS_ROLES.includes(r));

  const { data: catalogData } = useQuery({
    queryKey: ['engineering-catalog', wsId],
    queryFn:  () => apiClient.get<{ success: boolean; data: string[] }>('/engineering/catalog'),
    enabled:  !!wsId,
  });
  const availableCodes = catalogData?.data ?? [];

  // فیلتر بر اساس دسته‌بندی
  const filtered = Object.entries(CALC_META).filter(([, meta]) =>
    activeCategory === 'all' || meta.category === activeCategory,
  );

  // آیا این محاسبه برای کاربر قفل است؟
  function isLocked(code: string): boolean {
    const meta = CALC_META[code];
    if (!meta) return false;
    if (hasFullAccess) return false;          // ادمین/نقش کامل → همه باز
    if (!isAuth) {
      // مهمان: فقط Basic-001 تا 005 و CABLE-001-002 باز
      return !['BASIC-001','BASIC-002','BASIC-003','BASIC-004','BASIC-005','CABLE-001','CABLE-002'].includes(code);
    }
    if (isFree && meta.pro) return true;       // پلن رایگان + محاسبه Pro → قفل
    return false;
  }

  const selectedMeta = selectedCalc ? CALC_META[selectedCalc] : null;

  function handleSelectCalc(code: string) {
    setSelected(code);
    if (isLocked(code)) {
      if (!isAuth) { guest.setShowModal(true); return; }
      setProOpen(true);
    } else {
      setCalcOpen(true);
    }
  }

  const freeCount = Object.values(CALC_META).filter(m => !m.pro).length;
  const proCount  = Object.values(CALC_META).filter(m => m.pro).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={
          hasFullAccess
            ? `${freeCount + proCount} محاسبه — دسترسی کامل`
            : `${freeCount} محاسبه رایگان · ${proCount} محاسبه Pro`
        }
      />

      {/* نوار وضعیت دسترسی */}
      {isAuth && hasFullAccess && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-[var(--radius-lg)] border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.04)] text-sm">
          <Sparkles className="h-4 w-4 text-[hsl(var(--primary))] shrink-0" />
          <span>
            <span className="font-semibold">دسترسی کامل</span>
            <span className="text-[hsl(var(--muted-foreground))]"> — تمام {freeCount + proCount} محاسبه برای شما فعال است</span>
          </span>
        </div>
      )}

      {isAuth && !hasFullAccess && isFree && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.3)] text-sm">
          <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
            <Lock className="h-4 w-4 shrink-0" />
            <span>
              <span className="font-semibold text-[hsl(var(--foreground))]">{freeCount} محاسبه رایگان</span>
              {' '}فعال است · {proCount} محاسبه Pro قفل
            </span>
          </div>
          <Link
            href={`/${locale}/billing/checkout?plan=pro`}
            className="shrink-0 inline-flex items-center gap-1.5 h-8 px-4 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Crown className="h-3 w-3" />
            ارتقا به Pro
          </Link>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(([code, meta]) => (
          <CalcCard
            key={code}
            code={code}
            meta={meta}
            onSelect={() => handleSelectCalc(code)}
            isLocked={isLocked(code)}
            hasFullAccess={hasFullAccess}
          />
        ))}
      </div>

      {/* ── Calculator Modal ──────────────────────────────────────────────── */}
      <Dialog open={isCalcOpen} onOpenChange={setCalcOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                  <Zap className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">{selectedMeta?.label}</DialogTitle>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">
                    {selectedMeta?.standard} · {selectedCalc}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setCalcOpen(false)} className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="p-6 pt-4">
            {!isAuth && guest.remaining <= 0 ? (
              <div className="space-y-4 py-10 text-center">
                <UserPlus className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground))] opacity-40 mb-3" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">سهمیه محاسبات رایگان شما تمام شده است</p>
                <Button size="sm" onClick={() => { setCalcOpen(false); guest.setShowModal(true); }}>
                  عضویت رایگان
                </Button>
              </div>
            ) : !isAuth ? (
              <div className="space-y-4">
                {guest.remaining > 0 && (
                  <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--muted-foreground))] bg-[hsl(var(--secondary)/0.5)] p-2 rounded-md">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    {guest.remaining} محاسبه رایگان باقی‌مانده
                  </div>
                )}
                <CalculatorForm code={selectedCalc!} onSuccess={() => {}} guestMode onGuestConsume={() => guest.consume()} />
              </div>
            ) : (
              <CalculatorForm code={selectedCalc!} onSuccess={() => {}} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Pro Modal ────────────────────────────────────────────────────── */}
      <ProUpgradeModal
        open={isProOpen}
        onClose={() => setProOpen(false)}
        featureName={selectedMeta?.label ?? ''}
        locale={locale}
      />

      {/* ── Guest Modal ──────────────────────────────────────────────────── */}
      <GuestUpgradeModal open={guest.showModal} onOpenChange={guest.setShowModal} />
    </div>
  );
}
