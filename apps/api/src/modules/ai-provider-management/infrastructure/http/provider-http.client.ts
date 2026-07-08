import { Injectable, Logger } from '@nestjs/common';

export interface HttpClientOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface HttpClientResponse {
  ok: boolean;
  status: number;
  data: unknown;
  latencyMs: number;
}

@Injectable()
export class ProviderHttpClient {
  private readonly logger = new Logger(ProviderHttpClient.name);

  async request(url: string, options: HttpClientOptions = {}): Promise<HttpClientResponse> {
    const start = Date.now();
    const { method = 'GET', headers = {}, body, timeout = 10000 } = options;

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        signal: AbortSignal.timeout(timeout),
      };

      if (body) fetchOptions.body = JSON.stringify(body);

      const res = await fetch(url, fetchOptions);
      const latency = Date.now() - start;
      const data = await res.json().catch(() => null);

      return { ok: res.ok, status: res.status, data, latencyMs: latency };
    } catch (err) {
      const latency = Date.now() - start;
      this.logger.warn(`HTTP ${method} ${url} failed: ${(err as Error).message}`);
      return { ok: false, status: 0, data: null, latencyMs: latency };
    }
  }
}
