import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

/**
 * Engineering Client Service
 *
 * HTTP client that forwards calculation requests to the Python engineering-service.
 */
@Injectable()
export class EngineeringClientService {
  private readonly logger = new Logger(EngineeringClientService.name);
  private readonly timeoutMs = 30_000;
  private readonly maxAttempts = 3;

  private get baseUrl(): string {
    return process.env.ENGINEERING_SERVICE_URL ?? 'http://localhost:8001';
  }

  async calculate(
    path: string,
    body: Record<string, unknown>,
    correlationId?: string,
  ): Promise<{
    success: boolean;
    data: Record<string, unknown>;
    meta: Record<string, unknown>;
  }> {
    const url = `${this.baseUrl}${path}`;
    const start = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (correlationId) {
          headers['X-Correlation-ID'] = correlationId;
        }

        const response = await globalThis.fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timer);

        const durationMs = Date.now() - start;
        this.logger.debug(`Engineering call ${path} completed in ${durationMs}ms`);

        const json = (await response.json()) as any;

        if (response.status === 400 || response.status === 422) {
          throw new BadRequestException(
            json?.error?.message ?? json?.detail ?? 'Engineering validation failed',
          );
        }

        if (!response.ok) {
          this.logger.error(`Engineering service returned ${response.status} for ${path}`);
          throw new ServiceUnavailableException(
            `Engineering service error: ${response.statusText}`,
          );
        }

        return json;
      } catch (err) {
        clearTimeout(timer);

        if (err instanceof BadRequestException) {
          throw err;
        }

        if (err instanceof ServiceUnavailableException) {
          throw err;
        }

        const error = err as Error;
        lastError = error;

        if (error.name === 'AbortError') {
          this.logger.error(`Engineering service timeout for ${path}`);
          throw new ServiceUnavailableException('Engineering service timed out. Please try again.');
        }

        this.logger.error(`Engineering service connection failed for ${path}: ${error.message}`);

        if (attempt === this.maxAttempts) {
          break;
        }
      }
    }

    throw new ServiceUnavailableException(
      lastError?.message.includes('timed out')
        ? 'Engineering service timed out. Please try again.'
        : 'Engineering service is unavailable. Please try again later.',
    );
  }

  async health(): Promise<{
    status: string;
    calculators_registered: number;
    version: string;
    circuitState?: string;
    circuitFailures?: number;
  }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);

    try {
      const response = await globalThis.fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        return {
          status: 'unhealthy',
          calculators_registered: 0,
          version: 'unknown',
          circuitState: 'CLOSED',
          circuitFailures: 0,
        };
      }

      const json = (await response.json()) as any;

      return {
        ...json,
        circuitState: 'CLOSED',
        circuitFailures: 0,
      };
    } catch {
      clearTimeout(timer);

      return {
        status: 'unreachable',
        calculators_registered: 0,
        version: 'unknown',
        circuitState: 'CLOSED',
        circuitFailures: 0,
      };
    }
  }
}
