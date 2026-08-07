/**
 * ذخیره‌سازی سبک درخواست‌های مشاوره (سند ۰۷ بخش ۲).
 * فایل JSON در DATA_DIR؛ در صورت تنظیم STORE_ENC_KEY داده‌های حساس (شماره تلفن)
 * با AES-256-GCM رمز می‌شوند.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';

export interface ConsultationRequest {
  id: string; // کد پیگیری ۶ نویسی
  platform: 'telegram' | 'bale';
  chatId: string;
  userName?: string;
  channel: 'pv' | 'call';
  phone?: string; // رمز‌شده در سکون (در صورت وجود کلید)
  preferredWindow?: 'morning' | 'noon' | 'evening';
  message?: string;
  billSummary: {
    billId?: string;
    tariffType?: string;
    zone?: string;
    consumptionKwh?: number;
    monthlyAvgKwh?: number;
    relativeToPattern?: number;
    totalRials?: number;
    topIssue?: string;
  };
  status: 'open' | 'contacted' | 'closed';
  createdAt: string;
}

interface StoreFile {
  consultations: ConsultationRequest[];
}

export class ConsultationStore {
  private data: StoreFile = { consultations: [] };
  private file: string;
  private key: Buffer | null = null;

  constructor(dataDir: string, encKeyBase64?: string) {
    this.file = join(dataDir, 'consultations.json');
    if (encKeyBase64) {
      this.key = createHash('sha256').update(encKeyBase64).digest();
    }
  }

  async init(): Promise<void> {
    await mkdir(join(this.file, '..'), { recursive: true });
    try {
      const raw = await readFile(this.file, 'utf8');
      this.data = JSON.parse(raw) as StoreFile;
      // رمزگشایی فیلدهای حساس برای استفاده در زمان اجرا
      for (const c of this.data.consultations) {
        if (c.phone) c.phone = this.decrypt(c.phone);
      }
    } catch {
      this.data = { consultations: [] };
    }
  }

  private encrypt(plain: string): string {
    if (!this.key) return plain;
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `enc:${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
  }

  private decrypt(value: string): string {
    if (!value.startsWith('enc:') || !this.key) return value;
    try {
      const [, ivB64, tagB64, dataB64] = value.split(':');
      const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(ivB64, 'base64'));
      decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
      return Buffer.concat([
        decipher.update(Buffer.from(dataB64, 'base64')),
        decipher.final(),
      ]).toString('utf8');
    } catch {
      return '<unreadable>';
    }
  }

  private async persist(): Promise<void> {
    // پیش از نوشتن، فیلدهای حساس رمز شوند
    const snapshot: StoreFile = {
      consultations: this.data.consultations.map((c) => ({
        ...c,
        phone: c.phone ? this.encrypt(c.phone) : undefined,
      })),
    };
    await writeFile(this.file, JSON.stringify(snapshot, null, 2), 'utf8');
  }

  newId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '';
    for (let i = 0; i < 6; i += 1) {
      id += chars[randomBytes(1)[0] % chars.length];
    }
    return id;
  }

  async add(
    req: Omit<ConsultationRequest, 'id' | 'status' | 'createdAt'>,
  ): Promise<ConsultationRequest> {
    const full: ConsultationRequest = {
      ...req,
      id: this.newId(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    this.data.consultations.push(full);
    await this.persist();
    return full;
  }

  async setStatus(id: string, status: ConsultationRequest['status']): Promise<void> {
    const item = this.data.consultations.find((c) => c.id === id);
    if (item) {
      item.status = status;
      await this.persist();
    }
  }

  openList(): ConsultationRequest[] {
    return this.data.consultations.filter((c) => c.status !== 'closed');
  }

  byUser(platform: string, chatId: string): ConsultationRequest[] {
    return this.data.consultations.filter((c) => c.platform === platform && c.chatId === chatId);
  }
}
