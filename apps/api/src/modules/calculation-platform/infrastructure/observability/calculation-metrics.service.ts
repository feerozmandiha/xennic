import { Injectable, Logger } from '@nestjs/common';
import { Counter, Histogram, Gauge } from 'prom-client';
import { CALC_METRIC_NAMES } from '../../shared/types/metric-names.js';

@Injectable()
export class CalculationMetricsService {
  private readonly logger = new Logger(CalculationMetricsService.name);
  private initialized = false;

  private calculationDuration!: Histogram<string>;
  private calculationTotal!: Counter<string>;
  private calculationSuccess!: Counter<string>;
  private calculationFailure!: Counter<string>;
  private calculationAiDuration!: Histogram<string>;
  private calculationCertificate!: Counter<string>;
  private calculationCacheHits!: Counter<string>;
  private calculationActive!: Gauge<string>;

  constructor() {
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    try {
      this.calculationDuration = new Histogram({
        name: CALC_METRIC_NAMES.CALCULATION_DURATION,
        help: 'Calculation execution duration in milliseconds',
        labelNames: ['definition', 'status'],
        buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
      });

      this.calculationTotal = new Counter({
        name: CALC_METRIC_NAMES.CALCULATION_TOTAL,
        help: 'Total number of calculation executions',
        labelNames: ['definition'],
      });

      this.calculationSuccess = new Counter({
        name: CALC_METRIC_NAMES.CALCULATION_SUCCESS,
        help: 'Total number of successful calculations',
        labelNames: ['definition'],
      });

      this.calculationFailure = new Counter({
        name: CALC_METRIC_NAMES.CALCULATION_FAILURE,
        help: 'Total number of failed calculations',
        labelNames: ['definition', 'error_type'],
      });

      this.calculationAiDuration = new Histogram({
        name: CALC_METRIC_NAMES.CALCULATION_AI_DURATION,
        help: 'AI review duration in milliseconds',
        labelNames: ['provider'],
        buckets: [50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000],
      });

      this.calculationCertificate = new Counter({
        name: CALC_METRIC_NAMES.CALCULATION_CERTIFICATE,
        help: 'Total number of certificates generated',
        labelNames: ['definition'],
      });

      this.calculationCacheHits = new Counter({
        name: CALC_METRIC_NAMES.CALCULATION_CACHE,
        help: 'Cache hit/miss totals',
        labelNames: ['store', 'result'],
      });

      this.calculationActive = new Gauge({
        name: CALC_METRIC_NAMES.CALCULATION_QUEUE,
        help: 'Active/in-flight calculations',
        labelNames: ['status'],
      });

      this.initialized = true;
    } catch (error) {
      this.logger.warn(
        `Metrics initialization failed (may be duplicate): ${error instanceof Error ? error.message : 'Unknown'}`,
      );
    }
  }

  recordCalculationDuration(definition: string, status: string, durationMs: number): void {
    if (!this.initialized) return;
    try {
      this.calculationDuration.observe({ definition, status }, durationMs);
    } catch {
      /* ignore */
    }
  }

  recordCalculationTotal(definition: string): void {
    if (!this.initialized) return;
    try {
      this.calculationTotal.inc({ definition });
    } catch {
      /* ignore */
    }
  }

  recordCalculationSuccess(definition: string): void {
    if (!this.initialized) return;
    try {
      this.calculationSuccess.inc({ definition });
    } catch {
      /* ignore */
    }
  }

  recordCalculationFailure(definition: string, errorType: string): void {
    if (!this.initialized) return;
    try {
      this.calculationFailure.inc({ definition, error_type: errorType });
    } catch {
      /* ignore */
    }
  }

  recordAiDuration(provider: string, durationMs: number): void {
    if (!this.initialized) return;
    try {
      this.calculationAiDuration.observe({ provider }, durationMs);
    } catch {
      /* ignore */
    }
  }

  recordCertificateGenerated(definition: string): void {
    if (!this.initialized) return;
    try {
      this.calculationCertificate.inc({ definition });
    } catch {
      /* ignore */
    }
  }

  recordCacheHit(store: string): void {
    if (!this.initialized) return;
    try {
      this.calculationCacheHits.inc({ store, result: 'hit' });
    } catch {
      /* ignore */
    }
  }

  recordCacheMiss(store: string): void {
    if (!this.initialized) return;
    try {
      this.calculationCacheHits.inc({ store, result: 'miss' });
    } catch {
      /* ignore */
    }
  }

  setActiveCalculations(count: number): void {
    if (!this.initialized) return;
    try {
      this.calculationActive.set({ status: 'running' }, count);
    } catch {
      /* ignore */
    }
  }

  getMetrics(): string | null {
    if (!this.initialized) return null;
    return null; // prom-client register is auto-collected by monitoring module
  }
}
