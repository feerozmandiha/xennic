import {
  Module,
  Global,
  MiddlewareConsumer,
  NestModule,
  OnModuleInit,
  Logger,
  RequestMethod,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { MetricsController } from './presentation/controllers/metrics.controller.js';
import { MetricRecorderService } from './application/services/metric-recorder.service.js';
import { TracingService } from './application/services/tracing.service.js';
import { SloTrackerService } from './application/services/slo-tracker.service.js';
import { HttpMetricsInterceptor } from './infrastructure/metrics/http-metrics.interceptor.js';
import { LoggingInterceptor } from './infrastructure/logging/logging.interceptor.js';
import { DatabaseMetricsService } from './infrastructure/metrics/database-metrics.service.js';
import { AiProviderMetricsService } from './infrastructure/metrics/ai-provider-metrics.service.js';
import { QueueMetricsService } from './infrastructure/metrics/queue-metrics.service.js';
import { CorrelationIdMiddleware } from './infrastructure/otel/correlation-id.middleware.js';
import {
  initializePrometheusMetrics,
  appUp,
  appMemory,
  appCpu,
} from './infrastructure/metrics/prometheus-metrics.js';

@Global()
@Module({
  controllers: [MetricsController],
  providers: [
    MetricRecorderService,
    TracingService,
    SloTrackerService,
    DatabaseMetricsService,
    AiProviderMetricsService,
    QueueMetricsService,
    { provide: APP_INTERCEPTOR, useClass: HttpMetricsInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
  exports: [
    MetricRecorderService,
    TracingService,
    SloTrackerService,
    DatabaseMetricsService,
    AiProviderMetricsService,
    QueueMetricsService,
  ],
})
export class MonitoringModule implements NestModule, OnModuleInit {
  private readonly logger = new Logger(MonitoringModule.name);

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes({
      path: '*path',
      method: RequestMethod.ALL,
    });
  }

  onModuleInit(): void {
    initializePrometheusMetrics();
    appUp.set(1);

    setInterval(() => {
      const mem = process.memoryUsage();
      appMemory.set({ type: 'heapUsed' }, mem.heapUsed);
      appMemory.set({ type: 'heapTotal' }, mem.heapTotal);
      appMemory.set({ type: 'rss' }, mem.rss);
      appCpu.set(process.cpuUsage().user / 1e6);
    }, 15000);

    this.logger.log('Monitoring Module initialized — OTel, Prometheus, structured logging');
  }
}
