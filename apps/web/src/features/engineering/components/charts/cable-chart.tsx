'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell,
  ResponsiveContainer,
} from 'recharts';

export interface CableBar {
  label: string;
  value: number;
  unit: string;
  limit?: number;
  color?: string;
}

export interface CableChartProps {
  title?: string;
  bars: CableBar[];
}

export { type CableBar as CableData };

const DEFAULT_COLORS = ['#3b82f6', '#8b5cf6', '#16a34a', '#ca8a04'];

export function CableChart({ title = 'Cable Sizing Summary', bars }: CableChartProps) {
  if (!bars.length) return null;

  const data = bars.map((b, i) => ({
    label: b.label,
    value: b.value,
    unit: b.unit,
    limit: b.limit,
    fill: b.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    nearLimit: b.limit != null && b.value > b.limit * 0.85,
    overLimit: b.limit != null && b.value > b.limit,
  }));

  return (
    <div dir="ltr" className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      {title && <h4 className="text-sm font-semibold mb-3 text-[hsl(var(--foreground))]">{title}</h4>}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis
            type="category" dataKey="label" width={100}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              fontSize: 12,
            }}
            formatter={(value: any, name: any) => {
              const bar = data.find(b => b.label === name);
              return [`${Number(value)} ${bar?.unit ?? ''}`, name];
            }}
            labelFormatter={(label: any) => {
              const bar = data.find(b => b.label === label);
              return bar?.limit ? `${label} (Limit: ${bar.limit} ${bar.unit})` : label;
            }}
          />
          {data.map((b, idx) => (
            b.limit != null && (
              <ReferenceLine key={`ref-${idx}`} x={b.limit} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" />
            )
          ))}
          <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={24}>
            {data.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={entry.overLimit ? '#ef4444' : entry.nearLimit ? '#f59e0b' : entry.fill}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
