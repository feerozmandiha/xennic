import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { TaxonomyNodeProps } from '../../domain/ontology.types.js';
import type { ITaxonomyRepository } from '../../domain/interfaces/taxonomy.repository.interface.js';

@Injectable()
export class TaxonomyRepository implements ITaxonomyRepository {
  async getByLevel(level: number, workspaceId?: string): Promise<TaxonomyNodeProps[]> {
    const rows = await prisma.categories.findMany({
      where: { level, is_active: true },
      orderBy: { sort_order: 'asc' },
    });
    return rows.map(this.toNode);
  }

  async getChildren(parentId: string): Promise<TaxonomyNodeProps[]> {
    const rows = await prisma.categories.findMany({
      where: { parent_id: parentId, is_active: true },
      orderBy: { sort_order: 'asc' },
    });
    return rows.map(this.toNode);
  }

  async getParent(nodeId: string): Promise<TaxonomyNodeProps | null> {
    const node = await prisma.categories.findUnique({ where: { id: nodeId } });
    if (!node?.parent_id) return null;
    const parent = await prisma.categories.findUnique({ where: { id: node.parent_id } });
    return parent ? this.toNode(parent) : null;
  }

  async getAncestors(nodeId: string): Promise<TaxonomyNodeProps[]> {
    const ancestors: TaxonomyNodeProps[] = [];
    let current = await prisma.categories.findUnique({ where: { id: nodeId } });
    while (current?.parent_id) {
      const parent = await prisma.categories.findUnique({ where: { id: current.parent_id } });
      if (parent) {
        ancestors.unshift(this.toNode(parent));
        current = parent;
      } else break;
    }
    return ancestors;
  }

  async getDescendants(nodeId: string): Promise<TaxonomyNodeProps[]> {
    const all: TaxonomyNodeProps[] = [];
    const children = await prisma.categories.findMany({
      where: { parent_id: nodeId, is_active: true },
    });
    for (const child of children) {
      all.push(this.toNode(child));
      const grandChildren = await this.getDescendants(child.id);
      all.push(...grandChildren);
    }
    return all;
  }

  async findById(id: string): Promise<TaxonomyNodeProps | null> {
    const row = await prisma.categories.findUnique({ where: { id } });
    return row ? this.toNode(row) : null;
  }

  async findBySlug(slug: string): Promise<TaxonomyNodeProps | null> {
    const row = await prisma.categories.findUnique({ where: { slug } });
    return row ? this.toNode(row) : null;
  }

  async create(node: TaxonomyNodeProps): Promise<void> {
    await prisma.categories.create({
      data: {
        id: node.id,
        parent_id: node.parentId,
        slug: node.slug,
        name: node.name,
        name_en: node.nameEn,
        icon: node.icon,
        color: node.color,
        sort_order: node.sortOrder,
        is_active: node.isActive,
        level: node.level,
      },
    });
  }

  async update(node: TaxonomyNodeProps): Promise<void> {
    await prisma.categories.update({
      where: { id: node.id },
      data: {
        parent_id: node.parentId,
        slug: node.slug,
        name: node.name,
        name_en: node.nameEn,
        icon: node.icon,
        color: node.color,
        sort_order: node.sortOrder,
        is_active: node.isActive,
        level: node.level,
      },
    });
  }

  private toNode(row: any): TaxonomyNodeProps {
    return {
      id: row.id,
      parentId: row.parent_id ?? undefined,
      slug: row.slug,
      name: row.name,
      nameEn: row.name_en ?? undefined,
      level: row.level,
      icon: row.icon ?? undefined,
      color: row.color ?? undefined,
      sortOrder: row.sort_order,
      isActive: row.is_active,
    };
  }
}
