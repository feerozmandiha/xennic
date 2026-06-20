'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import {
  Network, Zap, CheckCircle2, AlertCircle, Plus, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';

type CalcType = 'PS-001' | 'PS-002' | 'PS-003' | 'PS-004';

const CALC_CODES: CalcType[] = ['PS-001', 'PS-002', 'PS-003', 'PS-004'];

interface BusData {
  name: string;
  vn_kv: number;
  type: string;
  min_vm_pu?: number;
  max_vm_pu?: number;
}

interface LineData {
  name: string;
  from_bus: number;
  to_bus: number;
  length_km: number;
  r_ohm_per_km: number;
  x_ohm_per_km: number;
  c_nf_per_km?: number;
  max_i_ka: number;
}

interface TransformerData {
  name: string;
  hv_bus: number;
  lv_bus: number;
  sn_mva: number;
  vn_hv_kv: number;
  vn_lv_kv: number;
  vkr_pct: number;
  vk_pct: number;
  pfe_kw?: number;
  i0_pct?: number;
}

interface LoadData {
  name: string;
  bus: number;
  p_mw: number;
  q_mvar?: number;
  type?: string;
}

interface GeneratorData {
  name: string;
  bus: number;
  p_mw: number;
  vn_kv: number;
  sn_mva: number;
  rdss_ohm?: number;
  xdss_pu?: number;
  cos_phi?: number;
  vm_pu?: number;
}

interface NetworkInput {
  buses: BusData[];
  lines: LineData[];
  transformers: TransformerData[];
  loads: LoadData[];
  generators: GeneratorData[];
}

function useNetworkState() {
  const [network, setNetwork] = useState<NetworkInput>({
    buses: [{ name: 'Bus 1', vn_kv: 20, type: 'slack' }],
    lines: [],
    transformers: [],
    loads: [],
    generators: [],
  });

  function addBus() {
    setNetwork(prev => ({
      ...prev,
      buses: [...prev.buses, { name: `Bus ${prev.buses.length + 1}`, vn_kv: 0.4, type: 'load' }],
    }));
  }

  function removeBus(index: number) {
    setNetwork(prev => ({
      ...prev,
      buses: prev.buses.filter((_, i) => i !== index),
      lines: prev.lines.filter(l => l.from_bus !== index && l.to_bus !== index),
      transformers: prev.transformers.filter(t => t.hv_bus !== index && t.lv_bus !== index),
      loads: prev.loads.filter(l => l.bus !== index),
      generators: prev.generators.filter(g => g.bus !== index),
    }));
  }

  function updateBus(index: number, field: string, value: any) {
    setNetwork(prev => {
      const buses = [...prev.buses];
      (buses[index] as any)[field] = value;
      return { ...prev, buses };
    });
  }

  function addLine() {
    const idx = network.buses.length;
    setNetwork(prev => ({
      ...prev,
      lines: [...prev.lines, {
        name: `Line ${prev.lines.length + 1}`, from_bus: 0, to_bus: Math.min(1, idx - 1),
        length_km: 1, r_ohm_per_km: 0.1, x_ohm_per_km: 0.08, max_i_ka: 1,
      }],
    }));
  }

  function removeLine(index: number) {
    setNetwork(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== index) }));
  }

  function updateLine(index: number, field: string, value: any) {
    setNetwork(prev => {
      const lines = [...prev.lines];
      (lines[index] as any)[field] = value;
      return { ...prev, lines };
    });
  }

  function addTransformer() {
    setNetwork(prev => ({
      ...prev,
      transformers: [...prev.transformers, {
        name: `TRF ${prev.transformers.length + 1}`, hv_bus: 0, lv_bus: Math.min(1, prev.buses.length - 1),
        sn_mva: 1, vn_hv_kv: 20, vn_lv_kv: 0.4, vkr_pct: 1, vk_pct: 6,
      }],
    }));
  }

  function removeTransformer(index: number) {
    setNetwork(prev => ({
      ...prev, transformers: prev.transformers.filter((_, i) => i !== index),
    }));
  }

  function updateTransformer(index: number, field: string, value: any) {
    setNetwork(prev => {
      const transformers = [...prev.transformers];
      (transformers[index] as any)[field] = value;
      return { ...prev, transformers };
    });
  }

  function addLoad() {
    setNetwork(prev => ({
      ...prev,
      loads: [...prev.loads, { name: `Load ${prev.loads.length + 1}`, bus: 0, p_mw: 0.1 }],
    }));
  }

  function removeLoad(index: number) {
    setNetwork(prev => ({ ...prev, loads: prev.loads.filter((_, i) => i !== index) }));
  }

  function updateLoad(index: number, field: string, value: any) {
    setNetwork(prev => {
      const loads = [...prev.loads];
      (loads[index] as any)[field] = value;
      return { ...prev, loads };
    });
  }

  function addGenerator() {
    setNetwork(prev => ({
      ...prev,
      generators: [...prev.generators, {
        name: `Gen ${prev.generators.length + 1}`, bus: 0,
        p_mw: 1, vn_kv: 20, sn_mva: 1.25,
      }],
    }));
  }

  function removeGenerator(index: number) {
    setNetwork(prev => ({
      ...prev, generators: prev.generators.filter((_, i) => i !== index),
    }));
  }

  function updateGenerator(index: number, field: string, value: any) {
    setNetwork(prev => {
      const generators = [...prev.generators];
      (generators[index] as any)[field] = value;
      return { ...prev, generators };
    });
  }

  return {
    network, setNetwork,
    addBus, removeBus, updateBus,
    addLine, removeLine, updateLine,
    addTransformer, removeTransformer, updateTransformer,
    addLoad, removeLoad, updateLoad,
    addGenerator, removeGenerator, updateGenerator,
  };
}

