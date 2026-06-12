import { Injectable, Logger, ServiceUnavailableException, BadRequestException } from '@nestjs/common';

/**
 * Engineering Client Service
 *
 * HTTP client که request ها را به Python engineering-service (port 8001) forward می‌کند.
 * از fetch API استاندارد Node.js استفاده می‌شود — بدون وابستگی خارجی.
 */
@Injectable()
export class EngineeringClientService {
  private readonly logger = new Logger(EngineeringClientService.name);

  private get baseUrl(): string {
    return process.env.ENGINEERING_SERVICE_URL ?? 'http://localhost:8001';
  }

  private readonly timeoutMs = 30_000; // 30 ثانیه timeout

  /**
   * ارسال درخواست محاسبه به Python service
   *
   * @param path   مسیر endpoint در Python service (e.g. '/api/v1/engineering/basic/ohms-law')
   * @param body   بدنه درخواست (inputs از کاربر)
   * @returns      پاسخ کامل Python service
   */
  async calculate(
    path: string,
    body: Record<string, unknown>,
  ): Promise<{
    success: boolean;
    data: Record<string, unknown>;
    meta: Record<string, unknown>;
  }> {
    const url = `${this.baseUrl}${path}`;
    const start = Date.now();

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
        signal:  controller.signal,
      });

      clearTimeout(timer);

      const durationMs = Date.now() - start;
      this.logger.debug(`Engineering call ${path} completed in ${durationMs}ms`);

      const json = await response.json() as any;

      // خطای validation از Python
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
      if (err instanceof BadRequestException) throw err;

      const error = err as Error;

      if (error.name === 'AbortError') {
        this.logger.error(`Engineering service timeout for ${path}`);
        throw new ServiceUnavailableException(
          'Engineering service timed out. Please try again.',
        );
      }

      this.logger.error(
        `Engineering service connection failed for ${path}: ${error.message}`,
      );
      throw new ServiceUnavailableException(
        'Engineering service is unavailable. Please try again later.',
      );
    }
  }

  /**
   * بررسی وضعیت Python service
   */
  async health(): Promise<{
    status: string;
    calculators_registered: number;
    version: string;
  }> {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5_000);

      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        return { status: 'unhealthy', calculators_registered: 0, version: 'unknown' };
      }

      return await response.json() as any;
    } catch {
      return { status: 'unreachable', calculators_registered: 0, version: 'unknown' };
    }
  }
}
