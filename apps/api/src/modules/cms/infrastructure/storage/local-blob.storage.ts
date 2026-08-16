import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

/**
 * LocalBlobStorage — ذخیره‌سازی فایل لوکال برای توسعه و محیط‌های بدون MinIO
 *
 * مسیر ریشه با `CMS_STORAGE_PATH` (پیش‌فرض: `./storage/cms`) تعیین می‌شود.
 * این کلاینت به‌صورت هم‌ساختار با MinioService عمل می‌کند تا بتوان در
 * StorageService بین دو پس‌زمینه سوییچ کرد.
 */
@Injectable()
export class LocalBlobStorage {
  private readonly logger = new Logger(LocalBlobStorage.name);
  private readonly root: string;

  constructor() {
    this.root = path.resolve(process.env.CMS_STORAGE_PATH ?? './storage/cms');
  }

  get rootPath(): string {
    return this.root;
  }

  private _full(bucket: string, key: string): string {
    // جلوگیری از path traversal
    const safeKey = key.replace(/\.\./g, '').replace(/^\/+/, '');
    return path.resolve(this.root, bucket, safeKey);
  }

  async ensureBucket(bucket: string): Promise<void> {
    const dir = path.resolve(this.root, bucket);
    await fs.mkdir(dir, { recursive: true });
  }

  async uploadBuffer(
    bucket: string,
    objectKey: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    await this.ensureBucket(bucket);
    const full = this._full(bucket, objectKey);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, buffer);
    this.logger.debug(`uploaded ${bucket}/${objectKey} (${buffer.length} bytes, ${mimeType})`);
    return objectKey;
  }

  async getObject(bucket: string, objectKey: string): Promise<Buffer> {
    try {
      return await fs.readFile(this._full(bucket, objectKey));
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === 'ENOENT') {
        throw new ServiceUnavailableException('File not found in local storage');
      }
      throw new ServiceUnavailableException(`Local storage read failed: ${error.message}`);
    }
  }

  async getStream(bucket: string, objectKey: string): Promise<NodeJS.ReadableStream> {
    return createReadStream(this._full(bucket, objectKey));
  }

  async deleteObject(bucket: string, objectKey: string): Promise<void> {
    try {
      await fs.rm(this._full(bucket, objectKey), { force: true });
    } catch (err) {
      this.logger.warn(`delete failed: ${(err as Error).message}`);
    }
  }

  async stat(bucket: string, objectKey: string): Promise<{ size: number; mtime: Date } | null> {
    try {
      const s = await fs.stat(this._full(bucket, objectKey));
      return { size: s.size, mtime: s.mtime };
    } catch {
      return null;
    }
  }

  /**
   * برای استفاده در تست‌ها و ابزارها — کپی فایل از مسیر موقت به داخل storage
   */
  async writeFromFile(bucket: string, objectKey: string, sourcePath: string): Promise<string> {
    await this.ensureBucket(bucket);
    const target = this._full(bucket, objectKey);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await pipeline(createReadStream(sourcePath), createWriteStream(target));
    return objectKey;
  }

  async health(): Promise<{ status: 'ok' | 'unreachable'; root?: string }> {
    try {
      await fs.mkdir(this.root, { recursive: true });
      await fs.access(this.root);
      return { status: 'ok', root: this.root };
    } catch {
      return { status: 'unreachable' };
    }
  }
}
