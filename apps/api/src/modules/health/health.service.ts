import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';

@Injectable()
export class HealthService {
  startupComplete = false;

  checkLiveness(): { status: string } {
    return { status: 'ok' };
  }

  async checkReadiness() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkRabbitMQ(),
    ]);

    type CheckResult = { status: 'healthy' | 'unhealthy'; latency?: string; error?: string };

    const results: Record<string, CheckResult> = {};
    let allHealthy = true;

    const items: { label: string; check: PromiseSettledResult<{ latency: string }> }[] = [
      { label: 'database', check: checks[0]! },
      { label: 'redis', check: checks[1]! },
      { label: 'rabbitmq', check: checks[2]! },
    ];

    for (const { label, check } of items) {
      if (check.status === 'fulfilled') {
        results[label] = { status: 'healthy', ...check.value };
      } else {
        results[label] = { status: 'unhealthy', error: check.reason?.message || 'Unknown' };
        allHealthy = false;
      }
    }

    return {
      status: allHealthy ? 'ok' : 'degraded',
      service: 'xennic-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: results,
    };
  }

  checkStartup(): { status: string } {
    return { status: this.startupComplete ? 'ok' : 'not-ready' };
  }

  async getHealth() {
    return this.checkReadiness();
  }

  private async checkDatabase() {
    await prisma.$queryRaw`SELECT 1`;
    return { latency: 'ok' };
  }

  private async checkRedis(): Promise<{ latency: string }> {
    try {
      const { createClient } = await import('redis');
      const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
      await client.connect();
      await client.ping();
      await client.quit();
      return { latency: 'ok' };
    } catch {
      return { latency: 'unreachable' };
    }
  }

  private async checkRabbitMQ(): Promise<{ latency: string }> {
    try {
      const { connect } = await import('amqplib');
      const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
      const conn = await connect(url);
      await conn.close();
      return { latency: 'ok' };
    } catch {
      return { latency: 'unreachable' };
    }
  }
}
