'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient }    from '@/lib/api/client';
import { cn }           from '@/lib/utils';

// ── فیلدهای ورودی هر calculator ─────────────────────────────────────────────

type Field = { key: string; label: string; unit?: string; required?: boolean; type?: 'number' | 'select'; options?: { value: string; label: string }[]; hint?: string; };

const FIELDS: Record<string, Field[]> = {
  'BASIC-001': [
    { key: 'voltage_v',      label: 'ولتاژ (V)',       unit: 'V' },
    { key: 'current_a',      label: 'جریان (A)',        unit: 'A' },
    { key: 'resistance_ohm', label: 'مقاومت (Ω)',      unit: 'Ω' },
  ],
  'BASIC-002': [
    { key: 'voltage_v',    label: 'ولتاژ',      unit: 'V',  required: true },
    { key: 'current_a',    label: 'جریان',      unit: 'A',  required: true },
    { key: 'power_factor', label: 'ضریب قدرت', required: true },
    { key: 'phase_type',   label: 'نوع فاز', type: 'select', options: [
      { value: 'single', label: 'تکفاز' }, { value: 'three', label: 'سه‌فاز' }
    ]},
  ],
  'BASIC-003': [
    { key: 'voltage_v',  label: 'ولتاژ',  unit: 'V', required: true },
    { key: 'current_a',  label: 'جریان',  unit: 'A', required: true },
    { key: 'phase_type', label: 'نوع فاز', type: 'select', options: [
      { value: 'single', label: 'تکفاز' }, { value: 'three', label: 'سه‌فاز' }
    ]},
  ],
  'BASIC-004': [
    { key: 'active_power_w',   label: 'توان اکتیو',   unit: 'W',  required: true },
    { key: 'apparent_power_va', label: 'توان ظاهری', unit: 'VA', required: true },
  ],
  'BASIC-005': [
    { key: 'active_power_w',   label: 'توان اکتیو',   unit: 'W',  required: true },
    { key: 'apparent_power_va', label: 'توان ظاهری', unit: 'VA', required: true },
  ],
  'CABLE-001': [
    { key: 'load_current',        label: 'جریان بار',         unit: 'A',  required: true },
    { key: 'installation_method', label: 'روش نصب', type: 'select', options: [
      { value: 'B2', label: 'B2 (داخل لوله)' }, { value: 'C', label: 'C (روی دیوار)' }
    ]},
    { key: 'ambient_temperature',  label: 'دمای محیط',        unit: '°C' },
    { key: 'conductor_material',   label: 'جنس هادی', type: 'select', options: [
      { value: 'copper', label: 'مس' }, { value: 'aluminum', label: 'آلومینیوم' }
    ]},
    { key: 'insulation_type', label: 'نوع عایق', type: 'select', options: [
      { value: 'PVC', label: 'PVC' }, { value: 'XLPE', label: 'XLPE' }
    ]},
  ],
  'CABLE-002': [
    { key: 'voltage_v',         label: 'ولتاژ',          unit: 'V',  required: true },
    { key: 'current_a',         label: 'جریان',          unit: 'A',  required: true },
    { key: 'cable_length_m',    label: 'طول کابل',       unit: 'm',  required: true },
    { key: 'cable_size_mm2',    label: 'سطح مقطع کابل', unit: 'mm²',required: true },
    { key: 'conductor_material', label: 'جنس هادی', type: 'select', options: [
      { value: 'copper', label: 'مس' }, { value: 'aluminum', label: 'آلومینیوم' }
    ]},
    { key: 'power_factor',  label: 'ضریب قدرت' },
    { key: 'phase_type',    label: 'نوع فاز', type: 'select', options: [
      { value: 'single', label: 'تکفاز' }, { value: 'three', label: 'سه‌فاز' }
    ]},
  ],
};

