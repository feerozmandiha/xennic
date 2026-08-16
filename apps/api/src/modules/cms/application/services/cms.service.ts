import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';
import {
  CmsContentEntity,
  type CmsBlock,
  type CmsDocument,
} from '../../domain/entities/cms-content.entity.js';
import type { ICmsContentRepository } from '../../domain/interfaces/cms-content.repository.interface.js';
import { LocalBlobStorage } from '../../infrastructure/storage/local-blob.storage.js';

const CMS_BUCKET = 'cms';
const ALLOWED_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
]);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_BLOCK_TYPES = new Set([
  'hero',
  'features',
  'feature',
  'pricing',
  'pricing-plan',
  'cta',
  'articles',
  'article',
  'logos',
  'stats',
  'faq',
  'faq-item',
  'testimonials',
  'testimonial',
  'contact',
  'gallery',
  'image',
  'video',
  'button',
  'buttons',
  'heading',
  'paragraph',
  'rich-text',
  'columns',
  'column',
  'spacer',
  'divider',
  'nav-link',
  'nav-links',
  'social-links',
  'footer-column',
  'html',
]);

@Injectable()
export class CmsService {
  private readonly logger = new Logger(CmsService.name);

  constructor(
    @Inject('ICmsContentRepository')
    private readonly repo: ICmsContentRepository,
    private readonly blob: LocalBlobStorage,
  ) {}

  // ── Public read ────────────────────────────────────────────────────────────

  async getPublished(slot: string, locale = 'fa'): Promise<CmsContentEntity | null> {
    const entity = await this.repo.findBySlot(slot, locale);
    if (!entity || !entity.isPublished) return null;
    return entity;
  }

  // ── Admin CRUD ─────────────────────────────────────────────────────────────

