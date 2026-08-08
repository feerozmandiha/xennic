import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { MinioService } from '../../../storage/infrastructure/minio/minio.service.js';
import {
  DEFAULT_LANDING_CONTENT,
  mergeWithDefaults,
  type CmsImage,
  type LandingContent,
} from '../../domain/landing-content.js';

/**
 * assetهای صفحه فرود در workspace سیستمی با این کد نگهداری می‌شوند
 * (همان workspace که seed می‌سازد) و از باکت public storage استفاده می‌کنند.
 */
const SYSTEM_WORKSPACE_CODE = 'XENNIC';
const ASSET_BUCKET = 'public';
const CONFIG_SCOPE = 'default';
const PUBLIC_URL_EXPIRY = 60 * 60 * 24 * 7; // 7 روز

// کلاینت مستقیم برای دسترسی به جدول‌های گلوبال (بدون اکستنشن tenant)
const db = new PrismaClient();

@Injectable()
export class LandingCmsService {
  private readonly logger = new Logger(LandingCmsService.name);

  constructor(private readonly minioService: MinioService) {}

  // ── محتوای منتشرشده (عمومی) ───────────────────────────────────────────────

  async getPublished(locale = 'fa'): Promise<LandingContent> {
    const row = await this._findPublished(locale);
    const content = row ? mergeWithDefaults(row.content) : structuredClone(DEFAULT_LANDING_CONTENT);
    return this._resolveAssetUrls(content);
  }

  // ── محتوای پیش‌نویس (ادمین) ────────────────────────────────────────────────

  async getDraft(locale = 'fa'): Promise<{
    content: LandingContent;
    published: boolean;
    updatedAt: Date | null;
    versionNote: string | null;
  }> {
    const row = await this._findRow(locale);
    if (!row) {
      return {
        content: structuredClone(DEFAULT_LANDING_CONTENT),
        published: false,
        updatedAt: null,
        versionNote: null,
      };
    }
    return {
      content: await this._resolveAssetUrls(mergeWithDefaults(row.content)),
      published: row.published,
      updatedAt: row.updated_at,
      versionNote: row.version_note,
    };
  }

  async saveDraft(
    content: Record<string, unknown>,
    userId: string | undefined,
    locale = 'fa',
    versionNote?: string,
  ): Promise<{ content: LandingContent }> {
    if (!content || typeof content !== 'object') {
      throw new BadRequestException('content باید یک شیء معتبر باشد');
    }
    const merged = mergeWithDefaults(content);

    await db.landing_cms_config.upsert({
      where: { scope: this._scopeKey(locale) },
      update: {
        content: merged as unknown as object,
        locale,
        version_note: versionNote ?? null,
        updated_by: userId ?? null,
        updated_at: new Date(),
      },
      create: {
        id: randomUUID(),
        scope: this._scopeKey(locale),
        locale,
        content: merged as unknown as object,
        published: false,
        version_note: versionNote ?? null,
        updated_by: userId ?? null,
      },
    });

    this.logger.log(`Landing draft saved (locale=${locale}) by ${userId ?? 'system'}`);
    return { content: merged };
  }

  async setPublished(
    published: boolean,
    userId: string | undefined,
    locale = 'fa',
    versionNote?: string,
  ): Promise<{ success: true }> {
    const existing = await this._findRow(locale);
    if (!existing) throw new NotFoundException('هنوز محتوایی برای انتشار ذخیره نشده است');
    await db.landing_cms_config.update({
      where: { scope: this._scopeKey(locale) },
      data: {
        published,
        version_note: versionNote ?? existing.version_note,
        updated_by: userId ?? existing.updated_by,
        updated_at: new Date(),
      },
    });
    return { success: true };
  }

  async reset(locale = 'fa'): Promise<LandingContent> {
    await db.landing_cms_config.deleteMany({ where: { scope: this._scopeKey(locale) } });
    return structuredClone(DEFAULT_LANDING_CONTENT);
  }

  // ── آپلود asset با استفاده از storage موجود ────────────────────────────────

