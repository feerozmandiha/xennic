import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { randomUUID } from 'node:crypto';
import type {
  IMarketplaceRepository, VendorSearchParams,
  ProductSearchParams, OrderSearchParams, SearchResult,
} from '../../domain/interfaces/marketplace.repository.interface.js';
import { VendorEntity } from '../../domain/entities/vendor.entity.js';
import { ProductEntity } from '../../domain/entities/product.entity.js';
import { OrderEntity } from '../../domain/entities/order.entity.js';
import type { OrderItemData } from '../../domain/entities/order.entity.js';

// Spec matching rules per category:
// Maps product specification keys → [calculation result key, match type]
// match types: 'exact' (value equals), 'min' (product value >= result), 'max' (product value <= result)
const SPEC_MATCH_RULES: Record<string, Record<string, [string, 'exact' | 'min' | 'max']>> = {
  cable: {
    cable_size_mm2: ['recommended_cable_size', 'min'],
    current_rating_a: ['corrected_ampacity', 'min'],
    voltage_rating_v: ['', 'exact'],
    conductor_material: ['', 'exact'],
    insulation_type: ['', 'exact'],
  },
  transformer: {
    rated_power_kva: ['', 'min'],
    impedance_pct: ['', 'exact'],
  },
  mccb: {
    rated_current_a: ['', 'min'],
    breaking_capacity_ka: ['', 'min'],
  },
  fuse: {
    rated_current_a: ['', 'min'],
  },
  motor: {
    rated_power_kw: ['', 'exact'],
    current_a: ['', 'min'],
  },
};

@Injectable()
export class MarketplaceRepository implements IMarketplaceRepository {
  // ── Vendors ─────────────────────────────────────

  async findVendorById(id: string): Promise<VendorEntity | null> {
    const row = await prisma.vendors.findUnique({ where: { id } });
    return row ? this._vendorToEntity(row) : null;
  }

  async findVendorBySlug(slug: string): Promise<VendorEntity | null> {
    const row = await prisma.vendors.findUnique({ where: { slug } });
    return row ? this._vendorToEntity(row) : null;
  }

  async searchVendors(params: VendorSearchParams): Promise<SearchResult<VendorEntity>> {
    const where: any = {};
    if (params.query) {
      where.OR = [
        { name: { contains: params.query, mode: 'insensitive' } },
        { slug: { contains: params.query, mode: 'insensitive' } },
      ];
    }
    if (params.status) where.status = params.status;

    const [data, total] = await Promise.all([
      prisma.vendors.findMany({
        where,
        skip: params.offset ?? 0,
        take: params.limit ?? 20,
        orderBy: { created_at: 'desc' },
      }),
      prisma.vendors.count({ where }),
    ]);
    return { data: data.map(r => this._vendorToEntity(r)), total };
  }

  async saveVendor(entity: VendorEntity): Promise<void> {
    await prisma.vendors.upsert({
      where: { id: entity.id },
      update: {
        name: entity.name,
        slug: entity.slug,
        status: entity.status,
        updated_at: entity.updatedAt,
      },
      create: {
        id: entity.id,
        name: entity.name,
        slug: entity.slug,
        status: entity.status,
        created_at: entity.createdAt,
        updated_at: entity.updatedAt,
      },
    });
  }

  // ── Products ─────────────────────────────────────

  async findProductById(id: string): Promise<ProductEntity | null> {
    const row = await prisma.products.findUnique({ where: { id } });
    return row ? this._productToEntity(row) : null;
  }

  async findProductBySku(sku: string): Promise<ProductEntity | null> {
    const row = await prisma.products.findUnique({ where: { sku } });
    return row ? this._productToEntity(row) : null;
  }

  async searchProducts(params: ProductSearchParams): Promise<SearchResult<ProductEntity>> {
    const where: any = { deleted_at: null };
    if (params.query) {
      where.OR = [
        { sku: { contains: params.query, mode: 'insensitive' } },
      ];
    }
    if (params.vendorId) where.vendor_id = params.vendorId;
    if (params.type) where.type = params.type;
    if (params.category) where.category = params.category;
    if (params.status) where.status = params.status;

    const [data, total] = await Promise.all([
      prisma.products.findMany({
        where,
        skip: params.offset ?? 0,
        take: params.limit ?? 20,
        orderBy: { created_at: 'desc' },
      }),
      prisma.products.count({ where }),
    ]);
    return { data: data.map(r => this._productToEntity(r)), total };
  }

