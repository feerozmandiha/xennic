import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { Client as MinioClient } from 'minio';
import type { FileBucket } from '../../domain/entities/file.entity.js';

/**
 * MinIO Service — ارتباط مستقیم با MinIO object storage
 *
 * Connection via env vars:
 *   MINIO_ENDPOINT   (default: localhost:9000)
 *   MINIO_ACCESS_KEY (default: minioadmin)
 *   MINIO_SECRET_KEY (default: minioadmin)
 *   MINIO_USE_SSL    (default: false)
 */
@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: MinioClient;

  // Buckets رسمی پروژه
  static readonly BUCKETS: FileBucket[] = [
    'public', 'private', 'reports', 'documents', 'engineering', 'ai',
  ];

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT ?? 'localhost:9000';
    const [host, portStr] = endpoint.split(':');
    const port = parseInt(portStr ?? '9000', 10);

    this.client = new MinioClient({
      endPoint:  host ?? 'localhost',
      port,
      useSSL:    process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
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
      throw new ServiceUnavailableException('Storage service unavailable');
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
      throw new ServiceUnavailableException('File upload failed');
    }
  }

  // ── Download ──────────────────────────────────────────────────────────────

  async getObject(bucket: string, objectKey: string): Promise<Buffer> {
    try {
      const stream = await this.client.getObject(bucket, objectKey);
      return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end',  () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Download failed for ${bucket}/${objectKey}: ${error.message}`);
      throw new ServiceUnavailableException('File download failed');
    }
  }

  // ── Presigned URL (برای دسترسی مستقیم مرورگر) ──────────────────────────

  async getPresignedUrl(
    bucket: string,
    objectKey: string,
    expirySeconds = 3600,
  ): Promise<string> {
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
        status:  'ok',
        buckets: buckets.map(b => b.name),
      };
    } catch {
      return { status: 'unreachable', buckets: [] };
    }
  }
}
