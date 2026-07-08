export const IMETRICS = 'IMetrics' as const;

export type MetricType = 'counter' | 'gauge' | 'histogram';

export interface MetricDefinition {
  name: string;
  type: MetricType;
  description: string;
  unit?: string;
  labels?: string[];
}

export interface IMetrics {
  increment(name: string, value?: number, labels?: Record<string, string>): void;
  gauge(name: string, value: number, labels?: Record<string, string>): void;
  record(name: string, value: number, labels?: Record<string, string>): void;
  getMetric(name: string): Promise<number | undefined>;
  reset(): void;
}
