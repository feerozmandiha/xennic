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
    <section id="calculations" className="relative py-28 bg-gradient-to-b from-[#050b14] via-[#070e1a] to-[#050b14] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #3b82f6 0%, transparent 50%)' }} />

      <div className="max-w-7xl mx-auto px-5 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs text-[#f59e0b] font-mono uppercase tracking-[0.2em]">// محاسبات رایگان</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            محاسبات مهندسی را همین حالا{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              امتحان کنید
            </span>
          </h2>
          <p className="text-white/40 text-sm max-w-lg mx-auto">
            بدون نیاز به ثبت‌نام، {guest.total} محاسبه رایگان انجام دهید
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Calculator list */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-xs text-white/50 font-semibold mb-2">انتخاب کنید:</p>
            {GUEST_CALCS.map((c) => (
              <button
                key={c.code}
                onClick={() => { setSelected(c.code); setResult(null); setInputs({}); }}
                className={cn(
                  'w-full text-start p-3.5 rounded-xl border transition-all duration-200',
                  selected === c.code
                    ? 'border-[#f59e0b]/50 bg-[#f59e0b]/5'
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      selected === c.code ? 'bg-[#f59e0b]/20' : 'bg-white/5',
                    )}>
                      <Calculator className={cn('h-4 w-4', selected === c.code ? 'text-[#f59e0b]' : 'text-white/40')} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{c.label}</p>
                      <p className="text-[10px] text-white/30 font-mono">{c.icon}</p>
                    </div>
                  </div>
                  <CheckCircle2 className={cn('h-4 w-4 shrink-0', selected === c.code ? 'text-[#f59e0b]' : 'text-transparent')} />
                </div>
              </button>
            ))}

            {/* Quota bar */}
            <div className="mt-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50">سهمیه رایگان</span>
                <span className="text-xs font-bold text-white">
                  {guest.remaining} / {guest.total}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] to-[#f97316] transition-all duration-300"
                  style={{ width: `${(guest.remaining / guest.total) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Calculator form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8 h-full">
              {!selected ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calculator className="h-12 w-12 text-white/10 mb-4" />
                  <p className="text-sm text-white/30">یک محاسبه را از سمت راست انتخاب کنید</p>
                </div>
              ) : guest.remaining <= 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <Lock className="h-10 w-10 text-amber-400/60" />
                  <p className="text-sm text-white/60">سهمیه محاسبات رایگان شما تمام شده است</p>
                  <Button onClick={() => guest.setShowModal(true)}>
                    <UserPlus className="h-4 w-4 ml-1.5" />
                    عضویت رایگان — ادامه دهید
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-4 w-4 text-[#f59e0b]" />
                    <h3 className="text-base font-bold text-white">{GUEST_CALCS.find(c => c.code === selected)?.label}</h3>
                    <span className="text-[10px] text-white/30 font-mono">{selected}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-xs font-medium text-white/60 mb-1">
                          {field.label} {field.unit && <span className="text-white/30">({field.unit})</span>}
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={inputs[field.key] ?? ''}
                          onChange={e => setInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#f59e0b]"
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
                    <div className="rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/20 p-4 space-y-2">
                      {Object.entries(result.result ?? {}).map(([key, val]) => {
                        if (key === 'formula' || key === 'code' || key === 'note') return null;
                        return (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <span className="text-white/50">{formatKey(key)}</span>
                            <span className="font-semibold text-white font-mono" dir="ltr">{String(val)}</span>
                          </div>
                        );
                      })}
                      {result.result?.formula && (
                        <p className="text-[10px] text-white/30 font-mono pt-1 border-t border-white/5">{result.result.formula}</p>
                      )}
                      {result.result?.note && (
                        <p className="text-[10px] text-amber-400/60">{result.result.note}</p>
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
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
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
