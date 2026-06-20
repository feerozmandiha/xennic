'use client';

import { useState, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient }    from '@/lib/api/client';
import { cn }           from '@/lib/utils';
import { TCCChart, HarmonicChart, CableChart } from './charts';
import { downloadPdfReport } from './pdf-report';
import { CALC_META } from '../utils/calc-meta';
import { RESULT_LABELS } from '../utils/result-labels';
import { toPng } from 'html-to-image';

// ── فیلدهای ورودی هر calculator ─────────────────────────────────────────────

type Field = { key: string; label: string; unit?: string; required?: boolean; type?: 'number' | 'select' | 'text'; options?: { value: string; label: string }[]; hint?: string; };

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

  // ── CABLE-003: Short Circuit Withstand (IEC 60949) ──────────────────────────
  'CABLE-003': [
    { key: 'short_circuit_current_ka', label: 'جریان اتصال کوتاه', unit: 'kA', required: true, hint: 'مثال: 25' },
    { key: 'fault_duration_s',         label: 'مدت خطا',           unit: 's',  required: true, hint: 'مثال: 0.1 تا 5' },
    { key: 'conductor_material',       label: 'جنس هادی', type: 'select', options: [
      { value: 'copper', label: 'مس' }, { value: 'aluminum', label: 'آلومینیوم' }
    ]},
    { key: 'insulation_type',          label: 'نوع عایق', type: 'select', options: [
      { value: 'PVC', label: 'PVC' }, { value: 'XLPE', label: 'XLPE' }, { value: 'EPR', label: 'EPR' }
    ]},
  ],

  // ── CABLE-004: PE Conductor Sizing (IEC 60364-5-54) ─────────────────────────
  'CABLE-004': [
    { key: 'phase_conductor_size',  label: 'سطح مقطع هادی فاز', unit: 'mm²', required: true, hint: 'مثال: 50' },
    { key: 'conductor_material',    label: 'جنس هادی', type: 'select', options: [
      { value: 'copper', label: 'مس' }, { value: 'aluminum', label: 'آلومینیوم' }
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

  // ── TRF-002: Transformer Losses (IEC 60076) ─────────────────────────────────
  'TRF-002': [
    { key: 'no_load_loss_w',         label: 'تلفات بی‌باری (هسته)', unit: 'W',  required: true, hint: 'از کاتالوگ ترانس' },
    { key: 'load_loss_w',            label: 'تلفات بارداری (مس)',   unit: 'W',  required: true, hint: 'از کاتالوگ ترانس' },
    { key: 'load_factor',            label: 'ضریب بار',              unit: '(0-1)', hint: 'مثال: 0.75' },
    { key: 'operating_hours_per_year', label: 'ساعت کار سالانه',    unit: 'h',  hint: 'پیش‌فرض ۸۷۶۰' },
    { key: 'energy_cost_per_kwh',    label: 'قیمت برق',             unit: 'USD/kWh', hint: 'پیش‌فرض 0.12' },
  ],

  // ── TRF-003: Voltage Regulation (IEC 60076) ─────────────────────────────────
  'TRF-003': [
    { key: 'impedance_percent', label: 'امپدانس اتصال کوتاه', unit: '%', required: true, hint: 'مثال: 4-7%' },
    { key: 'power_factor',      label: 'ضریب قدرت بار',      unit: '(0-1)', required: true, hint: 'مثال: 0.85' },
    { key: 'load_percent',      label: 'درصد بار',            unit: '%',     hint: 'پیش‌فرض ۱۰۰٪' },
  ],

  // ── TRF-004: K-Factor (IEEE C57.110) ────────────────────────────────────────
  'TRF-004': [
    { key: 'h1_current',        label: 'جریان هارمونیک اصلی (ترد ۱)', unit: 'A', hint: 'درصد از جریان نامی' },
    { key: 'h3_current',        label: 'هارمونیک ۳',                  unit: 'A' },
    { key: 'h5_current',        label: 'هارمونیک ۵',                  unit: 'A' },
    { key: 'h7_current',        label: 'هارمونیک ۷',                  unit: 'A' },
    { key: 'h11_current',       label: 'هارمونیک ۱۱',                 unit: 'A' },
    { key: 'h13_current',       label: 'هارمونیک ۱۳',                 unit: 'A' },
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

  'MOT-002': [
    { key: 'rated_power_kw',          label: 'توان نامی موتور',            unit: 'kW',  required: true, hint: 'مثال: 37' },
    { key: 'ie_class',                label: 'کلاس IE موتور', type: 'select', options: [
      { value: 'IE1', label: 'IE1 — استاندارد معمولی' },
      { value: 'IE2', label: 'IE2 — راندمان بالا' },
      { value: 'IE3', label: 'IE3 — راندمان خیلی بالا (Premium)' },
      { value: 'IE4', label: 'IE4 — فوق Premium (Super Premium)' },
    ]},
    { key: 'declared_efficiency_pct', label: 'راندمان نامی از روی پلاک',   unit: '%',  required: true, hint: 'از کاتالوگ موتور' },
    { key: 'pole_count',              label: 'تعداد قطب', type: 'select', options: [
      { value: '2', label: '۲ قطب (3000 rpm)' },
      { value: '4', label: '۴ قطب (1500 rpm)' },
      { value: '6', label: '۶ قطب (1000 rpm)' },
      { value: '8', label: '۸ قطب (750 rpm)' },
    ]},
    { key: 'load_factor',             label: 'ضریب بار متوسط',              unit: '(0-1)', hint: 'مثال: 0.75' },
    { key: 'annual_operating_hours',  label: 'ساعت کار سالانه',            unit: 'h' },
    { key: 'energy_cost_per_kwh',     label: 'قیمت برق',                   unit: 'USD/kWh' },
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

  // ── ARC-001: Incident Energy (Arc Flash) — IEEE 1584-2018 ───────────────────
  'ARC-001': [
    { key: 'system_voltage_kv',           label: 'ولتاژ سیستم',             unit: 'kV',     required: true, hint: 'مثال: 0.4' },
    { key: 'bolted_fault_ka',             label: 'جریان اتصال کوتاه',       unit: 'kA',     required: true, hint: 'مثال: 25' },
    { key: 'clearing_time_s',             label: 'زمان قطع (کلید)',         unit: 's',      required: true, hint: 'LV≈0.1s, MV≈0.2s' },
    { key: 'gap_mm',                      label: 'فاصله هادی‌ها (gap)',     unit: 'mm',     hint: 'LV≈32mm, MV≈104mm' },
    { key: 'working_distance_mm',         label: 'فاصله کاری',              unit: 'mm',     hint: 'LV≈457mm, MV≈914mm' },
    { key: 'enclosure_type',              label: 'نوع محفظه', type: 'select', options: [
      { value: 'enclosed',   label: 'محصور / Enclosed' },
      { value: 'switchgear', label: 'تابلو برق / Switchgear' },
      { value: 'MCC',        label: 'مرکز کنترل موتور (MCC)' },
      { value: 'open_air',   label: 'هوای آزاد / Open Air' },
    ]},
    { key: 'electrode_config',           label: 'آرایش الکترود', type: 'select', options: [
      { value: 'VCB',  label: 'VCB (عمودی داخل محفظه)' },
      { value: 'HCB',  label: 'HCB (افقی داخل محفظه)' },
      { value: 'HOA',  label: 'HOA (افقی هوای آزاد)' },
      { value: 'VOA',  label: 'VOA (عمودی هوای آزاد)' },
    ], hint: 'VCB برای اکثر تاسیسات LV' },
    { key: 'system_freq_hz',             label: 'فرکانس شبکه',              unit: 'Hz',     hint: '۵۰ یا ۶۰' },
  ],

  // ── PQ-001: THD (Total Harmonic Distortion) ────────────────────────────────
  'PQ-001': [
    { key: 'h1_current',    label: 'جریان هارمونیک اصلی (ترد ۱)',   unit: 'A', hint: 'مؤلفه اصلی (50Hz)' },
    { key: 'h3_current',    label: 'هارمونیک ۳',                    unit: 'A' },
    { key: 'h5_current',    label: 'هارمونیک ۵',                    unit: 'A' },
    { key: 'h7_current',    label: 'هارمونیک ۷',                    unit: 'A' },
    { key: 'h11_current',   label: 'هارمونیک ۱۱',                   unit: 'A' },
    { key: 'h13_current',   label: 'هارمونیک ۱۳',                   unit: 'A' },
    { key: 'base_voltage_kv', label: 'ولتاژ سیستم',                 unit: 'kV', hint: 'برای تعیین دسته IEEE 519' },
  ],

  // ── PQ-002: TDD (Total Demand Distortion) ──────────────────────────────────
  'PQ-002': [
    { key: 'h3_current',    label: 'هارمونیک ۳',                    unit: 'A', required: true },
    { key: 'h5_current',    label: 'هارمونیک ۵',                    unit: 'A', required: true },
    { key: 'h7_current',    label: 'هارمونیک ۷',                    unit: 'A' },
    { key: 'h11_current',   label: 'هارمونیک ۱۱',                   unit: 'A' },
    { key: 'h13_current',   label: 'هارمونیک ۱۳',                   unit: 'A' },
    { key: 'max_demand_current_a', label: 'حداکثر جریان بار (IL)', unit: 'A', required: true, hint: 'میانگین پیک ۱۲ ماه' },
    { key: 'isc_il_ratio',  label: 'نسبت Isc/IL',                    unit: '',  hint: 'برای تعیین حد IEEE 519' },
  ],

  // ── PQ-003: K-Factor ───────────────────────────────────────────────────────
  'PQ-003': [
    { key: 'h1_current',    label: 'جریان اصلی (ترد ۱)',            unit: 'A', required: true },
    { key: 'h3_current',    label: 'هارمونیک ۳',                    unit: 'A' },
    { key: 'h5_current',    label: 'هارمونیک ۵',                    unit: 'A' },
    { key: 'h7_current',    label: 'هارمونیک ۷',                    unit: 'A' },
    { key: 'h11_current',   label: 'هارمونیک ۱۱',                   unit: 'A' },
    { key: 'h13_current',   label: 'هارمونیک ۱۳',                   unit: 'A' },
    { key: 'transformer_kva', label: 'توان ترانسفورماتور',         unit: 'kVA', hint: 'برای توصیه درِیتینگ' },
  ],

  // ── PQ-004: Resonance Analysis ─────────────────────────────────────────────
  'PQ-004': [
    { key: 'system_kva_sc',   label: 'توان اتصال کوتاه PCC',       unit: 'kVA', required: true },
    { key: 'capacitor_kvar',  label: 'توان بانک خازنی',            unit: 'kVAR', required: true },
    { key: 'fundamental_freq_hz', label: 'فرکانس شبکه',            unit: 'Hz',   hint: '۵۰ یا ۶۰' },
    { key: 'present_harmonics', label: 'هارمونیک‌های موجود',       type: 'text', hint: 'مثال: 5,7,11,13' },
  ],

  // ── PQ-005: Passive Filter Design ──────────────────────────────────────────
  'PQ-005': [
    { key: 'target_harmonic_order', label: 'مرتبه هارمونیک هدف',   required: true, hint: 'مثال: 5 برای هارمونیک ۵' },
    { key: 'system_voltage_v',      label: 'ولتاژ خط سیستم',      unit: 'V',  required: true },
    { key: 'harmonic_current_a',    label: 'جریان هارمونیک هدف',   unit: 'A',  required: true },
    { key: 'system_freq_hz',        label: 'فرکانس شبکه',         unit: 'Hz', hint: '۵۰ یا ۶۰' },
    { key: 'q_factor',              label: 'ضریب کیفیت (Q)',      hint: 'معمولاً ۲۰-۱۰۰' },
    { key: 'detuning_factor',       label: 'ضریب دیتونینگ (p)',   hint: 'معمولاً 0.95-0.98' },
  ],

  // ── PQ-006: Active Filter Sizing ───────────────────────────────────────────
  'PQ-006': [
    { key: 'h3_current',    label: 'هارمونیک ۳',                    unit: 'A', required: true },
    { key: 'h5_current',    label: 'هارمونیک ۵',                    unit: 'A', required: true },
    { key: 'h7_current',    label: 'هارمونیک ۷',                    unit: 'A' },
    { key: 'h11_current',   label: 'هارمونیک ۱۱',                   unit: 'A' },
    { key: 'h13_current',   label: 'هارمونیک ۱۳',                   unit: 'A' },
    { key: 'target_thd_percent', label: 'THD هدف پس از فیلتر',     unit: '%', hint: 'IEEE 519: 5%' },
    { key: 'fundamental_current_a', label: 'جریان اصلی (فاندامنتال)', unit: 'A', required: true },
    { key: 'system_voltage_v',  label: 'ولتاژ خط سیستم',           unit: 'V',  required: true },
    { key: 'max_harmonic_order', label: 'حداکثر مرتبه هارمونیک',   hint: 'معمولاً ۵۰' },
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

  // ── CABLE-005: Cable Tray Sizing ────────────────────────────────────────────
  'CABLE-005': [
    { key: 'tray_width_mm',  label: 'عرض نردبان/ترِی', unit: 'mm', required: true, hint: 'مثال: 300' },
    { key: 'tray_depth_mm',  label: 'عمق نردبان/ترِی', unit: 'mm', required: true, hint: 'مثال: 100' },
    { key: 'tray_type',      label: 'نوع نردبان', type: 'select', options: [
      { value: 'perforated',   label: 'سوراخ‌دار (Perforated)' },
      { value: 'ladder',       label: 'نردبانی (Ladder)' },
      { value: 'solid_bottom', label: 'ته‌بسته (Solid Bottom)' },
      { value: 'wire_mesh',    label: 'توری سیمی (Wire Mesh)' },
    ]},
    { key: 'cable_diam_15',  label: 'کابل Ø15mm (تعداد)', unit: 'عدد' },
    { key: 'cable_diam_20',  label: 'کابل Ø20mm (تعداد)', unit: 'عدد' },
    { key: 'cable_diam_25',  label: 'کابل Ø25mm (تعداد)', unit: 'عدد' },
    { key: 'cable_diam_32',  label: 'کابل Ø32mm (تعداد)', unit: 'عدد' },
    { key: 'cable_diam_40',  label: 'کابل Ø40mm (تعداد)', unit: 'عدد' },
    { key: 'cable_diam_50',  label: 'کابل Ø50mm (تعداد)', unit: 'عدد' },
    { key: 'spare_percent',  label: 'درصد فضای خالی (Spare)', unit: '%' },
  ],

  // ── SWT-001: Main Switch / Incomer Selection ────────────────────────────────
  'SWT-001': [
    { key: 'total_connected_kva',        label: 'بار کل متصل',              unit: 'kVA', hint: 'مجموع بارهای نصب‌شده' },
    { key: 'transformer_kva',            label: 'توان ترانسفورماتور',        unit: 'kVA', hint: 'مثال: 630 یا 1000' },
    { key: 'diversity_factor',           label: 'ضریب همزمانی (Diversity)', unit: '(0-1)', hint: 'معمولاً 0.6-0.9' },
    { key: 'short_circuit_current_ka',   label: 'جریان اتصال کوتاه نقطه',    unit: 'kA', required: true, hint: 'از محاسبات SC' },
    { key: 'voltage_v',                  label: 'ولتاژ سیستم',              unit: 'V',  required: true },
    { key: 'switch_type',               label: 'نوع کلید', type: 'select', options: [
      { value: 'mccb',          label: 'MCCB (کلید کامپکت)' },
      { value: 'acb',           label: 'ACB (کلید هوایی)' },
      { value: 'switch_disconnector', label: 'سویچ-دیسکانکت (بدون حفاظت)' },
      { value: 'changeover',    label: 'چنج‌اور (دو منبع)' },
      { value: 'switch_fuse',   label: 'سویچ-فیوز' },
    ]},
    { key: 'num_sources',               label: 'تعداد منابع ورودی', type: 'select', options: [
      { value: '1', label: 'تک منبع' },
      { value: '2', label: 'دو منبع (چنج‌اور)' },
      { value: '3', label: 'سه منبع (رینگ)' },
    ]},
    { key: 'pole_count',                label: 'تعداد پل', type: 'select', options: [
      { value: '3', label: '۳ پل (۳P)' },
      { value: '4', label: '۴ پل (۴P با نول)' },
    ]},
    { key: 'lsig_required',             label: 'نیاز به تنظیمات LSIG', type: 'select', options: [
      { value: 'true',  label: 'بله — برای ACB/MCCB' },
      { value: 'false', label: 'خیر' },
    ]},
    { key: 'ambient_temperature',       label: 'دمای محیط تابلو', unit: '°C' },
  ],

  // ── ECO-001: ROI ────────────────────────────────────────────────────────────
  'ECO-001': [
    { key: 'initial_investment',    label: 'سرمایه اولیه',              unit: 'USD', required: true, hint: 'مثال: 10000' },
    { key: 'annual_savings',        label: 'صرفه‌جویی سالانه',          unit: 'USD', required: true, hint: 'مثال: 3000' },
    { key: 'annual_operating_costs',label: 'هزینه‌های عملیاتی سالانه',  unit: 'USD', hint: 'صفر پیش‌فرض' },
    { key: 'analysis_years',        label: 'دوره تحلیل',                unit: 'سال', hint: '۱۰ پیش‌فرض' },
    { key: 'discount_rate_pct',     label: 'نرخ تنزیل',                  unit: '%',   hint: 'صفر=ROI ساده' },
  ],

  // ── ECO-002: NPV ────────────────────────────────────────────────────────────
  'ECO-002': [
    { key: 'initial_investment',  label: 'سرمایه اولیه',              unit: 'USD', required: true, hint: 'مثال: 10000' },
    { key: 'cash_flows',          label: 'جریان‌های نقدی سالانه',       unit: 'USD', required: true, hint: 'مثال: [3000,3000,3000,3000,3000]' },
    { key: 'discount_rate_pct',   label: 'نرخ تنزیل',                   unit: '%',   required: true, hint: '۱۰ مثال' },
  ],

  // ── ECO-003: IRR ────────────────────────────────────────────────────────────
  'ECO-003': [
    { key: 'initial_investment',  label: 'سرمایه اولیه',              unit: 'USD', required: true, hint: 'مثال: 10000' },
    { key: 'cash_flows',          label: 'جریان‌های نقدی سالانه',       unit: 'USD', required: true, hint: 'مثال: [3000,3000,3000,3000,3000]' },
  ],

  // ── SOLAR-002: Inverter Sizing ──────────────────────────────────────────────
  'SOLAR-002': [
    { key: 'pv_capacity_kwp',           label: 'ظرفیت کل آرایه PV',            unit: 'kWp',required: true, hint: 'مثال: 100' },
    { key: 'module_watt_peak',          label: 'توان نامی پنل',                unit: 'Wp', required: true, hint: '۴۵۰-۶۰۰' },
    { key: 'module_voc_v',              label: 'Voc پنل',                      unit: 'V',   required: true, hint: 'STC' },
    { key: 'module_vmp_v',              label: 'Vmp پنل',                      unit: 'V',   required: true, hint: 'STC' },
    { key: 'module_isc_a',              label: 'Isc پنل',                      unit: 'A',   required: true, hint: 'STC' },
    { key: 'module_imp_a',              label: 'Imp پنل',                      unit: 'A',   required: true, hint: 'STC' },
    { key: 'module_temp_coeff_voc_pct', label: 'ضریب دمایی Voc',              unit: '%/°C',hint: '۲۷/۰- پیش‌فرض' },
    { key: 't_min_c',                   label: 'دمای محیط حداقل',              unit: '°C',  hint: '۱۰- پیش‌فرض' },
    { key: 't_max_c',                   label: 'دمای سلول حداکثر',            unit: '°C',  hint: '۷۰ پیش‌فرض' },
    { key: 'inverter_ac_power_kw',      label: 'توان AC اینورتر',              unit: 'kW',  hint: '۱۰۰ پیش‌فرض' },
    { key: 'inverter_max_dc_voltage_v', label: 'حداکثر ولتاژ DC اینورتر',     unit: 'V',   hint: '۱۰۰۰/۱۵۰۰' },
    { key: 'inverter_mppt_min_v',       label: 'حداقل ولتاژ MPPT',             unit: 'V',   hint: '۲۰۰ پیش‌فرض' },
    { key: 'inverter_mppt_max_v',       label: 'حداکثر ولتاژ MPPT',            unit: 'V',   hint: '۸۰۰ پیش‌فرض' },
    { key: 'inverter_max_input_current_a',label:'حداکثر جریان ورودی DC',      unit: 'A',   hint: '۲۰۰ پیش‌فرض' },
    { key: 'inverter_type',             label: 'نوع اینورتر', type: 'select', options: [
      { value: 'string', label: 'String (متداول)' },
      { value: 'central',label: 'Central (نیروگاهی)' },
      { value: 'micro',  label: 'Micro (پشت بامی)' },
    ]},
    { key: 'dc_ac_ratio_target',        label: 'نسبت DC/AC هدف',               unit: '',    hint: '۲۵/۱ پیش‌فرض' },
    { key: 'ac_voltage_v',              label: 'ولتاژ خروجی AC',               unit: 'V',   hint: '۴۰۰ سه فاز' },
    { key: 'max_ambient_temp_c',        label: 'دمای محیط اینورتر',            unit: '°C',  hint: '۴۰ پیش‌فرض' },
    { key: 'altitude_m',                label: 'ارتفاع از سطح دریا',           unit: 'm',   hint: 'صفر پیش‌فرض' },
  ],

  // ── BAT-BU-001: Battery Backup Time ──────────────────────────────────────────
  'BAT-BU-001': [
    { key: 'battery_capacity_ah', label: 'ظرفیت بانک باتری',               unit: 'Ah',    required: true, hint: 'مثال: ۲۰۰' },
    { key: 'system_voltage_v',    label: 'ولتاژ سیستم',                    unit: 'V',     hint: '۴۸ پیش‌فرض' },
    { key: 'load_power_kw',       label: 'قدرت بار',                      unit: 'kW',    required: true, hint: 'مثال: ۵' },
    { key: 'depth_of_discharge',  label: 'عمق تخلیه مجاز (DoD)',            unit: '',      hint: '۸۰/۰ پیش‌فرض' },
    { key: 'inverter_efficiency', label: 'راندمان اینورتر',                 unit: '',      hint: '۹۵/۰ پیش‌فرض' },
    { key: 'battery_efficiency',  label: 'راندمان باتری',                   unit: '',      hint: '۹۵/۰ پیش‌فرض' },
    { key: 'temperature_c',       label: 'دمای محیط',                      unit: '°C',    hint: '۲۵ پیش‌فرض' },
    { key: 'individual_loads_kw', label: 'بارهای مجزا (JSON)',              unit: 'kW',    hint: 'مثال: [3,2,1.5]' },
  ],

  // ── SOLAR-003: Solar Battery Sizing (IEC 62548) ─────────────────────────────
  'SOLAR-003': [
    { key: 'daily_load_kwh',         label: 'مصرف روزانه انرژی',               unit: 'kWh/day', required: true, hint: 'مثال: ۳۰' },
    { key: 'autonomy_days',           label: 'روزهای خودمختاری',                unit: 'روز',     hint: '۲ پیش‌فرض' },
    { key: 'battery_type',            label: 'نوع باتری', type: 'select', options: [
      { value: 'LiFePO4', label: 'LiFePO4 (لیتیوم آهن)' },
      { value: 'LiNMC',   label: 'LiNMC (لیتیوم)' },
      { value: 'LeadAcid',label: 'Lead-Acid (سرب-اسید تر)' },
      { value: 'AGM',     label: 'AGM (سرب-اسید خشک)' },
      { value: 'Gel',     label: 'Gel (ژل)' },
      { value: 'NaS',     label: 'NaS (سدیم-گوگرد)' },
      { value: 'NiCd',    label: 'NiCd (نیکل-کادمیم)' },
    ]},
    { key: 'system_voltage_v',        label: 'ولتاژ اسمی بانک باتری',           unit: 'V',     hint: '۴۸ پیش‌فرض' },
    { key: 'depth_of_discharge',      label: 'عمق تخلیه (DoD)',                 unit: '',      hint: '۸۰/۰ برای LiFePO4' },
    { key: 'temperature_c',           label: 'دمای حداقل محیط',                 unit: '°C',    hint: '۲۵ پیش‌فرض' },
    { key: 'inverter_efficiency',     label: 'راندمان اینورتر',                  unit: '',      hint: '۹۵/۰ پیش‌فرض' },
    { key: 'battery_efficiency',      label: 'راندمان باتری',                   unit: '',      hint: '۹۵/۰ پیش‌فرض' },
    { key: 'system_efficiency',       label: 'راندمان کلی DC',                  unit: '',      hint: '۸۰/۰ پیش‌فرض' },
    { key: 'max_c_rate',              label: 'حداکثر C-Rate مجاز',               unit: '',      hint: '۵/۰ پیش‌فرض' },
    { key: 'target_charge_rate_c',    label: 'نرخ شارژ هدف',                    unit: 'C',     hint: '۱۲۵/۰ برای سرب-اسید' },
    { key: 'load_power_factor',       label: 'ضریب قدرت بار',                   unit: '',      hint: '۹۰/۰ پیش‌فرض' },
    { key: 'pv_capacity_kwp',         label: 'ظرفیت آرایه PV (اختیاری)',        unit: 'kWp',   hint: 'برای محاسبه کنترلر شارژ' },
    { key: 'peak_sun_hours',          label: 'PSH (اختیاری)',                    unit: 'h/day', hint: '۵/۵ مثال' },
    { key: 'battery_cell_voltage_v',  label: 'ولتاژ اسمی سلول',                unit: 'V',     hint: 'LiFePO4=3.2V, سرب-اسید=2V' },
    { key: 'battery_cell_capacity_ah',label: 'ظرفیت هر سلول (اختیاری)',         unit: 'Ah',    hint: '۲۰۰ مثال' },
    { key: 'max_charge_current_a',    label: 'حداکثر جریان شارژ (اختیاری)',     unit: 'A',     hint: 'خالی = محاسبه خودکار' },
    { key: 'days_of_cloudy',          label: 'روزهای ابری متوالی',              unit: 'روز',   hint: 'صفر پیش‌فرض' },
  ],

  // ── PROT-005: Protection Coordination Study ─────────────────────────────────
  'PROT-005': [
    // ── Upstream Device ──
    { key: 'up_name',             label: 'نام دستگاه بالادست',                unit: '', required: true, hint: 'مثال: MCCB اصلی' },
    { key: 'up_rated_current_a',  label: 'جریان نامی بالادست (In)',          unit: 'A', required: true },
    { key: 'up_curve_type',       label: 'منحنی بالادست', type: 'select', options: [
      { value: 'SI', label: 'SI (Standard Inverse)' },
      { value: 'VI', label: 'VI (Very Inverse)' },
      { value: 'EI', label: 'EI (Extremely Inverse)' },
      { value: 'LTI',label: 'LTI (Long Time)' },
      { value: 'I2T',label: 'I²t (فیوز)' },
    ]},
    { key: 'up_tms',              label: 'TMS بالادست',                      unit: '', hint: '۱/۰ پیش‌فرض' },
    { key: 'up_l_pickup',         label: 'L-Pickup بالادست (×In)',           unit: '', hint: '۱ پیش‌فرض' },
    { key: 'up_s_pickup',         label: 'S-Pickup بالادست (×In)',           unit: '', hint: 'خالی=ندارد' },
    { key: 'up_s_delay_s',        label: 'S-Delay بالادست (s)',              unit: 's', hint: 'خالی=ندارد' },
    { key: 'up_i_pickup',         label: 'Ii بالادست (×In)',                 unit: '', hint: 'خالی=ندارد' },
    // ── Downstream Device ──
    { key: 'down_name',             label: 'نام دستگاه پایین‌دست',            unit: '', required: true, hint: 'مثال: MCCB فرعی' },
    { key: 'down_rated_current_a',  label: 'جریان نامی پایین‌دست (In)',      unit: 'A', required: true },
    { key: 'down_curve_type',       label: 'منحنی پایین‌دست', type: 'select', options: [
      { value: 'SI', label: 'SI (Standard Inverse)' },
      { value: 'VI', label: 'VI (Very Inverse)' },
      { value: 'EI', label: 'EI (Extremely Inverse)' },
      { value: 'LTI',label: 'LTI (Long Time)' },
      { value: 'I2T',label: 'I²t (فیوز)' },
    ]},
    { key: 'down_tms',              label: 'TMS پایین‌دست',                   unit: '', hint: '۱/۰ پیش‌فرض' },
    { key: 'down_l_pickup',         label: 'L-Pickup پایین‌دست (×In)',        unit: '', hint: '۱ پیش‌فرض' },
    { key: 'down_s_pickup',         label: 'S-Pickup پایین‌دست (×In)',        unit: '', hint: 'خالی=ندارد' },
    { key: 'down_s_delay_s',        label: 'S-Delay پایین‌دست (s)',           unit: 's', hint: 'خالی=ندارد' },
    { key: 'down_i_pickup',         label: 'Ii پایین‌دست (×In)',              unit: '', hint: 'خالی=ندارد' },
    // ── System ──
    { key: 'system_voltage_v',      label: 'ولتاژ سیستم',                    unit: 'V', hint: '۴۰۰ پیش‌فرض' },
    { key: 'selectivity_margin_ms', label: 'حاشیه سلکتیویته',                unit: 'ms', hint: '۱۰۰ پیش‌فرض' },
  ],

  // ── BATTERY-002: Battery Charger Selection ──────────────────────────────────
  'BATTERY-002': [
    { key: 'battery_capacity_ah',    label: 'ظرفیت بانک باتری',             unit: 'Ah',  required: true, hint: 'مثال: 200' },
    { key: 'system_voltage_dc_v',    label: 'ولتاژ اسمی DC',                unit: 'V',   required: true, hint: '۴۸، ۱۱۰، یا ۲۲۰' },
    { key: 'battery_type',           label: 'نوع باتری', type: 'select', options: [
      { value: 'VRLA',    label: 'VRLA (سرب-اسید بدون نگهداری)' },
      { value: 'flooded', label: 'Flooded (سرب-اسید تر)' },
      { value: 'LiFePO4', label: 'LiFePO4 (لیتیوم)' },
      { value: 'LiNMC',   label: 'LiNMC (لیتیوم)' },
    ]},
    { key: 'cells_per_bank',     label: 'تعداد سلول سری',  unit: 'عدد', hint: '۲۴=۴۸V VRLA' },
    { key: 'charge_rate_c',      label: 'نرخ شارژ (C-Rate)', unit: '',   hint: '۱۲۵/۰ برای سرب-اسید' },
    { key: 'recharge_time_hours',label: 'زمان شارژ مجدد',    unit: 'h',  hint: 'معمولاً ۸h' },
    { key: 'simultaneous_load_kw',label: 'بار همزمان DC',    unit: 'kW', hint: 'صفر اگر ندارد' },
    { key: 'charger_type',       label: 'تکنولوژی شارژر', type: 'select', options: [
      { value: 'high_frequency', label: 'High Frequency (توصیه می‌شود)' },
      { value: 'thyristor',      label: 'Thyristor (مقاوم‌تر)' },
    ]},
    { key: 'ac_voltage_v',       label: 'ولتاژ تغذیه AC',   unit: 'V',   hint: '۴۰۰ سه فاز' },
    { key: 'ac_frequency_hz',    label: 'فرکانس AC',          unit: 'Hz', hint: '۵۰ یا ۶۰' },
    { key: 'ambient_temp_c',     label: 'دمای محیط',          unit: '°C', hint: '۳۰ پیش‌فرض' },
    { key: 'altitude_m',         label: 'ارتفاع از سطح دریا', unit: 'm',  hint: 'صفر پیش‌فرض' },
    { key: 'target_power_factor',label: 'ضریب قدرت هدف',      unit: '',   hint: '۹۲/۰ پیش‌فرض' },
  ],

  // ── HARM-001: Advanced Harmonic Analysis ────────────────────────────────────
  'HARM-001': [
    { key: 'system_voltage_v',         label: 'ولتاژ خط',                      unit: 'V',    required: true, hint: 'مثال: 400' },
    { key: 'fundamental_current_a',     label: 'جریان نامی',                   unit: 'A',    required: true, hint: 'مثال: 100' },
    { key: 'fundamental_freq_hz',       label: 'فرکانس',                       unit: 'Hz',   hint: '۵۰ یا ۶۰' },
    { key: 'target_thd_percent',        label: 'THD هدف',                      unit: '%',    hint: 'معمولاً ۵%' },
    { key: 'harmonic_spectrum',         label: 'طیف هارمونیک (JSON)',           unit: '',     required: true, hint: 'مثال: {"5":20,"7":14,"11":9,"13":6}' },
    { key: 'interharmonic_spectrum',    label: 'طیف اینترهارمونیک (JSON)',      unit: '',     hint: 'مثال: {"175":5,"225":3}' },
    { key: 'filter_topology',           label: 'توپولوژی فیلتر', type: 'select', options: [
      { value: 'LCL', label: 'LCL (توصیه می‌شود)' },
      { value: 'L',   label: 'L (ساده)' },
    ]},
    { key: 'switching_frequency_hz',    label: 'فرکانس سوییچینگ',              unit: 'Hz',   hint: '۱۰ کیلوهرتز پیش‌فرض' },
    { key: 'dq_bandwidth_hz',           label: 'پهنای باند کنترل dq',          unit: 'Hz',   hint: '۵۰۰ پیش‌فرض' },
    { key: 'max_compensation_order',    label: 'حداکثر مرتبه جبران',           unit: 'عدد', hint: '۵۰ پیش‌فرض' },
    { key: 'dc_bus_voltage_v',          label: 'ولتاژ باس DC (اختیاری)',       unit: 'V',    hint: 'خالی = تخمین خودکار' },
  ],

  // ── PFC-001: Capacitor Bank Sizing (IEC 60831) ─────────────────────────────
  'PFC-001': [
    { key: 'active_power_kw',         label: 'توان اکتیو بار',                 unit: 'kW',    hint: 'مثال: ۲۰۰' },
    { key: 'apparent_power_kva',      label: 'توان ظاهری بار (جایگزین)',       unit: 'kVA',   hint: 'در صورت نداشتن توان اکتیو' },
    { key: 'power_factor_current',    label: 'ضریب قدرت فعلی',                 unit: '',      required: true, hint: '۸۰/۰ مثال' },
    { key: 'power_factor_target',     label: 'ضریب قدرت هدف',                 unit: '',      hint: '۹۵/۰ پیش‌فرض' },
    { key: 'voltage_v',               label: 'ولتاژ خط',                       unit: 'V',     hint: '۴۰۰ پیش‌فرض' },
    { key: 'system_freq_hz',          label: 'فرکانس',                         unit: 'Hz',    hint: '۵۰ پیش‌فرض' },
    { key: 'step_count',              label: 'تعداد پله (۱=ثابت)',              unit: 'عدد',  hint: '۶ پله پیشنهادی' },
    { key: 'short_circuit_mva',       label: 'قدرت اتصال کوتاه (اختیاری)',     unit: 'MVA',   hint: 'برای محاسبه جریان هجومی' },
    { key: 'detuning_pct',            label: 'درصد دی‌تیونینگ (۷=توصیه)',       unit: '%',     hint: 'صفر=بدون رآکتور' },
    { key: 'load_hours_per_year',     label: 'ساعات کار سالانه',               unit: 'h',     hint: '۶۰۰۰ مثال' },
    { key: 'energy_cost_per_kwh',     label: 'قیمت انرژی',                     unit: 'USD/kWh', hint: '۱۲/۰ مثال' },
    { key: 'capacitor_cost_per_kvar', label: 'هزینه بانک خازنی',               unit: 'USD/kVAr', hint: '۱۵ پیش‌فرض' },
  ],

  // ── GND-002: Grounding Grid Design (IEEE Std 80-2013) ───────────────────────
  'GND-002': [
    { key: 'grid_length_m',            label: 'طول شبکه زمین',               unit: 'm',   required: true, hint: 'مثال: 50' },
    { key: 'grid_width_m',             label: 'عرض شبکه زمین',               unit: 'm',   required: true, hint: 'مثال: 40' },
    { key: 'n_conductors_x',           label: 'تعداد هادی در جهت طول (X)',   unit: 'عدد', required: true, hint: 'مثال: 6' },
    { key: 'n_conductors_y',           label: 'تعداد هادی در جهت عرض (Y)',   unit: 'عدد', required: true, hint: 'مثال: 5' },
    { key: 'soil_resistivity_ohm_m',   label: 'مقاومت ویژه خاک',             unit: 'Ω·m', required: true, hint: 'رس≈50، لوم≈150، شن≈500' },
    { key: 'max_fault_current_a',      label: 'حداکثر جریان خطای شبکه',      unit: 'A',   required: true, hint: 'از مطالعات SC' },
    { key: 'fault_duration_s',         label: 'مدت زمان خطا',                unit: 's',   required: true, hint: 'معمولاً 0.5-1s' },
    { key: 'burial_depth_m',           label: 'عمق دفن هادی',               unit: 'm',   hint: 'معمولاً 0.5m' },
    { key: 'conductor_diameter_mm',    label: 'قطر هادی',                    unit: 'mm',  hint: 'معمولاً ۱۴mm مس' },
    { key: 'conductor_material',       label: 'جنس هادی', type: 'select', options: [
      { value: 'copper',    label: 'مس (Copper)' },
      { value: 'copperweld',label: 'Copperweld' },
      { value: 'steel',     label: 'فولاد (Steel)' },
      { value: 'aluminum',  label: 'آلومینیوم' },
    ]},
    { key: 'surface_resistivity_ohm_m',label: 'مقاومت لایه سطحی (سنگ‌ریزه)',unit: 'Ω·m', hint: 'سنگ‌ریزه≈3000' },
    { key: 'surface_thickness_m',      label: 'ضخامت لایه سطحی',             unit: 'm',   hint: 'معمولاً 0.15m' },
    { key: 'current_division_factor',  label: 'ضریب تقسیم جریان (Sf)',       unit: '(0-1)', hint: 'معمولاً 0.6' },
    { key: 'body_weight',              label: 'وزن بدن برای محاسبه', type: 'select', options: [
      { value: '70', label: '۷۰ کیلوگرم (پرسنل عمومی)' },
      { value: '50', label: '۵۰ کیلوگرم (عمومی)' },
    ]},
    { key: 'has_ground_rods',          label: 'میل‌های زمین', type: 'select', options: [
      { value: 'true',  label: 'دارد (توصیه می‌شود)' },
      { value: 'false', label: 'ندارد' },
    ]},
    { key: 'rod_length_m',             label: 'طول هر میل‌زمین',              unit: 'm',   hint: 'معمولاً ۳m' },
    { key: 'xr_ratio',                 label: 'نسبت X/R نقطه خطا',            unit: '',    hint: 'معمولاً ۱۵-۳۰' },
  ],

  // ── LIGHT-002: Road Lighting (EN 13201) ─────────────────────────────────────
  'LIGHT-002': [
    { key: 'road_width_m',            label: 'عرض خیابان',                  unit: 'm',   required: true, hint: 'مثال: 12' },
    { key: 'road_length_m',           label: 'طول مسیر',                    unit: 'm',   required: true, hint: 'مثال: 500' },
    { key: 'road_class',              label: 'کلاس روشنایی معبر', type: 'select', options: [
      { value: 'M1', label: 'M1 — اتوبان / سرعت بالا (2 cd/m²)' },
      { value: 'M2', label: 'M2 — بزرگراه (1.5 cd/m²)' },
      { value: 'M3', label: 'M3 — شریانی اصلی (1 cd/m²)' },
      { value: 'M4', label: 'M4 — شریانی فرعی (0.75 cd/m²)' },
      { value: 'M5', label: 'M5 — محلی (0.5 cd/m²)' },
      { value: 'M6', label: 'M6 — فرعی کم‌ترافیک (0.3 cd/m²)' },
    ]},
    { key: 'lamp_lumens',             label: 'شار نوری هر چراغ',             unit: 'lm',  required: true, hint: 'LED خیابانی: 10000-25000' },
    { key: 'luminaire_power_w',       label: 'توان هر چراغ',                unit: 'W',   required: true, hint: 'مثال: 150' },
    { key: 'luminaire_type',          label: 'نوع توزیع نور چراغ', type: 'select', options: [
      { value: 'LED_road',        label: 'LED خیابانی (استاندارد)' },
      { value: 'cut_off',         label: 'Cut-off (برش‌خورده)' },
      { value: 'semi_cut_off',    label: 'Semi cut-off' },
      { value: 'non_cut_off',     label: 'Non cut-off' },
      { value: 'decorative',      label: 'دکوراتیو' },
    ]},
    { key: 'mounting_height_m',       label: 'ارتفاع پایه (اختیاری)',        unit: 'm',   hint: 'پیش‌فرض: ۰.۸×عرض خیابان' },
    { key: 'arrangement_type',        label: 'آرایش پایه‌ها (اختیاری)', type: 'select', options: [
      { value: '',                label: 'انتخاب خودکار' },
      { value: 'single_sided',    label: 'یک‌طرفه' },
      { value: 'staggered',       label: 'زیگزاگی' },
      { value: 'opposite',        label: 'دو طرفه روبرو' },
      { value: 'median',          label: 'وسطی' },
    ]},
    { key: 'target_spacing_m',        label: 'فاصله پایه‌ها (اختیاری)',     unit: 'm',   hint: 'خالی=محاسبه خودکار' },
    { key: 'road_surface',            label: 'جنس سطح جاده', type: 'select', options: [
      { value: 'dry_asphalt',   label: 'آسفالت خشک' },
      { value: 'wet_asphalt',   label: 'آسفالت خیس' },
      { value: 'dry_concrete',  label: 'بتن خشک' },
      { value: 'wet_concrete',  label: 'بتن خیس' },
    ]},
    { key: 'light_loss_factor',      label: 'ضریب افت نور (LLF)',            unit: '(0-1)', hint: 'معمولاً 0.7-0.85' },
  ],

  // ── LIGHT-001: Lighting Design (Lumen Method) ───────────────────────────────
  'LIGHT-001': [
    { key: 'room_length_m',           label: 'طول اتاق',                   unit: 'm',   required: true, hint: 'مثال: 10' },
    { key: 'room_width_m',            label: 'عرض اتاق',                   unit: 'm',   required: true, hint: 'مثال: 8' },
    { key: 'room_height_m',           label: 'ارتفاع اتاق',                unit: 'm',   required: true, hint: 'مثال: 3' },
    { key: 'task_type',               label: 'نوع فعالیت / کاربرد', type: 'select', options: [
      { value: 'office_general',    label: 'اداری عمومی (300 lux)' },
      { value: 'office_desk',       label: 'اداری — میز کار (500 lux)' },
      { value: 'conference',        label: 'جلسات / کنفرانس (400 lux)' },
      { value: 'industrial_rough',  label: 'صنعتی — کار خشن (200 lux)' },
      { value: 'industrial_medium', label: 'صنعتی — کار متوسط (400 lux)' },
      { value: 'industrial_fine',   label: 'صنعتی — کار دقیق (750 lux)' },
      { value: 'warehouse',         label: 'انبار (150 lux)' },
      { value: 'laboratory',        label: 'آزمایشگاه (500 lux)' },
      { value: 'classroom',         label: 'کلاس درس (350 lux)' },
      { value: 'retail_general',    label: 'فروشگاه — عمومی (300 lux)' },
      { value: 'retail_display',    label: 'فروشگاه — ویترین (500 lux)' },
      { value: 'healthcare_general',label: 'درمانی عمومی (300 lux)' },
      { value: 'corridor',          label: 'راهرو (100 lux)' },
      { value: 'parking',           label: 'پارکینگ (75 lux)' },
    ]},
    { key: 'lamp_lumens',            label: 'شار نوری هر لامپ',             unit: 'lm',  required: true, hint: 'مثال: 3500 (LED)' },
    { key: 'lamps_per_luminaire',     label: 'تعداد لامپ در هر چراغ',      unit: 'عدد', hint: 'معمولاً ۱-۴' },
    { key: 'luminaire_power_w',       label: 'توان هر چراغ',               unit: 'W',   required: true, hint: 'مثال: 40' },
    { key: 'luminaire_type',          label: 'نوع پخش نور چراغ', type: 'select', options: [
      { value: 'direct',          label: 'مستقیم (Direct)' },
      { value: 'semi_direct',     label: 'نیمه‌مستقیم (Semi-direct)' },
      { value: 'general_diffuse', label: 'پخش‌شونده (Diffuse)' },
      { value: 'semi_indirect',   label: 'نیمه‌غیرمستقیم (Semi-indirect)' },
      { value: 'indirect',        label: 'غیرمستقیم (Indirect)' },
    ]},
    { key: 'light_loss_factor',      label: 'ضریب افت نور (LLF)',          unit: '(0-1)', hint: 'معمولاً 0.7-0.85' },
    { key: 'reflectance_ceiling',    label: 'ضریب انعکاس سقف',             unit: '(0-1)', hint: 'سفید=0.7، تیره=0.3' },
    { key: 'reflectance_wall',       label: 'ضریب انعکاس دیوار',           unit: '(0-1)', hint: 'روشن=0.5، تیره=0.2' },
    { key: 'annual_operating_hours', label: 'ساعت کار سالانه',             unit: 'h' },
  ],

  // ── PROT-004: Fuse Selection ─────────────────────────────────────────────────
  'PROT-004': [
    { key: 'load_current_a',          label: 'جریان بار',              unit: 'A',  required: true, hint: 'مثال: 100' },
    { key: 'short_circuit_current_ka',label: 'جریان اتصال کوتاه',       unit: 'kA', required: true, hint: 'مثال: 25' },
    { key: 'voltage_v',               label: 'ولتاژ سیستم',            unit: 'V' },
    { key: 'fuse_type',               label: 'نوع فیوز', type: 'select', options: [
      { value: 'gG', label: 'gG — مصارف عمومی' },
      { value: 'gM', label: 'gM — حفاظت موتور' },
      { value: 'aM', label: 'aM — پشتیبان موتور' },
    ]},
    { key: 'application',             label: 'کاربرد', type: 'select', options: [
      { value: 'general',       label: 'عمومی' },
      { value: 'motor',         label: 'موتور' },
      { value: 'transformer',   label: 'ترانسفورماتور' },
      { value: 'cable',         label: 'کابل' },
    ]},
    { key: 'motor_starting_current_a', label: 'جریان راه‌اندازی موتور', unit: 'A', hint: 'برای gM/aM' },
    { key: 'motor_starting_duration_s',label: 'مدت راه‌اندازی',         unit: 's', hint: 'برای gM/aM' },
    { key: 'ambient_temperature',     label: 'دمای محیط',               unit: '°C' },
  ],

  // ── CAP-001: Power Factor Correction ─────────────────────────────────────────
  'CAP-001': [
    { key: 'active_power_kw',         label: 'توان اکتیو بار',         unit: 'kW',  hint: 'مثال: 100' },
    { key: 'power_factor_current',   label: 'ضریب قدرت فعلی',        unit: 'cos φ', required: true, hint: 'مثال: 0.80' },
    { key: 'power_factor_target',    label: 'ضریب قدرت هدف',          unit: 'cos φ', hint: 'معمولاً 0.92-0.95' },
    { key: 'voltage_v',              label: 'ولتاژ خط',               unit: 'V' },
    { key: 'detuning_pct',           label: 'درصد دیتونینگ (راکتور)', type: 'select', options: [
      { value: '0',  label: 'بدون راکتور (۰%)' },
      { value: '5.67', label: 'راکتور ۵.۶۷٪ (هارمونیک ۴.۲)' },
      { value: '7',  label: 'راکتور ۷٪ (هارمونیک ۳.۸)' },
    ]},
    { key: 'cable_resistance_per_phase_ohm', label: 'مقاومت کابل هر فاز',   unit: 'Ω' },
    { key: 'load_hours_per_year',    label: 'ساعت کار سالانه',        unit: 'h' },
    { key: 'energy_cost_per_kwh',    label: 'هزینه انرژی',            unit: 'USD/kWh' },
    { key: 'capacitor_cost_per_kvar',label: 'هزینه بانک خازنی',       unit: 'USD/kVAr' },
  ],

  // ── TRF-005: Transformer Energy Efficiency (EU 548/2014) ────────────────────
  'TRF-005': [
    { key: 'rated_power_kva',    label: 'توان نامی ترانس',        unit: 'kVA', required: true, hint: 'مثال: 630' },
    { key: 'no_load_loss_w',     label: 'تلفات بی‌باری (Po)',     unit: 'W',   required: true, hint: 'از کاتالوگ ترانس' },
    { key: 'load_loss_w',        label: 'تلفات بارداری (Pk)',     unit: 'W',   required: true, hint: 'در بار نامی' },
    { key: 'transformer_type',   label: 'نوع ترانسفورماتور', type: 'select', options: [
      { value: 'oil', label: 'روغنی (Oil-immersed)' },
      { value: 'dry', label: 'خشک (Dry-type / Cast Resin)' },
    ]},
    { key: 'voltage_level',      label: 'سطح ولتاژ', type: 'select', options: [
      { value: 'LV', label: 'فشار ضعیف (LV)' },
      { value: 'MV', label: 'فشار متوسط (MV)' },
    ]},
  ],
};

// ── Engineering Charts ─────────────────────────────────────────────────────────

function ChartsSection({ charts }: { charts: any[] }) {
  return (
    <>
      {charts.map((chart: any, idx: number) => {
        let element: React.ReactNode = null;
        if (chart.type === 'tcc') {
          element = (
            <TCCChart
              key={idx}
              title={chart.title}
              curves={chart.curves?.map((c: any) => ({
                name: c.name,
                currents: c.currents,
                times: c.times,
                color: c.color,
                dashed: c.dashed,
              })) ?? []}
              xLabel={chart.x_label}
              yLabel={chart.y_label}
            />
          );
        }
        if (chart.type === 'harmonic') {
          element = (
            <HarmonicChart
              key={idx}
              title={chart.title}
              harmonics={chart.harmonics?.map((h: any) => ({
                order: h.order,
                magnitudePercent: h.magnitude_percent,
              })) ?? []}
              thdPercent={chart.thd_percent}
              limitPercent={chart.limit_percent}
            />
          );
        }
        if (chart.type === 'cable') {
          element = (
            <CableChart
              key={idx}
              title={chart.title}
              bars={chart.bars ?? []}
            />
          );
        }
        return element ? <div key={idx} data-chart-idx={idx}>{element}</div> : null;
      })}
    </>
  );
}

// ── Suggested Products ────────────────────────────────────────────────────────

function SuggestedProducts({ code, result, fieldLabels }: {
  code: string;
  result: any;
  fieldLabels?: Record<string, string>;
}) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(false);

  const fetchSuggestions = async () => {
    if (loading || shown) return;
    setLoading(true);
    try {
      const raw = result?.data?.result ?? result?.result;
      const data = raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? raw.data : raw;
      const params = encodeURIComponent(JSON.stringify(data.results ?? data));
      const res = await apiClient.get<any>(`/products/suggest?calculationType=${code}&resultParams=${params}&limit=6`);
      setProducts(res?.data ?? []);
      setShown(true);
    } catch {
      // silently ignore — marketplace integration is optional
    } finally {
      setLoading(false);
    }
  };

  if (!shown && !loading) return null;

  return (
    <>
      {loading && (
        <div className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] p-4 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            جستجوی محصولات مرتبط...
          </div>
        </div>
      )}

      {products.length > 0 && !loading && (
        <div className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <svg className="h-4 w-4 text-[hsl(var(--accent))]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            <span className="text-sm font-semibold">محصولات پیشنهادی</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {products.map((p: any) => (
              <div key={p.id} className="rounded-[var(--radius)] border border-[hsl(var(--border))] p-2.5 hover:bg-[hsl(var(--accent)/0.04)] transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{p.sku}</p>
                    {p.category && (
                      <span className="inline-block mt-0.5 rounded-md bg-[hsl(var(--accent)/0.08)] px-1.5 py-0.5 text-[10px] text-[hsl(var(--accent))]">
                        {p.category}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold" dir="ltr">
                      {Number(p.price).toLocaleString('fa-IR')} {p.currency}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {products.length > 0 && (
            <a
              href={`/${window.location.pathname.split('/')[1] ?? 'fa'}/marketplace`}
              className="inline-block mt-2 text-xs text-[hsl(var(--accent))] hover:underline"
            >
              مشاهده همه محصولات در بازارچه →
            </a>
          )}
        </div>
      )}
    </>
  );
}

// ── AI Review ─────────────────────────────────────────────────────────────────

interface AiReviewContext {
  trigger: (code: string, inputs: Record<string, any>, result: any) => Promise<void>;
  reset: () => void;
  loading: boolean;
  review: any;
  error: string;
  reviewRef: React.RefObject<HTMLDivElement | null>;
}

function AiReviewSection(): AiReviewContext {
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<any>(null);
  const [error, setError] = useState('');
  const reviewRef = useRef<HTMLDivElement>(null);

  const trigger = async (code: string, inputs: Record<string, any>, result: any) => {
    setLoading(true);
    setError('');
    setReview(null);
    try {
      const raw = result?.data?.result ?? result?.result;
      const data = raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? raw.data : raw;
      const res = await apiClient.post<any>('/ai/validate', {
        type: code,
        inputs: Object.fromEntries(
          Object.entries(inputs)
            .filter(([, v]) => v !== '' && v !== undefined && v !== null)
            .map(([k, v]) => [k, isNaN(Number(v)) ? v : Number(v)])
        ),
        result: data.results ?? data,
      });
      setReview(res?.data ?? res);
      setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    } catch (e: any) {
      setError(e?.message ?? 'خطا در اعتبارسنجی AI');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setReview(null); setError(''); };

  const ctx: AiReviewContext = { trigger, reset, loading, review, error, reviewRef };
  return ctx;
}

function AiReviewDisplay({ ctx }: { ctx: AiReviewContext }) {
  if (!ctx.review && !ctx.error && !ctx.loading) return null;

  const v = ctx.review;

  return (
    <div ref={ctx.reviewRef} className="rounded-[var(--radius-lg)] border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.04)] p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {ctx.loading ? (
            <svg className="h-4 w-4 animate-spin text-[hsl(var(--accent))]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4 text-[hsl(var(--accent))]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          )}
          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
            {ctx.loading ? 'بررسی توسط هوش مصنوعی...' : 'بررسی هوش مصنوعی'}
          </span>
        </div>
        {!ctx.loading && (
          <button type="button" onClick={ctx.reset} className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            بستن
          </button>
        )}
      </div>

      {ctx.error && (
        <div className="text-xs text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.2)] rounded-[var(--radius)] px-3 py-2">
          {ctx.error}
        </div>
      )}

      {v && !ctx.error && (
        <div className="space-y-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {v.verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))] px-2.5 py-0.5 text-xs font-semibold">
                <CheckCircle2 className="h-3 w-3" />
                تایید شد
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))] px-2.5 py-0.5 text-xs font-semibold">
                <AlertCircle className="h-3 w-3" />
                نیاز به بررسی
              </span>
            )}
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              v.confidence === 'high' ? 'bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]' :
              v.confidence === 'medium' ? 'bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))]' :
              'bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]'
            }`}>
              {v.confidence === 'high' ? 'اطمینان بالا' :
               v.confidence === 'medium' ? 'اطمینان متوسط' : 'اطمینان کم'}
            </span>
          </div>

          {/* Summary */}
          {v.summary && (
            <p className="text-xs text-[hsl(var(--foreground))] leading-relaxed">{v.summary}</p>
          )}

          {/* Standards */}
          {v.standards?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1">استانداردهای مرتبط</p>
              <div className="flex flex-wrap gap-1.5">
                {v.standards.map((s: string, i: number) => (
                  <span key={i} className="inline-block rounded-md bg-[hsl(var(--accent)/0.08)] border border-[hsl(var(--accent)/0.15)] px-2 py-0.5 text-xs font-mono text-[hsl(var(--accent))]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {v.warnings?.length > 0 && (
            <div className="bg-[hsl(var(--warning)/0.06)] border border-[hsl(var(--warning)/0.15)] rounded-[var(--radius)] p-2.5">
              <p className="text-xs font-semibold text-[hsl(var(--warning))] mb-1.5">هشدارها</p>
              <ul className="space-y-1">
                {v.warnings.map((w: string, i: number) => (
                  <li key={i} className="text-xs text-[hsl(var(--warning)/0.8)] flex items-start gap-1.5">
                    <span className="mt-0.5 shrink-0">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {v.recommendations?.length > 0 && (
            <div className="bg-[hsl(var(--accent)/0.06)] border border-[hsl(var(--accent)/0.15)] rounded-[var(--radius)] p-2.5">
              <p className="text-xs font-semibold text-[hsl(var(--accent))] mb-1.5">توصیه‌ها</p>
              <ul className="space-y-1">
                {v.recommendations.map((r: string, i: number) => (
                  <li key={i} className="text-xs text-[hsl(var(--foreground))] flex items-start gap-1.5">
                    <span className="mt-0.5 shrink-0">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Details */}
          {v.details && (v.warnings?.length > 0 || v.recommendations?.length > 0) && (
            <details className="text-xs text-[hsl(var(--muted-foreground))]">
              <summary className="cursor-pointer hover:text-[hsl(var(--foreground))] font-medium mb-1">
                تحلیل فنی کامل
              </summary>
              <div className="mt-1 whitespace-pre-wrap leading-relaxed bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-[var(--radius)] p-2.5 font-mono text-[11px]">
                {v.details}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

// ── Result Display ────────────────────────────────────────────────────────────

function ResultDisplay({ result, code, inputs, fieldLabels }: {
  result: any;
  code: string;
  inputs: Record<string, any>;
  fieldLabels?: Record<string, string>;
}) {
  const raw = result?.data?.result ?? result?.result;
  if (!raw) return null;

  const data = raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? raw.data : raw;

  const results: Record<string, any> = data.results ?? {};
  const topLevel = Object.fromEntries(
    Object.entries(data).filter(([k, v]) =>
      !['results','warnings','recommendations','recommendation_notes','standards','inputs','battery','specs','standards_info','starting_method_info','charts'].includes(k) &&
      typeof v !== 'object' && !Array.isArray(v)
    )
  );
  const allResults = { ...topLevel, ...results };
  const warnings = raw.warnings ?? data.warnings ?? [];
  const notes: string[] = raw.recommendation_notes ?? data.recommendation_notes ?? raw.recommendations ?? data.recommendations ?? [];
  const charts: any[] = data.charts ?? [];

  const meta = CALC_META[code];
  const units: Record<string, string> = {};
  if (fieldLabels) {
    for (const key of Object.keys(fieldLabels)) {
      const f = (FIELDS[code] ?? DEFAULT_FIELDS[code] ?? []).find(x => x.key === key);
      if (f?.unit) units[key] = f.unit;
    }
  }

  const [suggestOpen, setSuggestOpen] = useState(false);
  const aiCtx = AiReviewSection();
  const chartsRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = useCallback(async () => {
    const numericInputs: Record<string, any> = {};
    for (const [k, v] of Object.entries(inputs)) {
      if (v === '' || v === undefined || v === null) continue;
      numericInputs[k] = isNaN(Number(v)) ? v : Number(v);
    }

    // Capture chart images
    const chartImages: string[] = [];
    if (chartsRef.current) {
      const chartNodes = chartsRef.current.querySelectorAll('[data-chart-idx]');
      for (const node of chartNodes) {
        try {
          const dataUrl = await toPng(node as HTMLElement, {
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
          });
          chartImages.push(dataUrl);
        } catch {
          // skip failed captures
        }
      }
    }

    await downloadPdfReport({
      title: `Xennic — ${meta.name}`,
      calculationCode: code,
      calculationName: meta.name,
      standard: meta.standard,
      engineVersion: meta.engineVersion,
      timestamp: new Date().toISOString(),
      inputs: numericInputs,
      results: allResults,
      units,
      warnings,
      recommendations: notes,
      fieldLabels,
      chartImages: chartImages.length > 0 ? chartImages : undefined,
    });
  }, [code, meta, inputs, allResults, units, warnings, notes, fieldLabels]);

  return (
    <div className="mt-4 space-y-3 animate-fade-in">
      {/* Engineering Charts */}
      {charts.length > 0 && (
        <div ref={chartsRef}>
          <ChartsSection charts={charts} />
        </div>
      )}

      {/* Export Buttons */}
      {Object.keys(allResults).length > 0 && meta && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-medium hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            دریافت گزارش PDF
          </button>
          {!aiCtx.review && !aiCtx.loading && (
            <button
              type="button"
              onClick={() => aiCtx.trigger(code, inputs, result)}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-[hsl(var(--accent)/0.4)] px-3 py-1.5 text-xs font-medium text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.08)] transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              بررسی با هوش مصنوعی
            </button>
          )}
          <button
            type="button"
            onClick={() => setSuggestOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-medium hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            مشاهده محصولات مرتبط
          </button>
        </div>
      )}

      {/* Results */}
      {Object.keys(allResults).length > 0 && (
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
                  <dt className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{fieldLabels?.[key] ?? key}</dt>
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
      )}

      {/* AI Review */}
      <AiReviewDisplay ctx={aiCtx} />

      {/* Suggested Products */}
      {suggestOpen && (
        <SuggestedProducts code={code} result={result} fieldLabels={fieldLabels} />
      )}

      {/* Warnings / Notes */}
      {(warnings.length > 0 || notes.length > 0) && (
        <div className="rounded-[var(--radius-lg)] bg-[hsl(var(--warning)/0.08)] border border-[hsl(var(--warning)/0.2)] p-3">
          {(warnings.length > 0) && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-[hsl(var(--warning))]" />
                <span className="text-xs font-semibold text-[hsl(var(--warning))]">هشدارها</span>
              </div>
              <ul className="space-y-1 mb-2">
                {warnings.map((w: string, i: number) => (
                  <li key={i} className="text-xs text-[hsl(var(--warning)/0.8)]">{w}</li>
                ))}
              </ul>
            </>
          )}
          {notes.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1">توصیه‌ها</p>
              <ul className="space-y-1">
                {notes.map((n: string, i: number) => (
                  <li key={i} className="text-xs text-[hsl(var(--muted-foreground))]">• {n}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────

export function CalculatorForm({ code, onSuccess, guestMode, onGuestConsume }: {
  code: string;
  onSuccess: (result: any) => void;
  guestMode?: boolean;
  onGuestConsume?: () => boolean;
}) {
  const wsId = useAuthStore(s => s.workspaceId);
  const fields = FIELDS[code] ?? DEFAULT_FIELDS[code] ?? [];

  const [values,  setValues]  = useState<Record<string, string>>({});
  const [result,  setResult]  = useState<any>(null);
  const [calcErr, setCalcErr] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const inputs: Record<string, any> = {};
      for (const [k, v] of Object.entries(values)) {
        if (v === '' || v === undefined) continue;
        inputs[k] = isNaN(Number(v)) ? v : Number(v);
      }

      // تبدیل فیلدهای هارمونیک به dict برای PQ calculators و TRF-004 (K-Factor)
      if (code.startsWith('PQ-') || code === 'TRF-004') {
        const harmonicKeys = Object.keys(inputs).filter(k => /^h\d+_current$/.test(k));
        if (harmonicKeys.length > 0) {
          const harmonicCurrents: Record<number, number> = {};
          for (const key of harmonicKeys) {
            const order = parseInt(key.match(/^h(\d+)/)?.[1] ?? '0', 10);
            if (order > 0 && inputs[key] !== undefined) {
              harmonicCurrents[order] = Number(inputs[key]);
            }
          }
          inputs.harmonic_currents = harmonicCurrents;
          for (const key of harmonicKeys) delete inputs[key];
        }
      }

      // تبدیل present_harmonics (string) به لیست اعداد
      if (inputs.present_harmonics && typeof inputs.present_harmonics === 'string') {
        inputs.present_harmonics = inputs.present_harmonics
          .split(',')
          .map((s: string) => parseInt(s.trim(), 10))
          .filter((n: number) => !isNaN(n));
      }

      // تبدیل cash_flows (JSON string) به array برای ECO-002/003
      if (code === 'ECO-002' || code === 'ECO-003') {
        if (inputs.cash_flows && typeof inputs.cash_flows === 'string') {
          try {
            inputs.cash_flows = JSON.parse(inputs.cash_flows.replace(/'/g, '"'));
          } catch {
            inputs.cash_flows = String(inputs.cash_flows).split(',').map(Number).filter((n: number) => !isNaN(n));
          }
        }
      }

      // ساخت nested upstream/downstream برای PROT-005
      if (code === 'PROT-005') {
        inputs.upstream = {
          name: inputs.up_name,
          rated_current_a: inputs.up_rated_current_a,
          curve_type: inputs.up_curve_type || 'SI',
          tms: inputs.up_tms ?? 0.1,
          l_pickup_x_in: inputs.up_l_pickup ?? 1.0,
          s_pickup_x_in: inputs.up_s_pickup || undefined,
          s_delay_s: inputs.up_s_delay_s || undefined,
          i_pickup_x_in: inputs.up_i_pickup || undefined,
        };
        inputs.downstream = {
          name: inputs.down_name,
          rated_current_a: inputs.down_rated_current_a,
          curve_type: inputs.down_curve_type || 'SI',
          tms: inputs.down_tms ?? 0.1,
          l_pickup_x_in: inputs.down_l_pickup ?? 1.0,
          s_pickup_x_in: inputs.down_s_pickup || undefined,
          s_delay_s: inputs.down_s_delay_s || undefined,
          i_pickup_x_in: inputs.down_i_pickup || undefined,
        };
        for (const k of ['up_name','up_rated_current_a','up_curve_type','up_tms','up_l_pickup','up_s_pickup','up_s_delay_s','up_i_pickup','down_name','down_rated_current_a','down_curve_type','down_tms','down_l_pickup','down_s_pickup','down_s_delay_s','down_i_pickup']) {
          delete inputs[k];
        }
        if (!inputs.fault_currents_a) {
          inputs.fault_currents_a = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];
        }
      }

      // تبدیل JSON string به dict برای HARM-001
      if (code === 'HARM-001') {
        for (const key of ['harmonic_spectrum', 'interharmonic_spectrum']) {
          if (inputs[key] && typeof inputs[key] === 'string') {
            try {
              const parsed = JSON.parse(inputs[key].replace(/'/g, '"'));
              if (typeof parsed === 'object' && parsed !== null) {
                const numDict: Record<number, number> = {};
                for (const [k, v] of Object.entries(parsed)) {
                  numDict[Number(k)] = Number(v);
                }
                inputs[key] = numDict;
              }
            } catch {
              delete inputs[key];
            }
          }
        }
      }

      // تبدیل cable_diam_XX به cables dict برای CABLE-005
      if (code === 'CABLE-005') {
        const cables: Record<string, number> = {};
        const diamKeys = Object.keys(inputs).filter(k => /^cable_diam_\d+$/.test(k));
        for (const key of diamKeys) {
          const diam = key.replace('cable_diam_', '');
          const qty = Number(inputs[key]);
          if (qty > 0) {
            cables[diam] = qty;
          }
          delete inputs[key];
        }
        inputs.cables = cables;
      }

      if (guestMode) {
        // مصرف سهمیه BEFORE محاسبه — اگر سهمیه نباشد، خطا بده
        if (onGuestConsume) {
          const allowed = onGuestConsume();
          if (!allowed) {
            throw new Error('سهمیه محاسبات رایگان شما تمام شده است');
          }
        }
        const { calcLocal } = await import('../utils/guest-calc');
        return calcLocal(code, inputs);
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
          ) : field.type === 'text' ? (
            <Input
              label={field.unit ? `${field.label} (${field.unit})` : field.label}
              type="text"
              value={values[field.key] ?? ''}
              onChange={set(field.key)}
              dir="ltr"
              className="text-sm h-8"
            />
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
      {result && (
        <ResultDisplay
          result={result}
          code={code}
          inputs={values}
          fieldLabels={{ ...Object.fromEntries(fields.map(f => [f.key, f.label])), ...RESULT_LABELS }}
        />
      )}
    </div>
  );
}
