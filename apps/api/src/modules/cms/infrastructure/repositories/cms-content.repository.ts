import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { ICmsContentRepository } from '../../domain/interfaces/cms-content.repository.interface.js';
import { CmsContentEntity, type CmsDocument } from '../../domain/entities/cms-content.entity.js';

/**
 * CmsContentRepository — دسترسی به جدول cms_content
 *
 * از $queryRaw استفاده می‌کند تا به extensionهای چنداجاره‌ای Prisma گره نخورد
 * (محتوای CMS سراسری است و workspace_id ندارد).
 */
@Injectable()
export class CmsContentRepository implements ICmsContentRepository {
  async save(entity: CmsContentEntity): Promise<void> {
    await prisma.$executeRaw`
      INSERT INTO "cms_content"
        (id, slot, locale, document, version, published_at, created_by, updated_by, created_at, updated_at)
      VALUES
        (${entity.id}, ${entity.slot}, ${entity.locale},
         ${JSON.stringify(entity.document)}::jsonb,
         ${entity.version}, ${entity.publishedAt},
         ${entity.createdBy}, ${entity.updatedBy},
         ${entity.createdAt}, ${entity.updatedAt})
    `;
  }

  async update(entity: CmsContentEntity): Promise<void> {
    await prisma.$executeRaw`
      UPDATE "cms_content"
      SET document     = ${JSON.stringify(entity.document)}::jsonb,
          version      = ${entity.version},
          published_at = ${entity.publishedAt},
          updated_by   = ${entity.updatedBy},
          updated_at   = ${entity.updatedAt}
      WHERE id = ${entity.id}
    `;
  }

  async findById(id: string): Promise<CmsContentEntity | null> {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT * FROM "cms_content" WHERE id = ${id} LIMIT 1
    `;
    return rows[0] ? this._map(rows[0]) : null;
  }

  async findBySlot(slot: string, locale: string): Promise<CmsContentEntity | null> {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT * FROM "cms_content"
      WHERE slot = ${slot} AND locale = ${locale}
      LIMIT 1
    `;
    return rows[0] ? this._map(rows[0]) : null;
  }

  async findAll(options?: {
    locale?: string;
    slotPrefix?: string;
    publishedOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<CmsContentEntity[]> {
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;
    const rows = await prisma.$queryRaw<any[]>`
      SELECT * FROM "cms_content"
      WHERE
        (${options?.locale ?? null}::text IS NULL OR locale = ${options?.locale ?? null})
        AND (${options?.slotPrefix ?? null}::text IS NULL OR slot LIKE ${options?.slotPrefix ?? null} || '%')
        AND (${options?.publishedOnly ?? false} = false OR published_at IS NOT NULL)
      ORDER BY slot ASC, locale ASC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return rows.map((r) => this._map(r));
  }

  async count(options?: {
    locale?: string;
    slotPrefix?: string;
    publishedOnly?: boolean;
  }): Promise<number> {
    const rows = await prisma.$queryRaw<{ count: string }[]>`
      SELECT COUNT(*)::text as count FROM "cms_content"
      WHERE
        (${options?.locale ?? null}::text IS NULL OR locale = ${options?.locale ?? null})
        AND (${options?.slotPrefix ?? null}::text IS NULL OR slot LIKE ${options?.slotPrefix ?? null} || '%')
        AND (${options?.publishedOnly ?? false} = false OR published_at IS NOT NULL)
    `;
    return Number(rows[0]?.count ?? 0);
  }

  async delete(id: string): Promise<void> {
    await prisma.$executeRaw`DELETE FROM "cms_content" WHERE id = ${id}`;
  }

  private _map(row: any): CmsContentEntity {
    return CmsContentEntity.reconstitute({
      id: row.id,
      slot: row.slot,
      locale: row.locale,
      document: (typeof row.document === 'string'
        ? JSON.parse(row.document)
        : row.document) as CmsDocument,
      createdBy: row.created_by ?? null,
      updatedBy: row.updated_by ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      version: Number(row.version),
      publishedAt: row.published_at ?? null,
    });
  }
}