  async suggestProducts(params: {
    category: string; specs: Record<string, any>; offset?: number; limit?: number;
  }): Promise<SearchResult<ProductEntity>> {
    const where: any = { deleted_at: null, category: params.category };

    const [data, total] = await Promise.all([
      prisma.products.findMany({
        where,
        skip: params.offset ?? 0,
        take: params.limit ?? 10,
        orderBy: { created_at: 'desc' },
      }),
      prisma.products.count({ where }),
    ]);

    const entities = data.map(r => this._productToEntity(r));

    // Score and rank by spec match
    const rules = SPEC_MATCH_RULES[params.category];
    if (rules && Object.keys(params.specs).length > 0) {
      const scored = entities.map((e) => {
        const prodSpecs = e.specifications ?? {};
        let score = 0;
        let totalChecks = 0;

        for (const [specKey, matchType] of Object.entries(rules)) {
          const prodVal = prodSpecs[specKey];
          if (prodVal == null) continue;

          const [resultKey] = matchType;
          if (!resultKey) {
            // No result key mapping — can only match if product spec exists (bonus)
            score += 0.5;
            totalChecks++;
            continue;
          }

          const resultVal = params.specs[resultKey];
          if (resultVal == null) continue;

          totalChecks++;
          const pv = parseFloat(String(prodVal));
          const rv = parseFloat(String(resultVal));

          if (isNaN(pv) || isNaN(rv)) continue;

          const [, matchTypeOp] = matchType;
          switch (matchTypeOp) {
            case 'exact':
              if (Math.abs(pv - rv) / Math.max(rv, 1) < 0.05) score += 1;
              break;
            case 'min':
              if (pv >= rv) score += 1;
              break;
            case 'max':
              if (pv <= rv) score += 1;
              break;
          }
        }

        return { entity: e, score: totalChecks > 0 ? score / totalChecks : 0 };
      });

      scored.sort((a, b) => b.score - a.score);
      return {
        data: scored.map(s => s.entity),
        total,
      };
    }

    return { data: entities, total };
  }

  async saveProduct(entity: ProductEntity): Promise<void> {
    await prisma.products.upsert({
      where: { id: entity.id },
      update: {
        type: entity.type,
        category: entity.category,
        specifications: entity.specifications as any,
        sku: entity.sku,
        price: entity.price,
        currency: entity.currency,
        status: entity.status,
        deleted_at: entity.deletedAt,
        updated_at: entity.updatedAt,
      },
      create: {
        id: entity.id,
        vendor_id: entity.vendorId,
        type: entity.type,
        category: entity.category,
        specifications: entity.specifications as any,
        sku: entity.sku,
        price: entity.price,
        currency: entity.currency,
        status: entity.status,
        created_at: entity.createdAt,
        updated_at: entity.updatedAt,
      },
    });
  }

  async deleteProduct(id: string): Promise<void> {
    await prisma.products.update({
      where: { id },
      data: { deleted_at: new Date(), status: 'archived' },
    });
  }

  // ── Orders ────────────────────────────────────────

  async findOrderById(id: string): Promise<OrderEntity | null> {
    const row = await prisma.orders.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!row) return null;
    return this._orderToEntity(row as any);
  }

  async searchOrders(params: OrderSearchParams): Promise<SearchResult<OrderEntity>> {
    const where: any = { workspace_id: params.workspaceId };
    if (params.status) where.status = params.status;
    if (params.userId) where.user_id = params.userId;

    const [data, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        skip: params.offset ?? 0,
        take: params.limit ?? 20,
        orderBy: { created_at: 'desc' },
        include: { items: true },
      }),
      prisma.orders.count({ where }),
    ]);
    return { data: data.map(r => this._orderToEntity(r as any)), total };
  }

  async saveOrder(entity: OrderEntity): Promise<void> {
    await prisma.orders.upsert({
      where: { id: entity.id },
      update: {
        status: entity.status,
        total_amount: entity.totalAmount,
        updated_at: entity.updatedAt,
      },
      create: {
        id: entity.id,
        workspace_id: entity.workspaceId,
        user_id: entity.userId,
        status: entity.status,
        currency: entity.currency,
        total_amount: entity.totalAmount,
        created_at: entity.createdAt,
        updated_at: entity.updatedAt,
      },
    });

    // sync order items
    await prisma.order_items.deleteMany({ where: { order_id: entity.id } });
    if (entity.items.length > 0) {
      await prisma.order_items.createMany({
        data: entity.items.map(i => ({
          id: randomUUID(),
          order_id: entity.id,
          product_id: i.productId,
          quantity: i.quantity,
          unit_price: i.unitPrice,
          total_price: i.totalPrice,
        })),
      });
    }
  }

  // ── Mappers ─────────────────────────────────────

  private _vendorToEntity(row: any): VendorEntity {
    return VendorEntity.reconstitute({
      id: row.id,
      name: row.name,
      slug: row.slug,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  private _productToEntity(row: any): ProductEntity {
    return ProductEntity.reconstitute({
      id: row.id,
      vendorId: row.vendor_id,
      type: row.type,
      category: row.category ?? null,
      specifications: row.specifications ? (typeof row.specifications === 'string' ? JSON.parse(row.specifications) : row.specifications) : null,
      sku: row.sku,
      price: Number(row.price),
      currency: row.currency,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at ?? null,
    });
  }

  private _orderToEntity(row: any): OrderEntity {
    const items: OrderItemData[] = (row.items ?? []).map((i: any) => ({
      productId: i.product_id,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
      totalPrice: Number(i.total_price),
    }));
    return OrderEntity.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      userId: row.user_id,
      status: row.status,
      currency: row.currency,
      totalAmount: Number(row.total_amount),
      items,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
