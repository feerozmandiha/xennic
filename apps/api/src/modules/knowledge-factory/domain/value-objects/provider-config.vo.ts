export interface ProviderConfig {
  type: string;
  name: string;
  priority: number;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  dimensions?: number;
  timeoutMs: number;
  maxRetries: number;
  enabled: boolean;
  metadata?: Record<string, unknown>;
}
