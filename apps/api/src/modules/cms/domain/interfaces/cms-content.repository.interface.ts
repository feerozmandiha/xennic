import type { CmsContentEntity } from '../entities/cms-content.entity.js';

export interface ICmsContentRepository {
  save(entity: CmsContentEntity): Promise<void>;
  update(entity: CmsContentEntity): Promise<void>;
  findById(id: string): Promise<CmsContentEntity | null>;
  findBySlot(slot: string, locale: string): Promise<CmsContentEntity | null>;
  findAll(options?: {
    locale?: string;
    slotPrefix?: string;
    publishedOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<CmsContentEntity[]>;
  count(options?: {
    locale?: string;
    slotPrefix?: string;
    publishedOnly?: boolean;
  }): Promise<number>;
  delete(id: string): Promise<void>;
}
