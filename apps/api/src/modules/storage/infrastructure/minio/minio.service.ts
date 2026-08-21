import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { Client as MinioClient, CopyDestinationOptions, CopySourceOptions } from 'minio';
import type { FileBucket } from '../../domain/entities/file.entity.js';

/**
 * محل اتصال MinIO از روی متغیرهای محیطی.
 *
 * `MINIO_ENDPOINT` می‌تواند هم `host` باشد و هم `host:port`؛ اگر پورت داخل آن
 * نیامده باشد از `MINIO_PORT` استفاده می‌شود (شکل پیش‌فرض `.env.example`) و در
 * نهایت ۹۰۰۰.
 */
export function resolveMinioEndpoint(env: NodeJS.ProcessEnv = process.env): {
  host: string;
  port: number;
} {
  const [rawHost, rawPort] = (env.MINIO_ENDPOINT ?? 'localhost').split(':');
  const host = rawHost?.trim() || 'localhost';

  const port = Number.parseInt(rawPort ?? env.MINIO_PORT ?? '9000', 10);

  return { host, port: Number.isFinite(port) && port > 0 ? port : 9000 };
}

/**
 * MinIO Service — ارتباط مستقیم با MinIO object storage
 *
 * Connection via env vars:
 *   MINIO_ENDPOINT   (host یا host:port — default: localhost)
 *   MINIO_PORT       (default: 9000 — وقتی پورت داخل endpoint نیامده باشد)
 *   MINIO_ACCESS_KEY (default: MINIO_CREDENTIALS_FROM_ENV)
 *   MINIO_SECRET_KEY (default: MINIO_CREDENTIALS_FROM_ENV)
 *   MINIO_USE_SSL    (default: false)
 */
/** خطاهای اعتبارسنجی MinIO — یعنی سرویس بالاست ولی کلیدها پذیرفته نشدند. */
const CREDENTIAL_ERROR_CODES = [
  'InvalidAccessKeyId',
  'SignatureDoesNotMatch',
  'AccessDenied',
  'InvalidRequest',
];

/** خطاهای شبکه‌ای — یعنی اصلاً به MinIO نمی‌رسیم. */
const CONNECTION_ERROR_CODES = [
  'ECONNREFUSED',
  'ENOTFOUND',
  'EHOSTUNREACH',
  'ETIMEDOUT',
  'ECONNRESET',
  'EAI_AGAIN',
];

/**
 * پیام قابل‌فهم برای خطای MinIO.
 *
 * تفکیک «در دسترس نبودن» از «رد شدن کلیدها» مهم است، وگرنه یک تنظیم اشتباه در
 * `MINIO_ACCESS_KEY` هم به‌صورت «سرویس بالا نیست» گزارش می‌شود و ساعت‌ها دنبال
 * کانتینر خاموش می‌گردیم.
 */
