import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IMarketplaceRepository } from '../../domain/interfaces/marketplace.repository.interface.js';
import { ProductEntity } from '../../domain/entities/product.entity.js';
import type { CreateProductDto, UpdateProductDto } from '../../presentation/dtos/product.dto.js';

// Maps calculation types to product categories
const CALC_TO_CATEGORY: Record<string, string> = {
  'CABLE-001': 'cable',
  'CABLE-002': 'cable',
  'CABLE-003': 'cable',
  'CABLE-004': 'cable',
  'CABLE-005': 'cable',
  'TRF-001': 'transformer',
  'TRF-002': 'transformer',
  'TRF-003': 'transformer',
  'TRF-004': 'transformer',
  'TRF-005': 'transformer',
  'PROT-001': 'mccb',
  'PROT-004': 'fuse',
  'PROT-005': 'mccb',
  'SC-001': 'mccb',
  'SWT-001': 'switchgear',
  'LIGHT-001': 'lighting',
  'LIGHT-002': 'lighting',
  'PV-001': 'solar',
  'SOLAR-002': 'solar',
  'SOLAR-003': 'solar',
  'BAT-001': 'battery',
  'BAT-BU-001': 'battery',
  'BATTERY-002': 'battery',
  'GND-001': 'grounding',
  'GND-002': 'grounding',
  'MOT-001': 'motor',
  'MOT-002': 'motor',
};

@Injectable()
export class ProductService {
  constructor(
    @Inject('IMarketplaceRepository')
    private readonly repo: IMarketplaceRepository,
  ) {}

  async findAll(
    query?: string, vendorId?: string, type?: string,
    category?: string, status?: string, page = 1, limit = 20,
  ) {
    const offset = (page - 1) * limit;
    const result = await this.repo.searchProducts({
      query, vendorId, type, category, status, offset, limit,
    });
    return {
      data: result.data,
      meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
    };
  }

  async findById(id: string): Promise<ProductEntity> {
    const entity = await this.repo.findProductById(id);
    if (!entity || entity.deletedAt) throw new NotFoundException('Product not found');
    return entity;
  }

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    const entity = ProductEntity.create({
      vendorId: dto.vendorId,
      type: dto.type,
      category: dto.category,
      specifications: dto.specifications,
      sku: dto.sku,
      price: dto.price,
      currency: dto.currency,
    });
    await this.repo.saveProduct(entity);
    return entity;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductEntity> {
    const entity = await this.findById(id);
    entity.update(dto);
    await this.repo.saveProduct(entity);
    return entity;
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findById(id);
    entity.softDelete();
    await this.repo.saveProduct(entity);
  }

  async suggest(
    calculationType: string,
    resultParams: Record<string, any>,
    page = 1, limit = 10,
  ) {
    const category = CALC_TO_CATEGORY[calculationType];
    if (!category) {
      return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
    }

    const offset = (page - 1) * limit;
    const result = await this.repo.suggestProducts({
      category, specs: resultParams, offset, limit,
    });
    return {
      data: result.data,
      meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
    };
  }
}