  async list(options: {
    locale?: string;
    slotPrefix?: string;
    publishedOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 50, 200);
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repo.findAll({
        locale: options.locale,
        slotPrefix: options.slotPrefix,
        publishedOnly: options.publishedOnly,
        limit,
        offset,
      }),
      this.repo.count({
        locale: options.locale,
        slotPrefix: options.slotPrefix,
        publishedOnly: options.publishedOnly,
      }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string): Promise<CmsContentEntity> {
    const e = await this.repo.findById(id);
    if (!e) throw new NotFoundException(`CMS content ${id} not found`);
    return e;
  }

  async getBySlot(slot: string, locale = 'fa'): Promise<CmsContentEntity> {
    const e = await this.repo.findBySlot(slot, locale);
    if (!e) throw new NotFoundException(`CMS slot ${slot} (${locale}) not found`);
    return e;
  }

  async upsert(input: {
    slot: string;
    locale: string;
    document: CmsDocument;
    publish?: boolean;
    userId?: string | null;
  }): Promise<CmsContentEntity> {
    this._validateDocument(input.document);
    const existing = await this.repo.findBySlot(input.slot, input.locale);
    if (existing) {
      existing.update(input.document, input.userId ?? null);
      if (input.publish) existing.publish(input.userId ?? null);
      await this.repo.update(existing);
      this.logger.log(
        `cms updated: slot=${input.slot} locale=${input.locale} v${existing.version}`,
      );
      return existing;
    }

    const entity = CmsContentEntity.create({
      slot: input.slot,
      locale: input.locale,
      document: input.document,
      createdBy: input.userId ?? null,
      publishedAt: input.publish ? new Date() : null,
    });
    await this.repo.save(entity);
    this.logger.log(`cms created: slot=${input.slot} locale=${input.locale} v${entity.version}`);
    return entity;
  }

  async patch(
    id: string,
    patch: { document: CmsDocument; publish?: boolean; userId?: string | null },
  ): Promise<CmsContentEntity> {
    const e = await this.getById(id);
    this._validateDocument(patch.document);
    e.update(patch.document, patch.userId ?? null);
    if (patch.publish === true) e.publish(patch.userId ?? null);
    if (patch.publish === false) e.unpublish();
    await this.repo.update(e);
    return e;
  }

  async publish(id: string, userId?: string | null): Promise<CmsContentEntity> {
    const e = await this.getById(id);
    e.publish(userId ?? null);
    await this.repo.update(e);
    return e;
  }

  async unpublish(id: string): Promise<CmsContentEntity> {
    const e = await this.getById(id);
    e.unpublish();
    await this.repo.update(e);
    return e;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  // ── Media ──────────────────────────────────────────────────────────────────

  async uploadMedia(data: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    slot?: string;
  }): Promise<{ id: string; url: string; mimeType: string; size: number; originalName: string }> {
    if (!ALLOWED_IMAGE_MIME.has(data.mimeType)) {
      throw new BadRequestException(
        `نوع فایل "${data.mimeType}" مجاز نیست. فقط تصاویر (JPEG/PNG/WEBP/GIF/SVG/AVIF).`,
      );
    }
    if (data.buffer.length > MAX_IMAGE_BYTES) {
      throw new BadRequestException(`حجم فایل بیش از ۱۰ مگابایت است.`);
    }
    const ext = path.extname(data.originalName).replace(/^\./, '').toLowerCase() || 'bin';
    const id = randomUUID();
    const folder = data.slot ? data.slot.replace(/^\/+|\/+$/g, '') : 'uploads';
    const objectKey = `${folder}/${new Date().getFullYear()}/${String(
      new Date().getMonth() + 1,
    ).padStart(2, '0')}/${id}.${ext}`;
    await this.blob.uploadBuffer(CMS_BUCKET, objectKey, data.buffer, data.mimeType);
    return {
      id,
      url: `/api/v1/cms/media/${objectKey}`,
      mimeType: data.mimeType,
      size: data.buffer.length,
      originalName: data.originalName,
    };
  }

  async readMedia(
    objectKey: string,
  ): Promise<{ stream: NodeJS.ReadableStream; mimeType: string; size: number }> {
    const full = objectKey.replace(/^\/+/, '');
    const stat = await this.blob.stat(CMS_BUCKET, full);
    if (!stat) throw new NotFoundException('رسانه پیدا نشد');
    const stream = await this.blob.getStream(CMS_BUCKET, full);
    const mimeType = this._guessMime(full);
    return { stream, mimeType, size: stat.size };
  }

  // ── Validation ─────────────────────────────────────────────────────────────

  private _validateDocument(doc: CmsDocument): void {
    if (!doc || doc.schema !== 'xennic-cms/v1') {
      throw new BadRequestException('سند باید با نسخه‌ی xennic-cms/v1 باشد');
    }
    if (!Array.isArray(doc.blocks)) {
      throw new BadRequestException('blocks باید آرایه باشد');
    }
    for (const block of doc.blocks) this._validateBlock(block);
  }

  private _validateBlock(block: CmsBlock): void {
    if (!block || typeof block !== 'object') {
      throw new BadRequestException('بلوک نامعتبر است');
    }
    if (!ALLOWED_BLOCK_TYPES.has(block.type)) {
      throw new BadRequestException(`نوع بلوک "${block.type}" مجاز نیست`);
    }
    if (!block.id || typeof block.id !== 'string') {
      throw new BadRequestException('شناسه‌ی بلوک الزامی است');
    }
    if (block.props && typeof block.props !== 'object') {
      throw new BadRequestException('پراپس‌های بلوک باید آبجکت باشد');
    }
    if (block.children) {
      if (!Array.isArray(block.children)) {
        throw new BadRequestException('children باید آرایه باشد');
      }
      for (const child of block.children) this._validateBlock(child);
    }
  }

  private _guessMime(key: string): string {
    const ext = path.extname(key).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      case '.gif':
        return 'image/gif';
      case '.svg':
        return 'image/svg+xml';
      case '.avif':
        return 'image/avif';
      default:
        return 'application/octet-stream';
    }
  }
}
