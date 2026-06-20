'use client';

import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';

export interface TCCCurve {
  name: string;
  currents: number[];
  times: number[];
  color?: string;
  dashed?: boolean;
}

export interface TCCChartProps {
  curves: TCCCurve[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
}

type Row = Record<string, number | null> & { current: number };

function interp(x: number, xs: number[], ys: number[]): number {
  if (x <= xs[0]) return ys[0];
  if (x >= xs[xs.length - 1]) return ys[xs.length - 1];
  let lo = 0, hi = xs.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid; else hi = mid;
  }
  if (xs[hi] === xs[lo]) return ys[lo];
  return ys[lo] + (x - xs[lo]) / (xs[hi] - xs[lo]) * (ys[hi] - ys[lo]);
}

const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#7c3aed', '#0891b2'];

export function TCCChart({ curves, title, xLabel = 'Current (A)', yLabel = 'Time (s)' }: TCCChartProps) {
  const { data, xDomain, yDomain, xTicks, yTicks } = useMemo(() => {
    const allI = curves.flatMap(c => c.currents).filter(v => v > 0);
    const allT = curves.flatMap(c => c.times).filter(v => v > 0);
    if (!allI.length || !allT.length) {
      return { data: [], xDomain: [1, 1e5] as [number, number], yDomain: [0.001, 1e4] as [number, number], xTicks: [] as number[], yTicks: [] as number[] };
    }

    const xMin = Math.max(0.1, Math.min(...allI) * 0.5);
    const xMax = Math.max(...allI) * 2;
    const yMin = Math.max(0.001, Math.min(...allT) * 0.5);
    const yMax = Math.max(...allT) * 2;

    const pts = 80;
    const logMin = Math.log10(xMin);
    const logMax = Math.log10(xMax);

    const samples: number[] = [];
    for (let i = 0; i < pts; i++) {
      samples.push(Math.pow(10, logMin + (i / (pts - 1)) * (logMax - logMin)));
    }

    const data: Row[] = samples.map(curr => {
      const row: Row = { current: curr };
      curves.forEach((c, ci) => {
        row[`t${ci}`] = interp(curr, c.currents, c.times);
      });
      return row;
    });

    const possibleXTicks = [0.1, 0.5, 1, 5, 10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000];
    const possibleYTicks = [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10, 50, 100, 500, 1000, 5000, 10000];

    return {
      data,
      xDomain: [xMin, xMax] as [number, number],
      yDomain: [yMin, yMax] as [number, number],
      xTicks: possibleXTicks.filter(v => v >= xMin * 0.8 && v <= xMax * 1.2),
      yTicks: possibleYTicks.filter(v => v >= yMin * 0.8 && v <= yMax * 1.2),
    };
  }, [curves]);

  if (!data.length) return null;

  return (
    <div dir="ltr" className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      {title && <h4 className="text-sm font-semibold mb-3 text-[hsl(var(--foreground))]">{title}</h4>}
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="current" scale="log" domain={xDomain} type="number"
            ticks={xTicks}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: xLabel, position: 'insideBottomRight', offset: -6, style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } }}
            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v < 1 ? v.toFixed(2) : v.toFixed(0)}
          />
          <YAxis
            scale="log" domain={yDomain} type="number"
            ticks={yTicks}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 8, style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } }}
            tickFormatter={(v: number) => v >= 1 ? v.toFixed(v >= 100 ? 0 : 1) : v.toFixed(3)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              fontSize: 12,
            }}
            formatter={(value: any, name: any) => [
              `${Number(value) >= 1 ? `${Number(value).toFixed(2)} s` : `${(Number(value) * 1000).toFixed(1)} ms`}`,
              name,
            ]}
            labelFormatter={(label: any) => `I = ${Number(label) >= 1000 ? `${(Number(label) / 1000).toFixed(2)} kA` : `${Number(label).toFixed(1)} A`}`}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="plainline" />
          {curves.map((c, ci) => (
            <Line
              key={c.name}
              type="monotone" dataKey={`t${ci}`} name={c.name}
              stroke={c.color ?? COLORS[ci % COLORS.length]}
              strokeWidth={1.5}
              strokeDasharray={c.dashed ? '5 3' : undefined}
              dot={false} connectNulls isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