  async uploadAsset(data: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    uploadedBy?: string;
    purpose?: string;
  }): Promise<CmsImage> {
    if (!data.mimeType.startsWith('image/')) {
      throw new BadRequestException('فقط فایل تصویری مجاز است (image/*)');
    }
    if (data.buffer.length > 10 * 1024 * 1024) {
      throw new BadRequestException('حداکثر حجم تصویر ۱۰ مگابایت است');
    }

    const workspaceId = await this._ensureSystemWorkspace(data.uploadedBy);
    const ext = path.extname(data.originalName).toLowerCase().slice(1) || 'bin';
    const filename = `${randomUUID()}.${ext}`;
    const objectPath = `landing/${new Date().getFullYear()}/${String(
      new Date().getMonth() + 1,
    ).padStart(2, '0')}/${filename}`;
    const objectKey = `${workspaceId}/${objectPath}`;

    await this.minioService.uploadBuffer(
      ASSET_BUCKET,
      objectKey,
      data.buffer,
      data.mimeType,
      data.buffer.length,
    );

    const file = await db.files.create({
      data: {
        id: randomUUID(),
        workspace_id: workspaceId,
        bucket: ASSET_BUCKET,
        path: objectPath,
        filename,
        original_name: data.originalName,
        extension: ext,
        mime_type: data.mimeType,
        size: BigInt(data.buffer.length),
        uploaded_by: data.uploadedBy ?? workspaceId,
      },
    });

    const url = await this.minioService.getPresignedUrl(ASSET_BUCKET, objectKey, PUBLIC_URL_EXPIRY);
    this.logger.log(`Landing asset uploaded: ${file.id} (${data.purpose ?? 'generic'})`);
    return { fileId: file.id, url, alt: data.originalName };
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  private _scopeKey(locale: string): string {
    return locale === 'fa' ? CONFIG_SCOPE : `${CONFIG_SCOPE}:${locale}`;
  }

  private async _findRow(locale: string) {
    return db.landing_cms_config.findUnique({ where: { scope: this._scopeKey(locale) } });
  }

  private async _findPublished(locale: string) {
    const row = await db.landing_cms_config.findFirst({
      where: { locale, published: true },
      orderBy: { updated_at: 'desc' },
    });
    if (row) return row;
    if (locale !== 'fa') {
      return db.landing_cms_config.findFirst({
        where: { locale: 'fa', published: true },
        orderBy: { updated_at: 'desc' },
      });
    }
    return null;
  }

  private async _ensureSystemWorkspace(userId?: string): Promise<string> {
    const ws = await db.workspaces.findUnique({ where: { code: SYSTEM_WORKSPACE_CODE } });
    if (ws) return ws.id;

    let ownerId = userId;
    if (!ownerId) {
      const admin = await db.users.findFirst({
        where: { is_admin: true, deleted_at: null },
        select: { id: true },
      });
      ownerId = admin?.id;
    }
    if (!ownerId) {
      const anyUser = await db.users.findFirst({
        where: { deleted_at: null },
        select: { id: true },
      });
      ownerId = anyUser?.id;
    }
    if (!ownerId) {
      throw new BadRequestException('برای آپلود ابتدا باید حداقل یک کاربر وجود داشته باشد');
    }

    const created = await db.workspaces.create({
      data: {
        id: randomUUID(),
        code: SYSTEM_WORKSPACE_CODE,
        name: 'Xennic System',
        created_by: ownerId,
        updated_by: ownerId,
      },
    });
    this.logger.warn(`System workspace created on demand: ${created.id}`);
    return created.id;
  }

  private async _presignedUrl(bucket: string, objectPath: string): Promise<string> {
    const wsId = await this._ensureSystemWorkspace();
    const objectKey = objectPath.startsWith(wsId) ? objectPath : `${wsId}/${objectPath}`;
    try {
      return await this.minioService.getPresignedUrl(bucket, objectKey, PUBLIC_URL_EXPIRY);
    } catch (err) {
      this.logger.error(`Presign failed: ${(err as Error).message}`);
      return '';
    }
  }

  private async _resolveAssetUrls(content: LandingContent): Promise<LandingContent> {
    const fileIds = new Set<string>();
    const collect = (img?: CmsImage) => img?.fileId && fileIds.add(img.fileId);
    collect(content.branding.logo);
    collect(content.branding.favicon);
    collect(content.seo.ogImage);
    collect(content.hero.backgroundImage);
    if (fileIds.size === 0) return content;

    const files = await db.files.findMany({
      where: { id: { in: Array.from(fileIds) }, deleted_at: null },
    });
    const urlById = new Map<string, string>();
    for (const f of files) urlById.set(f.id, await this._presignedUrl(f.bucket, f.path));

    const apply = (img?: CmsImage): CmsImage | undefined => {
      if (!img?.fileId) return img;
      const url = urlById.get(img.fileId);
      return url ? { ...img, url } : img;
    };

    return {
      ...content,
      branding: {
        ...content.branding,
        logo: apply(content.branding.logo),
        favicon: apply(content.branding.favicon),
      },
      seo: { ...content.seo, ogImage: apply(content.seo.ogImage) },
      hero: { ...content.hero, backgroundImage: apply(content.hero.backgroundImage) },
    };
  }
}
