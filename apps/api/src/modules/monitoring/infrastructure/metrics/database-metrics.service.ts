import { Injectable, Logger } from '@nestjs/common';
import { MetricRecorderService } from '../../application/services/metric-recorder.service.js';

@Injectable()
export class DatabaseMetricsService {
  private readonly logger = new Logger(DatabaseMetricsService.name);

  constructor(private readonly metrics: MetricRecorderService) {}

  recordQuery(operation: string, durationMs: number): void {
    this.metrics.recordDbQuery(operation, durationMs);
  }

  recordConnectionPool(size: number): void {
    this.metrics.recordSlo('db_pool_size', size, size);
  }

  recordActiveConnections(count: number): void {
    this.metrics.recordSlo('db_active', count, count);
  }
}
