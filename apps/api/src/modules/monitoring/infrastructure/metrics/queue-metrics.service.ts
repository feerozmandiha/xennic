import { Injectable, Logger } from '@nestjs/common';
import { MetricRecorderService } from '../../application/services/metric-recorder.service.js';

@Injectable()
export class QueueMetricsService {
  private readonly logger = new Logger(QueueMetricsService.name);

  constructor(private readonly metrics: MetricRecorderService) {}

  recordPublish(queue: string): void {
    this.metrics.recordMessageQueued(queue, 'publish');
  }

  recordConsume(queue: string): void {
    this.metrics.recordMessageQueued(queue, 'consume');
  }

  recordDepth(queue: string, depth: number): void {
    this.metrics.recordSlo('queue_depth_' + queue, depth, 0);
  }

  recordJobDuration(queue: string, durationMs: number): void {
    this.metrics.recordSlo('job_duration_' + queue, durationMs, 0);
  }

  recordJobFailure(queue: string): void {
    this.metrics.recordSlo('job_failure_' + queue, 1, 0);
  }
}
