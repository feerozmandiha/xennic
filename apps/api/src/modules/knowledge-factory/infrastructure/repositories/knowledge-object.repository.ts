import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { prisma } from '@xennic/database';
import { KnowledgeObject } from '../../domain/knowledge-object.entity.js';
import type { IKnowledgeObjectRepository, KnowledgeSearchOptions, KnowledgeSearchResult } from '../../domain/interfaces/knowledge-object.repository.interface.js';

@Injectable()
export class KnowledgeObjectRepository implements IKnowledgeObjectRepository {
  private readonly logger = new Logger(KnowledgeObjectRepository.name);

  async save(ko: KnowledgeObject): Promise<void> {
    const data = ko.toJSON();
    await prisma.knowledge_objects.create({
      data: {
        id: data.id,
        xid: data.xid,
        workspace_id: data.workspaceId,
        title: data.title,
        slug: data.slug,
        language: data.language,
        tier: data.tier,
        taxonomy: data.taxonomy,
        ontology_refs: data.ontologyRefs,
        document_version: data.documentVersion,
        checksum: data.checksum,
        publication_date: data.publicationDate,
        effective_date: data.effectiveDate,
        status: data.status,
        license: data.license,
        authority_score: data.authorityScore,
        engineering_domain: data.engineeringDomain,
        semantic_tags: data.semanticTags,
        citations: data.citations,
        source_url: data.sourceUrl,
        storage_path: data.storagePath,
        content: data.content,
        search_text: this.buildSearchText(data),
      },
    });
  }

  async update(ko: KnowledgeObject): Promise<void> {
    const data = ko.toJSON();
    await prisma.knowledge_objects.update({
      where: { id: data.id },
      data: {
        title: data.title,
        slug: data.slug,
        language: data.language,
        tier: data.tier,
        taxonomy: data.taxonomy,
        ontology_refs: data.ontologyRefs,
        document_version: data.documentVersion,
        checksum: data.checksum,
        publication_date: data.publicationDate,
        effective_date: data.effectiveDate,
        status: data.status,
        license: data.license,
        authority_score: data.authorityScore,
        engineering_domain: data.engineeringDomain,
        semantic_tags: data.semanticTags,
        citations: data.citations,
        source_url: data.sourceUrl,
        storage_path: data.storagePath,
        content: data.content,
        search_text: this.buildSearchText(data),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.knowledge_objects.delete({ where: { id } });
  }

  async findById(id: string): Promise<KnowledgeObject | null> {
    const row = await prisma.knowledge_objects.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findByXid(xid: string): Promise<KnowledgeObject | null> {
    const row = await prisma.knowledge_objects.findUnique({ where: { xid } });
    return row ? this.toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<KnowledgeObject | null> {
    const row = await prisma.knowledge_objects.findUnique({ where: { slug } });
    return row ? this.toEntity(row) : null;
  }

  async searchMetadata(options: KnowledgeSearchOptions): Promise<{ items: KnowledgeSearchResult[]; total: number }> {
    const where: any = { workspace_id: options.workspaceId };
    if (options.query) {
      where.OR = [
        { title: { contains: options.query, mode: 'insensitive' } },
        { search_text: { contains: options.query, mode: 'insensitive' } },
      ];
    }
    if (options.status) where.status = options.status;
    if (options.tier) where.tier = options.tier;
    if (options.language) where.language = options.language;
    if (options.engineeringDomain) where.engineering_domain = options.engineeringDomain;
    if (options.tags?.length) {
      where.semantic_tags = { array_contains: options.tags };
    }

    const [rows, total] = await Promise.all([
      prisma.knowledge_objects.findMany({
        where,
        orderBy: { updated_at: 'desc' },
        take: options.limit ?? 20,
        skip: options.offset ?? 0,
      }),
      prisma.knowledge_objects.count({ where }),
    ]);

    const items: KnowledgeSearchResult[] = rows.map((r) => ({
      id: r.id,
      xid: r.xid,
      title: r.title,
      slug: r.slug,
      status: r.status as any,
      tier: r.tier as any,
      authorityScore: r.authority_score,
      engineeringDomain: r.engineering_domain ?? undefined,
      language: r.language,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    return { items, total };
  }

  private toEntity(row: any): KnowledgeObject {
    return KnowledgeObject.reconstitute({
      id: row.id,
      xid: row.xid,
      workspaceId: row.workspace_id,
      title: row.title,
      slug: row.slug,
      language: row.language,
      tier: row.tier,
      taxonomy: row.taxonomy as any[],
      ontologyRefs: row.ontology_refs as any[],
      documentVersion: row.document_version,
      checksum: row.checksum ?? undefined,
      publicationDate: row.publication_date ?? undefined,
      effectiveDate: row.effective_date ?? undefined,
      status: row.status,
      license: row.license ?? undefined,
      authorityScore: row.authority_score,
      engineeringDomain: row.engineering_domain ?? undefined,
      semanticTags: row.semantic_tags as any[],
      citations: row.citations as any[],
      sourceUrl: row.source_url ?? undefined,
      storagePath: row.storage_path ?? undefined,
      content: row.content as any,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  private buildSearchText(data: Record<string, any>): string {
    const parts: string[] = [data.title ?? ''];
    if (data.engineeringDomain) parts.push(data.engineeringDomain);
    if (Array.isArray(data.semanticTags)) parts.push(...data.semanticTags);
    if (data.content && typeof data.content === 'object') {
      const contentStr = JSON.stringify(data.content);
      parts.push(contentStr.slice(0, 5000));
    }
    return parts.join(' ').slice(0, 10000);
  }
}
