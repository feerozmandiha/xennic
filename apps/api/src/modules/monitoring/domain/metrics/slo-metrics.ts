export interface SloTarget {
  name: string;
  description: string;
  target: number;
  window: string;
}

export const SLO_TARGETS: SloTarget[] = [
  { name: 'availability', description: 'API availability', target: 99.9, window: '30d' },
  { name: 'latency_p99', description: 'P99 API latency', target: 500, window: '30d' },
  { name: 'error_rate', description: 'HTTP error rate', target: 99.5, window: '30d' },
  { name: 'ai_response_time', description: 'AI provider response P95', target: 5000, window: '30d' },
  { name: 'workflow_execution', description: 'Workflow execution P95', target: 30000, window: '30d' },
];

export interface SloStatus {
  name: string;
  current: number;
  target: number;
  met: boolean;
  window: string;
}
