'use client';

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell,
  ResponsiveContainer,
} from 'recharts';

export interface HarmonicBin {
  order: number;
  magnitudePercent: number;
}

export interface HarmonicChartProps {
  title?: string;
  harmonics: HarmonicBin[];
  thdPercent?: number;
  limitPercent?: number;
  baseFrequency?: number;
}

export { type HarmonicBin as HarmonicData };

const COLORS = {
  below: '#3b82f6',
  above: '#ef4444',
  limit: '#22c55e',
};

export function HarmonicChart({
  title = 'Harmonic Spectrum',
  harmonics,
  thdPercent,
  limitPercent = 8,
  baseFrequency = 50,
}: HarmonicChartProps) {
  const data = useMemo(() => {
    const maxOrder = Math.max(...harmonics.map(h => h.order), 25);
    const bins: Record<number, HarmonicBin> = {};
    for (const h of harmonics) bins[h.order] = h;
    const result: (HarmonicBin & { fill: string })[] = [];
    for (let i = 1; i <= maxOrder; i++) {
      if (bins[i]) {
        result.push({
          ...bins[i],
          fill: bins[i].magnitudePercent > limitPercent ? COLORS.above : COLORS.below,
        });
      }
    }
    return result;
  }, [harmonics, limitPercent]);

  if (!data.length) return null;

  return (
    <div dir="ltr" className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">{title}</h4>
        <div className="flex items-center gap-3 text-[10px] text-[hsl(var(--muted-foreground))]">
          {thdPercent != null && (
            <span className={thdPercent > limitPercent ? 'text-[hsl(var(--destructive))] font-semibold' : ''}>
              THD: {thdPercent.toFixed(1)}%
            </span>
          )}
          <span>Limit: {limitPercent}%</span>
          <span>f = {baseFrequency} Hz</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="order"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: 'Harmonic Order', position: 'insideBottomRight', offset: -4, style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' } }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: 'Magnitude (%)', angle: -90, position: 'insideLeft', offset: 8, style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' } }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              fontSize: 12,
            }}
            formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Magnitude']}
            labelFormatter={(label: any) => `h${label} (${(Number(label) * baseFrequency).toFixed(0)} Hz)`}
          />
          <ReferenceLine y={limitPercent} stroke={COLORS.limit} strokeWidth={1.5} strokeDasharray="4 2"
            label={{ value: `IEEE 519 Limit (${limitPercent}%)`, position: 'right', fontSize: 9, fill: COLORS.limit }}
          />
          <Bar dataKey="magnitudePercent" radius={[2, 2, 0, 0]} maxBarSize={16}>
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