function BusInputSection({ t, network, addBus, removeBus, updateBus }: { t: (key: string, values?: any) => string } & ReturnType<typeof useNetworkState>) {
  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-sm">{t('network.buses')} ({network.buses.length})</CardTitle>
        <Button size="sm" variant="outline" onClick={addBus}><Plus className="h-3 w-3 me-1" />{t('network.addBus')}</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {network.buses.map((bus, i) => (
          <div key={i} className="flex gap-2 items-end p-2 rounded-lg bg-[hsl(var(--secondary)/0.3)]">
            <Input label={t('network.fields.name')} value={bus.name} onChange={e => updateBus(i, 'name', e.target.value)} className="text-sm h-8 w-28" dir="ltr" />
            <Input label={t('network.fields.vn_kv')} type="number" step="any" value={String(bus.vn_kv)} onChange={e => updateBus(i, 'vn_kv', parseFloat(e.target.value) || 0)} className="text-sm h-8 w-20" dir="ltr" />
            <div className="space-y-1.5">
              <label className="block text-xs font-medium">{t('network.fields.type')}</label>
              <select value={bus.type} onChange={e => updateBus(i, 'type', e.target.value)}
                className="flex h-8 w-24 rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-2 text-sm">
                <option value="slack">{t('network.types.slack')}</option>
                <option value="load">{t('network.types.load')}</option>
                <option value="gen">{t('network.types.gen')}</option>
              </select>
            </div>
            {network.buses.length > 1 && (
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-[hsl(var(--destructive))]" onClick={() => removeBus(i)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LineInputSection({ t, network, addLine, removeLine, updateLine }: { t: (key: string, values?: any) => string } & ReturnType<typeof useNetworkState>) {
  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-sm">{t('network.lines')} ({network.lines.length})</CardTitle>
        <Button size="sm" variant="outline" onClick={addLine}><Plus className="h-3 w-3 me-1" />{t('network.addLine')}</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {network.lines.map((line, i) => (
          <div key={i} className="flex gap-2 items-end flex-wrap p-2 rounded-lg bg-[hsl(var(--secondary)/0.3)]">
            <Input label={t('network.fields.name')} value={line.name} onChange={e => updateLine(i, 'name', e.target.value)} className="text-sm h-8 w-24" dir="ltr" />
            <Input label={t('network.fields.fromBus')} type="number" step="1" value={String(line.from_bus)} onChange={e => updateLine(i, 'from_bus', parseInt(e.target.value) || 0)} className="text-sm h-8 w-16" dir="ltr" />
            <Input label={t('network.fields.toBus')} type="number" step="1" value={String(line.to_bus)} onChange={e => updateLine(i, 'to_bus', parseInt(e.target.value) || 0)} className="text-sm h-8 w-16" dir="ltr" />
            <Input label={t('network.fields.length_km')} type="number" step="any" value={String(line.length_km)} onChange={e => updateLine(i, 'length_km', parseFloat(e.target.value) || 0)} className="text-sm h-8 w-20" dir="ltr" />
            <Input label={t('network.fields.r_ohm_per_km')} type="number" step="any" value={String(line.r_ohm_per_km)} onChange={e => updateLine(i, 'r_ohm_per_km', parseFloat(e.target.value) || 0)} className="text-sm h-8 w-20" dir="ltr" />
            <Input label={t('network.fields.x_ohm_per_km')} type="number" step="any" value={String(line.x_ohm_per_km)} onChange={e => updateLine(i, 'x_ohm_per_km', parseFloat(e.target.value) || 0)} className="text-sm h-8 w-20" dir="ltr" />
            <Input label={t('network.fields.max_i_ka')} type="number" step="any" value={String(line.max_i_ka)} onChange={e => updateLine(i, 'max_i_ka', parseFloat(e.target.value) || 0)} className="text-sm h-8 w-20" dir="ltr" />
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-[hsl(var(--destructive))]" onClick={() => removeLine(i)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TransformerInputSection({ t, network, addTransformer, removeTransformer, updateTransformer }: { t: (key: string, values?: any) => string } & ReturnType<typeof useNetworkState>) {
  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-sm">{t('network.transformers')} ({network.transformers.length})</CardTitle>
        <Button size="sm" variant="outline" onClick={addTransformer}><Plus className="h-3 w-3 me-1" />{t('network.addTransformer')}</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {network.transformers.map((trf, i) => (
          <div key={i} className="flex gap-2 items-end flex-wrap p-2 rounded-lg bg-[hsl(var(--secondary)/0.3)]">
            <Input label={t('network.fields.name')} value={trf.name} onChange={e => updateTransformer(i, 'name', e.target.value)} className="text-sm h-8 w-20" dir="ltr" />
            <Input label={t('network.fields.hvBus')} type="number" step="1" value={String(trf.hv_bus)} onChange={e => updateTransformer(i, 'hv_bus', parseInt(e.target.value) || 0)} className="text-sm h-8 w-16" dir="ltr" />
            <Input label={t('network.fields.lvBus')} type="number" step="1" value={String(trf.lv_bus)} onChange={e => updateTransformer(i, 'lv_bus', parseInt(e.target.value) || 0)} className="text-sm h-8 w-16" dir="ltr" />
            <Input label={t('network.fields.sn_mva')} type="number" step="any" value={String(trf.sn_mva)} onChange={e => updateTransformer(i, 'sn_mva', parseFloat(e.target.value) || 0)} className="text-sm h-8 w-20" dir="ltr" />
            <Input label={t('network.fields.vn_hv_kv')} type="number" step="any" value={String(trf.vn_hv_kv)} onChange={e => updateTransformer(i, 'vn_hv_kv', parseFloat(e.target.value) || 0)} className="text-sm h-8 w-20" dir="ltr" />
            <Input label={t('network.fields.vn_lv_kv')} type="number" step="any" value={String(trf.vn_lv_kv)} onChange={e => updateTransformer(i, 'vn_lv_kv', parseFloat(e.target.value) || 0)} className="text-sm h-8 w-20" dir="ltr" />
            <Input label={t('network.fields.vkr_pct')} type="number" step="any" value={String(trf.vkr_pct)} onChange={e => updateTransformer(i, 'vkr_pct', parseFloat(e.target.value) || 0)} className="text-sm h-8 w-16" dir="ltr" />
            <Input label={t('network.fields.vk_pct')} type="number" step="any" value={String(trf.vk_pct)} onChange={e => updateTransformer(i, 'vk_pct', parseFloat(e.target.value) || 0)} className="text-sm h-8 w-16" dir="ltr" />
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-[hsl(var(--destructive))]" onClick={() => removeTransformer(i)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LoadInputSection({ t, network, addLoad, removeLoad, updateLoad }: { t: (key: string, values?: any) => string } & ReturnType<typeof useNetworkState>) {
  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-sm">{t('network.loads')} ({network.loads.length})</CardTitle>
        <Button size="sm" variant="outline" onClick={addLoad}><Plus className="h-3 w-3 me-1" />{t('network.addLoad')}</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {network.loads.map((load, i) => (
          <div key={i} className="flex gap-2 items-end flex-wrap p-2 rounded-lg bg-[hsl(var(--secondary)/0.3)]">
            <Input label={t('network.fields.name')} value={load.name} onChange={e => updateLoad(i, 'name', e.target.value)} className="text-sm h-8 w-24" dir="ltr" />
            <Input label={t('network.fields.bus')} type="number" step="1" value={String(load.bus)} onChange={e => updateLoad(i, 'bus', parseInt(e.target.value) || 0)} className="text-sm h-8 w-16" dir="ltr" />
            <Input label={t('network.fields.p_mw')} type="number" step="any" value={String(load.p_mw)} onChange={e => updateLoad(i, 'p_mw', parseFloat(e.target.value) || 0)} className="text-sm h-8 w-20" dir="ltr" />
            <Input label={t('network.fields.q_mvar')} type="number" step="any" value={String(load.q_mvar ?? '')} onChange={e => updateLoad(i, 'q_mvar', parseFloat(e.target.value) || 0)} className="text-sm h-8 w-20" dir="ltr" />
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-[hsl(var(--destructive))]" onClick={() => removeLoad(i)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function GeneratorInputSection({ t, network, addGenerator, removeGenerator, updateGenerator }: { t: (key: string, values?: any) => string } & ReturnType<typeof useNetworkState>) {
  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-sm">{t('network.generators')} ({network.generators.length})</CardTitle>
        <Button size="sm" variant="outline" onClick={addGenerator}><Plus className="h-3 w-3 me-1" />{t('network.addGenerator')}</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {network.generators.map((gen, i) => (
          <div key={i} className="flex gap-2 items-end flex-wrap p-2 rounded-lg bg-[hsl(var(--secondary)/0.3)]">
            <Input label={t('network.fields.name')} value={gen.name} onChange={e => updateGenerator(i, 'name', e.target.value)} className="text-sm h-8 w-20" dir="ltr" />
            <Input label={t('network.fields.bus')} type="number" step="1" value={String(gen.bus)} onChange={e => updateGenerator(i, 'bus', parseInt(e.target.value) || 0)} className="text-sm h-8 w-16" dir="ltr" />
            <Input label={t('network.fields.p_mw_short')} type="number" step="any" value={String(gen.p_mw)} onChange={e => updateGenerator(i, 'p_mw', parseFloat(e.target.value) || 0)} className="text-sm h-8 w-20" dir="ltr" />
            <Input label={t('network.fields.vn_kv')} type="number" step="any" value={String(gen.vn_kv)} onChange={e => updateGenerator(i, 'vn_kv', parseFloat(e.target.value) || 0)} className="text-sm h-8 w-20" dir="ltr" />
            <Input label={t('network.fields.sn_mva_gen')} type="number" step="any" value={String(gen.sn_mva)} onChange={e => updateGenerator(i, 'sn_mva', parseFloat(e.target.value) || 0)} className="text-sm h-8 w-20" dir="ltr" />
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-[hsl(var(--destructive))]" onClick={() => removeGenerator(i)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ResultDisplay({ t, result }: { t: (key: string, values?: any) => string; result: any }) {
  const data = result?.data?.result ?? result?.result;
  if (!data) return null;

  const results: Record<string, any> = data.results ?? {};
  const topLevel = Object.fromEntries(
    Object.entries(data).filter(([k, v]) =>
      !['results', 'warnings', 'recommendations', 'standards', 'inputs', 'network'].includes(k) &&
      typeof v !== 'object' && !Array.isArray(v)
    )
  );
  const allResults = { ...topLevel, ...results };
  const warnings = data.warnings ?? [];

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="rounded-[var(--radius-lg)] bg-[hsl(var(--success)/0.08)] border border-[hsl(var(--success)/0.2)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
          <span className="text-sm font-semibold text-[hsl(var(--success))]">{t('results.title')}</span>
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
                  {typeof val === 'boolean' ? (val ? t('results.yes') : t('results.no')) : String(val)}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
      {warnings.length > 0 && (
        <div className="rounded-[var(--radius-lg)] bg-[hsl(var(--warning)/0.08)] border border-[hsl(var(--warning)/0.2)] p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-[hsl(var(--warning))]" />
            <span className="text-xs font-semibold text-[hsl(var(--warning))]">{t('results.warnings')}</span>
          </div>
          <ul className="space-y-1">
            {warnings.map((w: string, i: number) => (
              <li key={i} className="text-xs text-[hsl(var(--warning)/0.8)]">{w}</li>
            ))}
          </ul>
        </div>
      )}
      {data.network && (
        <div className="rounded-[var(--radius-lg)] bg-[hsl(var(--muted)/0.3)] border p-3">
          <p className="text-xs font-semibold mb-2">{t('results.networkSummary')}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {t('results.buses')}: {data.network.num_buses ?? '-'} | {t('results.lines')}: {data.network.num_lines ?? '-'} |
            {t('results.transformers')}: {data.network.num_transformers ?? '-'} |
            {t('results.loads')}: {data.network.num_loads ?? '-'} | {t('results.generators')}: {data.network.num_generators ?? '-'}
          </p>
        </div>
      )}
    </div>
  );
}

export function PowerSystemClient() {
  const t = useTranslations('powerSystem');
  const navT = useTranslations('nav');
  const wsId = useAuthStore(s => s.workspaceId);

  const [activeTab, setActiveTab] = useState<CalcType>('PS-001');
  const [result, setResult] = useState<any>(null);
  const [calcErr, setCalcErr] = useState('');

  const networkState = useNetworkState();
  const { network } = networkState;

  const [motorParams, setMotorParams] = useState({
    motor_kw: 100, motor_vn_kv: 0.4, starting_method: 'DOL',
    starting_current_factor: 6, allowable_dip_pct: 15,
    transformer_kva: 1000, transformer_impedance_pct: 5,
  });

  const [busbarParams, setBusbarParams] = useState({
    busbar_material: 'copper', busbar_shape: 'rectangular',
    busbar_width_mm: 50, busbar_thickness_mm: 10,
    busbar_spacing_mm: 75, busbar_length_m: 1,
    ambient_temp_c: 35, load_current_a: 630,
    fault_current_ka: 25, fault_duration_s: 1,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      let inputs: Record<string, any> = { network };

      if (activeTab === 'PS-003') {
        inputs = {
          ...inputs,
          motor_bus: 1,
          motor_kw: motorParams.motor_kw,
          motor_vn_kv: motorParams.motor_vn_kv,
          starting_method: motorParams.starting_method,
          starting_current_factor: motorParams.starting_current_factor,
          allowable_dip_pct: motorParams.allowable_dip_pct,
          transformer_kva: motorParams.transformer_kva,
          transformer_impedance_pct: motorParams.transformer_impedance_pct,
        };
      }

      if (activeTab === 'PS-004') {
        inputs = { ...busbarParams };
      }

      return apiClient.post('/engineering/calculations', { type: activeTab, inputs });
    },
    onSuccess: (data: any) => {
      setResult(data);
      setCalcErr('');
    },
    onError: (err: any) => {
      setCalcErr(err?.message ?? t('calcFailed'));
      setResult(null);
    },
  });

  return (
    <div>
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        <div className="space-y-2">
          {CALC_CODES.map(code => (
            <button
              key={code}
              onClick={() => { setActiveTab(code); setResult(null); setCalcErr(''); }}
              className={cn(
                'w-full text-start p-3 rounded-[var(--radius)] border transition-all',
                activeTab === code
                  ? 'border-[hsl(var(--primary)/0.5)] bg-[hsl(var(--primary)/0.08)]'
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]',
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Network className={cn('h-4 w-4', activeTab === code ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]')} />
                <span className="text-sm font-semibold">{t(`tabLabels.${code}`)}</span>
              </div>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono">{t(`tabStandards.${code}`)}</p>
            </button>
          ))}
        </div>

        <div className="xl:col-span-3 space-y-4">
          {!wsId ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Network className="h-10 w-10 mx-auto text-[hsl(var(--muted-foreground))] opacity-30 mb-3" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {t('authRequired')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <BusInputSection t={t} {...networkState} />
              <LineInputSection t={t} {...networkState} />
              <TransformerInputSection t={t} {...networkState} />
              <LoadInputSection t={t} {...networkState} />
              <GeneratorInputSection t={t} {...networkState} />

              {activeTab === 'PS-003' && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t('motor.title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Input label={t('motor.motor_kw')} type="number" step="any" value={String(motorParams.motor_kw)}
                      onChange={e => setMotorParams(p => ({ ...p, motor_kw: parseFloat(e.target.value) || 0 }))}
                      className="text-sm h-8" dir="ltr" />
                    <Input label={t('motor.motor_vn_kv')} type="number" step="any" value={String(motorParams.motor_vn_kv)}
                      onChange={e => setMotorParams(p => ({ ...p, motor_vn_kv: parseFloat(e.target.value) || 0 }))}
                      className="text-sm h-8" dir="ltr" />
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium">{t('motor.startingMethod')}</label>
                      <select value={motorParams.starting_method}
                        onChange={e => setMotorParams(p => ({ ...p, starting_method: e.target.value }))}
                        className="flex h-8 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-2 text-sm">
                        <option value="DOL">{t('motor.methods.DOL')}</option>
                        <option value="StarDelta">{t('motor.methods.StarDelta')}</option>
                        <option value="Autotransformer">{t('motor.methods.Autotransformer')}</option>
                        <option value="SoftStarter">{t('motor.methods.SoftStarter')}</option>
                        <option value="VFD">{t('motor.methods.VFD')}</option>
                      </select>
                    </div>
                    <Input label={t('motor.startingCurrent')} type="number" step="any" value={String(motorParams.starting_current_factor)}
                      onChange={e => setMotorParams(p => ({ ...p, starting_current_factor: parseFloat(e.target.value) || 0 }))}
                      className="text-sm h-8" dir="ltr" />
                    <Input label={t('motor.allowableDip')} type="number" step="any" value={String(motorParams.allowable_dip_pct)}
                      onChange={e => setMotorParams(p => ({ ...p, allowable_dip_pct: parseFloat(e.target.value) || 0 }))}
                      className="text-sm h-8" dir="ltr" />
                    <Input label={t('motor.transformerKva')} type="number" step="any" value={String(motorParams.transformer_kva)}
                      onChange={e => setMotorParams(p => ({ ...p, transformer_kva: parseFloat(e.target.value) || 0 }))}
                      className="text-sm h-8" dir="ltr" />
                    <Input label={t('motor.transformerZ')} type="number" step="any" value={String(motorParams.transformer_impedance_pct)}
                      onChange={e => setMotorParams(p => ({ ...p, transformer_impedance_pct: parseFloat(e.target.value) || 0 }))}
                      className="text-sm h-8" dir="ltr" />
                  </CardContent>
                </Card>
              )}

              {activeTab === 'PS-004' && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t('busbar.title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium">{t('busbar.material')}</label>
                      <select value={busbarParams.busbar_material}
                        onChange={e => setBusbarParams(p => ({ ...p, busbar_material: e.target.value }))}
                        className="flex h-8 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-2 text-sm">
                        <option value="copper">{t('busbar.materials.copper')}</option>
                        <option value="aluminum">{t('busbar.materials.aluminum')}</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium">{t('busbar.shape')}</label>
                      <select value={busbarParams.busbar_shape}
                        onChange={e => setBusbarParams(p => ({ ...p, busbar_shape: e.target.value }))}
                        className="flex h-8 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-2 text-sm">
                        <option value="rectangular">{t('busbar.shapes.rectangular')}</option>
                        <option value="round">{t('busbar.shapes.round')}</option>
                      </select>
                    </div>
                    <Input label={t('busbar.width')} type="number" step="any" value={String(busbarParams.busbar_width_mm)}
                      onChange={e => setBusbarParams(p => ({ ...p, busbar_width_mm: parseFloat(e.target.value) || 0 }))}
                      className="text-sm h-8" dir="ltr" />
                    <Input label={t('busbar.thickness')} type="number" step="any" value={String(busbarParams.busbar_thickness_mm)}
                      onChange={e => setBusbarParams(p => ({ ...p, busbar_thickness_mm: parseFloat(e.target.value) || 0 }))}
                      className="text-sm h-8" dir="ltr" />
                    <Input label={t('busbar.spacing')} type="number" step="any" value={String(busbarParams.busbar_spacing_mm)}
                      onChange={e => setBusbarParams(p => ({ ...p, busbar_spacing_mm: parseFloat(e.target.value) || 0 }))}
                      className="text-sm h-8" dir="ltr" />
                    <Input label={t('busbar.ambientTemp')} type="number" step="any" value={String(busbarParams.ambient_temp_c)}
                      onChange={e => setBusbarParams(p => ({ ...p, ambient_temp_c: parseFloat(e.target.value) || 0 }))}
                      className="text-sm h-8" dir="ltr" />
                    <Input label={t('busbar.loadCurrent')} type="number" step="any" value={String(busbarParams.load_current_a)}
                      onChange={e => setBusbarParams(p => ({ ...p, load_current_a: parseFloat(e.target.value) || 0 }))}
                      className="text-sm h-8" dir="ltr" />
                    <Input label={t('busbar.faultCurrent')} type="number" step="any" value={String(busbarParams.fault_current_ka)}
                      onChange={e => setBusbarParams(p => ({ ...p, fault_current_ka: parseFloat(e.target.value) || 0 }))}
                      className="text-sm h-8" dir="ltr" />
                    <Input label={t('busbar.faultDuration')} type="number" step="any" value={String(busbarParams.fault_duration_s)}
                      onChange={e => setBusbarParams(p => ({ ...p, fault_duration_s: parseFloat(e.target.value) || 0 }))}
                      className="text-sm h-8" dir="ltr" />
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center gap-3">
                <Button
                  loading={mutation.isPending}
                  onClick={() => mutation.mutate()}
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  {t('run', { type: t(`tabLabels.${activeTab}`) })}
                </Button>
                {activeTab && (
                  <Badge variant="outline" className="font-mono text-[10px]">{activeTab}</Badge>
                )}
              </div>

              {calcErr && (
                <div className="text-xs text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.2)] rounded-[var(--radius)] px-3 py-2">
                  {calcErr}
                </div>
              )}

              {result && <ResultDisplay t={t} result={result} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
