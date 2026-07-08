import { Controller, Get, Header, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { register } from 'prom-client';

@ApiTags('monitoring')
@Controller()
export class MetricsController {
  private readonly logger = new Logger(MetricsController.name);

  @Get('metrics')
  @Header('Content-Type', 'text/plain; charset=utf-8; version=0.0.4')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  async getMetrics(): Promise<string> {
    try {
      return await register.metrics();
    } catch (err) {
      this.logger.error('Failed to collect metrics', err as Error);
      return '# Error collecting metrics\n';
    }
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  getReadiness(): Record<string, unknown> {
    return { status: 'ready', timestamp: new Date().toISOString() };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check' })
  getLiveness(): Record<string, unknown> {
    return { status: 'alive', timestamp: new Date().toISOString() };
  }
}
