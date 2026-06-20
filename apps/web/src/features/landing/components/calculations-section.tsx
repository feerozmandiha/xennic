'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useGuestQuota } from '@/features/guest/hooks/use-guest-quota';
import { GuestUpgradeModal } from '@/features/guest/components/guest-upgrade-modal';
import { calcLocal } from '@/features/engineering/utils/guest-calc';
import { Zap, Calculator, CheckCircle2, ArrowRight, Lock, Star, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const GUEST_CALCS = [
  { code: 'BASIC-001', label: 'قانون اهم',       icon: 'V = I × R / I = V / R' },
  { code: 'BASIC-002', label: 'توان اکتیو',       icon: 'P = V × I × PF' },
  { code: 'BASIC-003', label: 'توان ظاهری',       icon: 'S = V × I' },
  { code: 'BASIC-004', label: 'توان راکتیو',       icon: 'Q = √(S² − P²)' },
  { code: 'BASIC-005', label: 'ضریب قدرت',        icon: 'PF = P / S' },
  { code: 'CABLE-001', label: 'سایزینگ کابل',     icon: 'S = ρLI/ΔV' },
  { code: 'CABLE-002', label: 'افت ولتاژ',        icon: 'ΔV = 2ρLI/S' },
];

export function CalculationsSection({ locale }: { locale: string }) {
  const isAuth = useAuthStore(s => s.isAuthenticated);
  const guest = useGuestQuota();
  const [selected, setSelected] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ status: string; result?: any } | null>(null);

  function handleCalc() {
    if (!selected) return;
    const allowed = guest.consume();
    if (!allowed) {
      guest.setShowModal(true);
      return;
    }
    const parsed: Record<string, number | string> = {};
    for (const [k, v] of Object.entries(inputs)) {
      parsed[k] = isNaN(Number(v)) ? v : Number(v);
    }
    const res = calcLocal(selected, parsed);
    setResult(res);
  }

  const fields = selected ? getGuestFields(selected) : [];

  return (
    <section id="calculations" className="relative py-28 bg-[hsl(var(--background))] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, hsl(var(--primary)) 0%, transparent 50%)' }} />

      <div className="max-w-7xl mx-auto px-5 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs text-[hsl(var(--warning))] font-mono uppercase tracking-[0.2em]">// محاسبات رایگان</p>
          <h2 className="text-3xl sm:text-4xl font-black text-[hsl(var(--foreground))]">
            محاسبات مهندسی را همین حالا{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, hsl(var(--warning)), #f97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              امتحان کنید
            </span>
          </h2>
          <p className="text-[hsl(var(--foreground))/0.4] text-sm max-w-lg mx-auto">
            بدون نیاز به ثبت‌نام، {guest.total} محاسبه رایگان انجام دهید
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Calculator list */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-xs text-[hsl(var(--foreground))/0.5] font-semibold mb-2">انتخاب کنید:</p>
            {GUEST_CALCS.map((c) => (
              <button
                key={c.code}
                onClick={() => { setSelected(c.code); setResult(null); setInputs({}); }}
                className={cn(
                  'w-full text-start p-3.5 rounded-xl border transition-all duration-200',
                  selected === c.code
                    ? 'border-[hsl(var(--warning))/0.5] bg-[hsl(var(--warning))/0.05]'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))/0.02] hover:bg-[hsl(var(--secondary))/0.05] hover:border-[hsl(var(--border))/0.5]',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      selected === c.code ? 'bg-[hsl(var(--warning))/0.2]' : 'bg-[hsl(var(--secondary))/0.2]',
                    )}>
                      <Calculator className={cn('h-4 w-4', selected === c.code ? 'text-[hsl(var(--warning))]' : 'text-[hsl(var(--foreground))/0.4]')} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{c.label}</p>
                      <p className="text-[10px] text-[hsl(var(--foreground))/0.3] font-mono">{c.icon}</p>
                    </div>
                  </div>
                  <CheckCircle2 className={cn('h-4 w-4 shrink-0', selected === c.code ? 'text-[hsl(var(--warning))]' : 'text-transparent')} />
                </div>
              </button>
            ))}

            {/* Quota bar */}
            <div className="mt-4 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))/0.02]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[hsl(var(--foreground))/0.5]">سهمیه رایگان</span>
                <span className="text-xs font-bold text-[hsl(var(--foreground))]">
                  {guest.remaining} / {guest.total}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[hsl(var(--secondary))/0.3] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--warning))] to-[#f97316] transition-all duration-300"
                  style={{ width: `${(guest.remaining / guest.total) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Calculator form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))/0.02] p-6 sm:p-8 h-full">
              {!selected ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calculator className="h-12 w-12 text-[hsl(var(--foreground))/0.1] mb-4" />
                  <p className="text-sm text-[hsl(var(--foreground))/0.3]">یک محاسبه را از سمت راست انتخاب کنید</p>
                </div>
              ) : guest.remaining <= 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <Lock className="h-10 w-10 text-[hsl(var(--warning))/0.6]" />
                  <p className="text-sm text-[hsl(var(--foreground))/0.6]">سهمیه محاسبات رایگان شما تمام شده است</p>
                  <Button onClick={() => guest.setShowModal(true)}>
                    <UserPlus className="h-4 w-4 ml-1.5" />
                    عضویت رایگان — ادامه دهید
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-4 w-4 text-[hsl(var(--warning))]" />
                    <h3 className="text-base font-bold text-[hsl(var(--foreground))]">{GUEST_CALCS.find(c => c.code === selected)?.label}</h3>
                    <span className="text-[10px] text-[hsl(var(--foreground))/0.3] font-mono">{selected}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-xs font-medium text-[hsl(var(--foreground))/0.6] mb-1">
                          {field.label} {field.unit && <span className="text-[hsl(var(--foreground))/0.3]">({field.unit})</span>}
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={inputs[field.key] ?? ''}
                          onChange={e => setInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full h-9 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--warning))]"
                          dir="ltr"
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleCalc}
                    disabled={fields.some(f => f.required && !inputs[f.key])}
                  >
                    <Zap className="h-4 w-4 ml-1.5" />
                    محاسبه ({guest.remaining} باقی‌مانده)
                  </Button>

                  {result && (
                    <div className="rounded-xl bg-[hsl(var(--warning))/0.05] border border-[hsl(var(--warning))/0.2] p-4 space-y-2">
                      {Object.entries(result.result ?? {}).map(([key, val]) => {
                        if (key === 'formula' || key === 'code' || key === 'note') return null;
                        return (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <span className="text-[hsl(var(--foreground))/0.5]">{formatKey(key)}</span>
                            <span className="font-semibold text-[hsl(var(--foreground))] font-mono" dir="ltr">{String(val)}</span>
                          </div>
                        );
                      })}
                      {result.result?.formula && (
                        <p className="text-[10px] text-[hsl(var(--foreground))/0.3] font-mono pt-1 border-t border-[hsl(var(--border))]">{result.result.formula}</p>
                      )}
                      {result.result?.note && (
                        <p className="text-[10px] text-[hsl(var(--warning))/0.6]">{result.result.note}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <Link
            href={`/${locale}/register`}
            className="inline-flex items-center gap-2 text-sm text-[hsl(var(--foreground))/0.4] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            برای محاسبات نامحدود و پیشرفته، عضو شوید
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <GuestUpgradeModal open={guest.showModal} onOpenChange={guest.setShowModal} />
    </section>
  );
}

// ── Helpers ───────────────────────────────────────────────────

function getGuestFields(code: string): { key: string; label: string; unit?: string; required?: boolean }[] {
  const map: Record<string, { key: string; label: string; unit?: string; required?: boolean }[]> = {
    'BASIC-001': [
      { key: 'voltage_v', label: 'ولتاژ', unit: 'V' },
      { key: 'current_a', label: 'جریان', unit: 'A' },
      { key: 'resistance_ohm', label: 'مقاومت', unit: 'Ω' },
    ],
    'BASIC-002': [
      { key: 'voltage_v', label: 'ولتاژ', unit: 'V', required: true },
      { key: 'current_a', label: 'جریان', unit: 'A', required: true },
      { key: 'power_factor', label: 'ضریب قدرت', required: true },
    ],
    'BASIC-003': [
      { key: 'voltage_v', label: 'ولتاژ', unit: 'V', required: true },
      { key: 'current_a', label: 'جریان', unit: 'A', required: true },
    ],
    'BASIC-004': [
      { key: 'active_power_w', label: 'توان اکتیو', unit: 'W', required: true },
      { key: 'apparent_power_va', label: 'توان ظاهری', unit: 'VA', required: true },
    ],
    'BASIC-005': [
      { key: 'active_power_w', label: 'توان اکتیو', unit: 'W', required: true },
      { key: 'apparent_power_va', label: 'توان ظاهری', unit: 'VA', required: true },
    ],
    'CABLE-001': [
      { key: 'load_current', label: 'جریان بار', unit: 'A', required: true },
      { key: 'length_m', label: 'طول کابل', unit: 'm' },
    ],
    'CABLE-002': [
      { key: 'load_current', label: 'جریان بار', unit: 'A', required: true },
      { key: 'length_m', label: 'طول کابل', unit: 'm' },
      { key: 'cable_size_mm2', label: 'سایز کابل', unit: 'mm²' },
    ],
  };
  return map[code] ?? [];
}

function formatKey(key: string): string {
  const labels: Record<string, string> = {
    current_a: 'جریان (A)',
    voltage_v: 'ولتاژ (V)',
    resistance_ohm: 'مقاومت (Ω)',
    power_w: 'توان (W)',
    active_power_w: 'توان اکتیو (W)',
    apparent_power_va: 'توان ظاهری (VA)',
    reactive_power_var: 'توان راکتیو (VAR)',
    power_factor: 'ضریب قدرت',
    suggested_size_mm2: 'سایز پیشنهادی (mm²)',
    voltage_drop_v: 'افت ولتاژ (V)',
    voltage_drop_percent: 'افت ولتاژ (%)',
    theta_deg: 'زاویه θ (درجه)',
  };
  return labels[key] ?? key;
}