// default برای calculatorهایی که fields تعریف نشده‌اند
const DEFAULT_FIELDS: Record<string, Field[]> = {
  'TRF-001': [
    { key: 'apparent_power_kva', label: 'توان ظاهری', unit: 'kVA' },
    { key: 'voltage_primary_v',  label: 'ولتاژ اولیه', unit: 'V' },
    { key: 'voltage_secondary_v',label: 'ولتاژ ثانویه', unit: 'V' },
  ],
  'PROT-001': [
    { key: 'load_current_a',         label: 'جریان بار',        unit: 'A',  required: true },
    { key: 'short_circuit_current_ka',label: 'جریان اتصال کوتاه', unit: 'kA', required: true },
    { key: 'voltage_v',              label: 'ولتاژ',            unit: 'V' },
  ],

  // ── Renewable Energy & Motors ─────────────────────────────────────────────

  'EA-001': [
    { key: 'subscriber_type', label: 'نوع مشترک', type: 'select', options: [
      { value: 'residential',    label: 'خانگی' },
      { value: 'small_commercial', label: 'تجاری کوچک' },
      { value: 'commercial',     label: 'تجاری' },
      { value: 'industrial',     label: 'صنعتی' },
      { value: 'agricultural',   label: 'کشاورزی' },
    ]},
    { key: 'tariff_code', label: 'تعرفه', type: 'select', options: [
      { value: 'tavanir_residential', label: 'خانگی توانیر' },
      { value: 'tavanir_commercial',  label: 'تجاری توانیر' },
      { value: 'tavanir_industrial',  label: 'صنعتی توانیر' },
      { value: 'tavanir_agricultural',label: 'کشاورزی توانیر' },
    ]},
    { key: 'current_kwh',       label: 'مصرف این دوره',        unit: 'kWh', required: true },
    { key: 'billing_days',      label: 'روزهای دوره',          unit: 'روز' },
    { key: 'current_peak_kw',   label: 'حداکثر توان اوج',      unit: 'kW' },
    { key: 'current_kvarh',     label: 'مصرف راکتیو (kVArh)',   unit: 'kVArh' },
    { key: 'power_factor_measured', label: 'ضریب قدرت اندازه‌گیری‌شده', unit: '0-1' },
    { key: 'contract_kw',       label: 'توان قراردادی',        unit: 'kW' },
    { key: 'current_peak_kwh',  label: 'مصرف ساعات اوج',       unit: 'kWh' },
    { key: 'current_offpeak_kwh',label: 'مصرف خارج از اوج',    unit: 'kWh' },
    { key: 'amount_rials',      label: 'مبلغ قبض (برای مقایسه)', unit: 'ریال' },
    { key: 'supply_voltage_kv', label: 'ولتاژ اتصال',          unit: 'kV' },
    { key: 'voltage_level',     label: 'سطح ولتاژ', type: 'select', options: [
      { value: 'LV', label: 'فشارضعیف (<1kV)' },
      { value: 'MV', label: 'متوسط (1-63kV)' },
      { value: 'HV', label: 'فشارقوی (>63kV)' },
    ]},
    { key: 'transformer_kva',   label: 'توان ترانسفورماتور',   unit: 'kVA' },
    { key: 'cable_length_m',    label: 'طول کابل تا تابلو',    unit: 'm' },
    { key: 'cable_size_mm2',    label: 'سطح مقطع کابل',        unit: 'mm²' },
  ],
  'PV-001': [
    { key: 'daily_load_kwh',         label: 'مصرف روزانه',      unit: 'kWh', required: true },
    { key: 'peak_sun_hours',         label: 'ساعت آفتاب اوج (PSH)', unit: 'h',  required: true },
    { key: 'panel_watt_peak',        label: 'توان هر پنل',      unit: 'Wp' },
    { key: 'panel_voc',              label: 'ولتاژ Voc پنل',    unit: 'V' },
    { key: 'panel_vmp',              label: 'ولتاژ Vmp پنل',    unit: 'V' },
    { key: 'panel_isc',              label: 'جریان Isc پنل',    unit: 'A' },
    { key: 'panel_imp',              label: 'جریان Imp پنل',    unit: 'A' },
    { key: 'inverter_voltage_dc_max',label: 'حداکثر ولتاژ DC اینورتر', unit: 'V' },
    { key: 'inverter_voltage_mppt_min',label: 'حداقل MPPT',     unit: 'V' },
    { key: 'inverter_voltage_mppt_max',label: 'حداکثر MPPT',    unit: 'V' },
    { key: 'system_efficiency',      label: 'راندمان سیستم',    unit: '(0-1)' },
    { key: 't_min',                  label: 'حداقل دمای محیط',  unit: '°C' },
    { key: 't_max',                  label: 'حداکثر دمای سلول', unit: '°C' },
  ],

  'MOT-001': [
    { key: 'motor_kw',               label: 'توان موتور',        unit: 'kW',  required: true },
    { key: 'transformer_kva',        label: 'توان ترانسفورماتور', unit: 'kVA', required: true },
    { key: 'motor_voltage_v',        label: 'ولتاژ موتور',       unit: 'V' },
    { key: 'starting_method',        label: 'روش راه‌اندازی', type: 'select', options: [
      { value: 'DOL',            label: 'مستقیم (DOL)' },
      { value: 'StarDelta',      label: 'ستاره-مثلث (Y-Δ)' },
      { value: 'Autotransformer',label: 'اتوترانسفورماتور' },
      { value: 'SoftStarter',    label: 'سافت استارتر' },
      { value: 'VFD',            label: 'درایو (VFD)' },
    ]},
    { key: 'starting_current_factor',label: 'ضریب جریان راه‌اندازی', unit: '×In' },
    { key: 'transformer_impedance_pct',label: 'امپدانس ترانس',   unit: '%' },
    { key: 'cable_length_m',         label: 'طول کابل MCC به موتور', unit: 'm' },
    { key: 'allowable_voltage_dip_pct',label: 'افت ولتاژ مجاز', unit: '%' },
  ],

  'BAT-001': [
    { key: 'load_kw',                label: 'توان بار',          unit: 'kW',  required: true },
    { key: 'backup_hours',           label: 'زمان پشتیبانی',    unit: 'h',   required: true },
    { key: 'battery_type',           label: 'نوع باتری', type: 'select', options: [
      { value: 'LiFePO4',  label: 'لیتیوم آهن فسفات (LiFePO4)' },
      { value: 'LiNMC',    label: 'لیتیوم NMC' },
      { value: 'LeadAcid', label: 'سرب-اسید' },
      { value: 'NaS',      label: 'سدیم-گوگرد (NaS)' },
    ]},
    { key: 'system_voltage',         label: 'ولتاژ سیستم باتری', unit: 'V' },
    { key: 'depth_of_discharge',     label: 'عمق تخلیه (DoD)',  unit: '(0-1)' },
    { key: 'load_power_factor',      label: 'ضریب قدرت بار',    unit: '(0-1)' },
  ],

  // ── SC-001: Short Circuit ─────────────────────────────────────────────────
  'SC-001': [
    { key: 'system_voltage_kv',      label: 'ولتاژ سیستم',         unit: 'kV',  required: true, hint: 'مثال: 0.4 یا 20' },
    { key: 'grid_fault_level_mva',   label: 'توان اتصال کوتاه شبکه', unit: 'MVA', hint: 'مثال: 500' },
    { key: 'transformer_kva',        label: 'توان ترانسفورماتور',  unit: 'kVA', hint: 'مثال: 1000' },
    { key: 'transformer_vk_pct',     label: 'امپدانس کوتاه ترانس', unit: '%',   hint: 'معمولاً 4-8%' },
    { key: 'transformer_vkr_pct',    label: 'مؤلفه مقاومتی ترانس', unit: '%',   hint: 'معمولاً 1%' },
    { key: 'transformer_lv_kv',      label: 'ولتاژ ثانویه ترانس',  unit: 'kV',  hint: 'مثال: 0.4' },
    { key: 'cable_length_m',         label: 'طول کابل تا نقطه خطا', unit: 'm' },
    { key: 'cable_size_mm2',         label: 'سطح مقطع کابل',        unit: 'mm²' },
    { key: 'fault_type',             label: 'نوع خطا', type: 'select', options: [
      { value: 'three_phase',        label: '۳ فاز (بدترین حالت)' },
      { value: 'line_to_line',       label: '۲ فاز' },
      { value: 'single_phase',       label: '۱ فاز به زمین' },
      { value: 'double_phase_earth', label: '۲ فاز به زمین' },
    ]},
    { key: 'voltage_factor_c',       label: 'ضریب ولتاژ c (IEC 60909)', hint: '1.1 برای Isc_max' },
  ],

  // ── PROT-002: Arc Flash ────────────────────────────────────────────────────
  'PROT-002': [
    { key: 'system_voltage_kv',           label: 'ولتاژ سیستم',             unit: 'kV',     required: true, hint: 'مثال: 0.4' },
    { key: 'bolted_fault_ka',             label: 'جریان اتصال کوتاه (از SC-001)', unit: 'kA', required: true, hint: 'مثال: 25' },
    { key: 'arcing_fault_clearing_time_s',label: 'زمان قطع کلید حفاظتی',   unit: 's',      required: true, hint: 'مثال: 0.1' },
    { key: 'working_distance_mm',         label: 'فاصله کار تا قوس',        unit: 'mm',     hint: 'LV≈450mm، MV≈900mm' },
    { key: 'gap_mm',                      label: 'فاصله قوس (gap)',          unit: 'mm',     hint: 'LV switchgear≈32mm' },
    { key: 'enclosure_type',              label: 'نوع محفظه', type: 'select', options: [
      { value: 'switchgear', label: 'تابلو برق / Switchgear' },
      { value: 'MCC',        label: 'مرکز کنترل موتور (MCC)' },
      { value: 'panel',      label: 'پانل کنترل' },
      { value: 'open_air',   label: 'هوای آزاد' },
    ]},
  ],

  // ── GND-001: Grounding ────────────────────────────────────────────────────
  'GND-001': [
    { key: 'soil_resistivity_ohm_m',  label: 'مقاومت ویژه خاک',       unit: 'Ω·m',  required: true, hint: 'رس≈50، لوم≈150، شن≈500' },
    { key: 'electrode_type',          label: 'نوع الکترود', type: 'select', options: [
      { value: 'rod',   label: 'میل‌زمین (Rod)' },
      { value: 'plate', label: 'صفحه زمین (Plate)' },
      { value: 'ring',  label: 'حلقه زمین (Ring)' },
      { value: 'strip', label: 'نوار افقی (Strip)' },
    ]},
    { key: 'rod_length_m',            label: 'طول میل‌زمین',           unit: 'm',    hint: 'معمولاً ۳ متر' },
    { key: 'rod_diameter_mm',         label: 'قطر میل‌زمین',           unit: 'mm',   hint: 'معمولاً ۱۶mm' },
    { key: 'num_rods',                label: 'تعداد میل‌زمین',         unit: 'عدد' },
    { key: 'rod_spacing_m',           label: 'فاصله بین میل‌ها',       unit: 'm',    hint: 'حداقل ۲ برابر طول' },
    { key: 'strip_length_m',          label: 'طول نوار افقی (اختیاری)', unit: 'm' },
    { key: 'max_resistance_ohm',      label: 'حداکثر مقاومت مجاز',    unit: 'Ω',    hint: 'عمومی≤10Ω، حساس≤1Ω' },
    { key: 'fault_current_a',         label: 'جریان خطا',              unit: 'A',    hint: 'برای محاسبه ولتاژ تماس' },
    { key: 'fault_duration_s',        label: 'مدت خطا',                unit: 's',    hint: 'معمولاً 0.5s' },
    { key: 'system_type',             label: 'نوع سیستم زمین', type: 'select', options: [
      { value: 'TN-S',   label: 'TN-S (PE جداگانه)' },
      { value: 'TN-C',   label: 'TN-C (PEN مشترک)' },
      { value: 'TN-C-S', label: 'TN-C-S (ترکیبی)' },
      { value: 'TT',     label: 'TT (زمین مستقل)' },
      { value: 'IT',     label: 'IT (ایزوله از زمین)' },
    ]},
  ],
};

