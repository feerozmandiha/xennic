import { Injectable, Logger } from '@nestjs/common';

interface CallRecord {
  timestamp: number;
  provider: string;
  model: string;
  latency: number;
  promptTokens: number;
  completionTokens: number;
  success: boolean;
}

interface ProviderStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  avgLatency: number;
  totalTokens: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
}

interface AggregateStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  avgLatency: number;
  totalTokens: number;
  providerBreakdown: Record<string, { calls: number; errors: number }>;
}

@Injectable()
export class GatewayTelemetryService {
  private readonly logger = new Logger(GatewayTelemetryService.name);
  private readonly calls: CallRecord[] = [];
  private readonly maxRecords = 10000;

  recordCall(
    provider: string,
    model: string,
    latency: number,
    tokens: { promptTokens: number; completionTokens: number },
    success: boolean,
  ): void {
    this.calls.push({
      timestamp: Date.now(),
      provider,
      model,
      latency,
      promptTokens: tokens.promptTokens,
      completionTokens: tokens.completionTokens,
      success,
    });

    if (this.calls.length > this.maxRecords) {
      this.calls.splice(0, this.calls.length - this.maxRecords);
    }
  }

  getProviderStats(provider: string): ProviderStats {
    const providerCalls = this.calls.filter((c) => c.provider === provider);

    if (providerCalls.length === 0) {
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        avgLatency: 0,
        totalTokens: 0,
        p50Latency: 0,
        p95Latency: 0,
        p99Latency: 0,
      };
    }

    const successful = providerCalls.filter((c) => c.success);
    const latencies = providerCalls.map((c) => c.latency).sort((a, b) => a - b);
    const totalTokens = providerCalls.reduce(
      (sum, c) => sum + c.promptTokens + c.completionTokens,
      0,
    );

    return {
      totalCalls: providerCalls.length,
      successfulCalls: successful.length,
      failedCalls: providerCalls.length - successful.length,
      avgLatency: latencies.reduce((sum, l) => sum + l, 0) / latencies.length,
      totalTokens,
      p50Latency: this.percentile(latencies, 50),
      p95Latency: this.percentile(latencies, 95),
      p99Latency: this.percentile(latencies, 99),
    };
  }

  getAggregateStats(): AggregateStats {
    const totalCalls = this.calls.length;
    const successful = this.calls.filter((c) => c.success);
    const latencies = this.calls.map((c) => c.latency);
    const totalTokens = this.calls.reduce((sum, c) => sum + c.promptTokens + c.completionTokens, 0);

    const providerBreakdown: Record<string, { calls: number; errors: number }> = {};
    for (const call of this.calls) {
      if (!providerBreakdown[call.provider]) {
        providerBreakdown[call.provider] = { calls: 0, errors: 0 };
      }
      providerBreakdown[call.provider]!.calls++;
      if (!call.success) {
        providerBreakdown[call.provider]!.errors++;
      }
    }

    return {
      totalCalls,
      successfulCalls: successful.length,
      failedCalls: totalCalls - successful.length,
      avgLatency:
        latencies.length > 0 ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length : 0,
      totalTokens,
      providerBreakdown,
    };
  }

  getLatencyHistogram(bucketCount = 10): { bucket: string; count: number }[] {
    const latencies = this.calls.map((c) => c.latency);
    if (latencies.length === 0) {
      return [];
    }

    const max = Math.max(...latencies);
    const min = Math.min(...latencies);
    const bucketSize = Math.max(1, Math.ceil((max - min) / bucketCount));

    const buckets: { start: number; end: number; count: number }[] = [];
    for (let i = 0; i < bucketCount; i++) {
      const start = min + i * bucketSize;
      const end = start + bucketSize;
      buckets.push({ start, end, count: 0 });
    }

    for (const latency of latencies) {
      const index = Math.min(Math.floor((latency - min) / bucketSize), bucketCount - 1);
      buckets[index]!.count++;
    }

    return buckets.map((b) => ({
      bucket: `${b.start}-${b.end}`,
      count: b.count,
    }));
  }

  clear(): void {
    this.calls.length = 0;
  }

  private percentile(sorted: number[], percentile: number): number {
    if (sorted.length === 0) {
      return 0;
    }
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)] ?? 0;
  }
}