export function describeStorageError(err: unknown, fallback: string): string {
  const error = err as { code?: string; message?: string } | null;
  const code = error?.code ?? '';
  const message = error?.message ?? '';

  if (CREDENTIAL_ERROR_CODES.includes(code) || /access key|signature|credential/i.test(message)) {
    return 'Storage credentials rejected by MinIO — check MINIO_ACCESS_KEY / MINIO_SECRET_KEY';
  }
  if (CONNECTION_ERROR_CODES.includes(code) || /ECONNREFUSED|ENOTFOUND|timed? ?out/i.test(message)) {
    return 'Storage service unreachable — is MinIO running?';
  }
  return fallback;
}

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: MinioClient;

  // Buckets رسمی پروژه
  static readonly BUCKETS: FileBucket[] = [
    'public',
    'private',
    'reports',
    'documents',
    'engineering',
    'ai',
  ];

  constructor() {
    const { host, port } = resolveMinioEndpoint();

    this.client = new MinioClient({
      endPoint: host,
      port,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY ?? 'MINIO_CREDENTIALS_FROM_ENV',
      secretKey: process.env.MINIO_SECRET_KEY ?? 'MINIO_CREDENTIALS_FROM_ENV',
    });
  }

  // ── Bucket Management ─────────────────────────────────────────────────────

  async ensureBucket(bucket: string): Promise<void> {
    try {
      const exists = await this.client.bucketExists(bucket);
      if (!exists) {
        await this.client.makeBucket(bucket);
        this.logger.log(`Bucket created: ${bucket}`);
      }
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Failed to ensure bucket "${bucket}": ${error.message}`);
      throw new ServiceUnavailableException(
        describeStorageError(err, 'Storage service unavailable'),
      );
    }
  }

  async ensureAllBuckets(): Promise<void> {
    for (const bucket of MinioService.BUCKETS) {
      await this.ensureBucket(bucket);
    }
  }

  // ── Upload ────────────────────────────────────────────────────────────────

  async uploadBuffer(
    bucket: string,
    objectKey: string,
    buffer: Buffer,
    mimeType: string,
    size: number,
  ): Promise<string> {
    try {
      await this.ensureBucket(bucket);

      const { Readable } = await import('stream');
      const stream = Readable.from(buffer);

      await this.client.putObject(bucket, objectKey, stream, size, {
        'Content-Type': mimeType,
      });

      this.logger.debug(`Uploaded: ${bucket}/${objectKey} (${size} bytes)`);
      return objectKey;
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Upload failed for ${bucket}/${objectKey}: ${error.message}`);
      if (err instanceof ServiceUnavailableException) throw err;
      throw new ServiceUnavailableException(describeStorageError(err, 'File upload failed'));
    }
  }

  // ── Copy (برای revert نسخه — object مستقل جدید) ───────────────────────────

  async copyObject(
    sourceBucket: string,
    sourceObjectKey: string,
    destBucket: string,
    destObjectKey: string,
  ): Promise<string> {
    try {
      await this.ensureBucket(destBucket);

      await this.client.copyObject(
        new CopySourceOptions({ Bucket: sourceBucket, Object: sourceObjectKey }),
        new CopyDestinationOptions({ Bucket: destBucket, Object: destObjectKey }),
      );

      this.logger.debug(
        `Copied: ${sourceBucket}/${sourceObjectKey} -> ${destBucket}/${destObjectKey}`,
      );
      return destObjectKey;
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Copy failed for ${sourceBucket}/${sourceObjectKey}: ${error.message}`);
      throw new ServiceUnavailableException('File copy failed');
    }
  }

  // ── Download ──────────────────────────────────────────────────────────────

  async getObject(bucket: string, objectKey: string): Promise<Buffer> {
    try {
      const stream = await this.client.getObject(bucket, objectKey);
      return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Download failed for ${bucket}/${objectKey}: ${error.message}`);
      throw new ServiceUnavailableException('File download failed');
    }
  }

  // ── Presigned URL (برای دسترسی مستقیم مرورگر) ──────────────────────────

  async getPresignedUrl(bucket: string, objectKey: string, expirySeconds = 3600): Promise<string> {
    try {
      return await this.client.presignedGetObject(bucket, objectKey, expirySeconds);
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Presign failed for ${bucket}/${objectKey}: ${error.message}`);
      throw new ServiceUnavailableException('Could not generate file URL');
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async deleteObject(bucket: string, objectKey: string): Promise<void> {
    try {
      await this.client.removeObject(bucket, objectKey);
      this.logger.debug(`Deleted: ${bucket}/${objectKey}`);
    } catch (err) {
      const error = err as Error;
      this.logger.warn(`Delete failed for ${bucket}/${objectKey}: ${error.message}`);
    }
  }

  // ── Health ────────────────────────────────────────────────────────────────

  async health(): Promise<{ status: string; buckets: string[] }> {
    try {
      const buckets = await this.client.listBuckets();
      return {
        status: 'ok',
        buckets: buckets.map((b) => b.name),
      };
    } catch {
      return { status: 'unreachable', buckets: [] };
    }
  }
}
