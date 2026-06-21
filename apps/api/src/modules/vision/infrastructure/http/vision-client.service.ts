import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class VisionClientService {
  private readonly logger = new Logger(VisionClientService.name);

  private get baseUrl(): string {
    return process.env.VISION_SERVICE_URL ?? 'http://localhost:8003';
  }

  private readonly timeoutMs = 120_000;

  async analyzeNameplate(
    imageBuffer: Uint8Array,
    mode: 'read' | 'analyze' = 'read',
  ): Promise<Record<string, unknown>> {
    const endpoint = mode === 'analyze' ? '/api/v1/vision/nameplate/analyze' : '/api/v1/vision/nameplate/read';
    return this.uploadFile(endpoint, imageBuffer);
  }

  async analyzeBill(
    imageBuffer: Uint8Array,
    mode: 'read' | 'analyze' = 'read',
  ): Promise<Record<string, unknown>> {
    const endpoint = mode === 'analyze' ? '/api/v1/vision/bill/analyze' : '/api/v1/vision/bill/read';
    return this.uploadFile(endpoint, imageBuffer);
  }

  async genericOcr(imageBuffer: Uint8Array): Promise<Record<string, unknown>> {
    return this.uploadFile('/api/v1/vision/ocr', imageBuffer);
  }

  private async uploadFile(
    path: string,
    imageBuffer: Uint8Array,
  ): Promise<Record<string, unknown>> {
    const url = `${this.baseUrl}${path}`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      const formData = new FormData();
      const blob = new Blob([imageBuffer as unknown as BlobPart], { type: 'image/jpeg' });
      formData.append('file', blob, 'upload.jpg');

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        this.logger.error(`Vision service returned ${response.status} for ${path}`);
        throw new ServiceUnavailableException(
          `Vision service error: ${response.statusText}`,
        );
      }

      return (await response.json()) as Record<string, unknown>;
    } catch (err) {
      const error = err as Error;
      if (error.name === 'AbortError') {
        this.logger.error(`Vision service timeout for ${path}`);
        throw new ServiceUnavailableException('Vision service timed out');
      }
      if (err instanceof ServiceUnavailableException) throw err;

      this.logger.error(`Vision service connection failed: ${error.message}`);
      throw new ServiceUnavailableException('Vision service unavailable');
    }
  }

  async health(): Promise<{ status: string; version: string }> {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5_000);

      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        return { status: 'unhealthy', version: 'unknown' };
      }

      return (await response.json()) as { status: string; version: string };
    } catch {
      return { status: 'unreachable', version: 'unknown' };
    }
  }
}