// ── Result Display ────────────────────────────────────────────────────────────

function ResultDisplay({ result }: { result: any }) {
  const data = result?.data?.result ?? result?.result;
  if (!data) return null;

  // نتایج اصلی — flat values
  const results: Record<string, any> = data.results ?? {};
  // نتایج top-level که مستقیم در result هستند (برای محاسبات جدید)
  const topLevel = Object.fromEntries(
    Object.entries(data).filter(([k, v]) =>
      !['results','warnings','recommendations','standards','inputs','battery','specs','standards_info','starting_method_info'].includes(k) &&
      typeof v !== 'object' && !Array.isArray(v)
    )
  );
  const allResults = { ...topLevel, ...results };
  const warnings = data.warnings ?? [];
  const recommendations: string[] = data.recommendations ?? [];

  return (
    <div className="mt-4 space-y-3 animate-fade-in">
      {/* Results */}
      <div className="rounded-[var(--radius-lg)] bg-[hsl(var(--success)/0.08)] border border-[hsl(var(--success)/0.2)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
          <span className="text-sm font-semibold text-[hsl(var(--success))]">نتایج محاسبه</span>
        </div>
        <dl className="space-y-2">
          {Object.entries(allResults).map(([key, val]) => {
            if (val === null || val === undefined) return null;
            return (
              <div key={key} className="flex justify-between items-center py-0.5 border-b border-[hsl(var(--border)/0.4)] last:border-0">
                <dt className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{key}</dt>
                <dd className={`font-mono text-sm font-bold ${
                  typeof val === 'boolean'
                    ? val ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'
                    : 'text-[hsl(var(--foreground))]'
                }`}>
                  {typeof val === 'boolean' ? (val ? '✓ بله' : '✗ خیر') : String(val)}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="rounded-[var(--radius-lg)] bg-[hsl(var(--warning)/0.08)] border border-[hsl(var(--warning)/0.2)] p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-[hsl(var(--warning))]" />
            <span className="text-xs font-semibold text-[hsl(var(--warning))]">هشدارها</span>
          </div>
          <ul className="space-y-1">
            {warnings.map((w: string, i: number) => (
              <li key={i} className="text-xs text-[hsl(var(--warning)/0.8)]">{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────

export function CalculatorForm({ code, onSuccess }: { code: string; onSuccess: (result: any) => void }) {
  const wsId = useAuthStore(s => s.workspaceId);
  const fields = FIELDS[code] ?? DEFAULT_FIELDS[code] ?? [];

  const [values,  setValues]  = useState<Record<string, string>>({});
  const [result,  setResult]  = useState<any>(null);
  const [calcErr, setCalcErr] = useState('');

  const mutation = useMutation({
    mutationFn: () => {
      const inputs: Record<string, any> = {};
      for (const [k, v] of Object.entries(values)) {
        if (v === '' || v === undefined) continue;
        inputs[k] = isNaN(Number(v)) ? v : Number(v);
      }
      return apiClient.post('/engineering/calculations', { type: code, inputs });
    },
    onSuccess: (data: any) => {
      setResult(data);
      setCalcErr('');
      onSuccess(data);
    },
    onError: (err: any) => {
      setCalcErr(err?.message ?? 'خطا در محاسبه');
      setResult(null);
    },
  });

  function set(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues(prev => ({ ...prev, [k]: e.target.value }));
  }

  if (fields.length === 0) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-4">
        فرم این محاسبه در حال آماده‌سازی است
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Fields */}
      {fields.map(field => (
        <div key={field.key}>
          {field.type === 'select' ? (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium">{field.label}</label>
              <select
                value={values[field.key] ?? field.options?.[0]?.value ?? ''}
                onChange={set(field.key)}
                className="flex h-8 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
              >
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <Input
              label={field.unit ? `${field.label} (${field.unit})` : field.label}
              type="number"
              step="any"
              value={values[field.key] ?? ''}
              onChange={set(field.key)}
              required={field.required}
              dir="ltr"
              className="text-sm h-8"
            />
          )}
        </div>
      ))}

      {/* Error */}
      {calcErr && (
        <div className="text-xs text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.2)] rounded-[var(--radius)] px-3 py-2 animate-fade-in">
          {calcErr}
        </div>
      )}

      {/* Submit */}
      <Button
        className="w-full"
        size="sm"
        loading={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        <span>محاسبه</span>
      </Button>

      {/* Result */}
      {result && <ResultDisplay result={result} />}
    </div>
  );
}
