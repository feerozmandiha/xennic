import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const isExportEnabled = process.env.OTEL_EXPORTER_ENABLED === 'true';

export function initializeOpenTelemetry(): NodeSDK | null {
  // Without a collector configured there is nothing to export to. Starting the
  // SDK anyway makes the metric reader retry an OTLP endpoint every minute and
  // flood production logs with ECONNREFUSED, so opt out entirely.
  if (!isExportEnabled) {
    return null;
  }

  const serviceName = process.env.OTEL_SERVICE_NAME ?? 'xennic-api';

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? '1.0.0',
    'deployment.environment': process.env.NODE_ENV ?? 'development',
  });

  const exporters: any[] = [];

  if (isExportEnabled) {
    const traceExporter = new OTLPTraceExporter({
      url: process.env.OTEL_TRACE_URL ?? 'http://localhost:4318/v1/traces',
    });
    exporters.push(traceExporter);

    const metricExporter = new OTLPMetricExporter({
      url: process.env.OTEL_METRICS_URL ?? 'http://localhost:4318/v1/metrics',
    });
    exporters.push(metricExporter);
  }

  const sdk = new NodeSDK({
    resource,
    traceExporter: exporters[0],
    metricReader: new PeriodicExportingMetricReader({
      exporter: exporters[1] ?? new OTLPMetricExporter(),
      exportIntervalMillis: 60000,
    }),
    instrumentations: [],
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk.shutdown().catch(() => {});
  });
  process.on('SIGINT', () => {
    sdk.shutdown().catch(() => {});
  });

  return sdk;
}
