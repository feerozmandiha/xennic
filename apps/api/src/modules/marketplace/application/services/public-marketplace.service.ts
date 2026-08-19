import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type {
  IMarketplaceRepository,
  PublicProductSearchParams,
  PublicVendorSearchParams,
} from '../../domain/interfaces/marketplace.repository.interface.js';
import { calcCategory } from '../calc-category.map.js';

@Injectable()
export class PublicMarketplaceService {
  constructor(
    @Inject('IMarketplaceRepository')
    private readonly repo: IMarketplaceRepository,
  ) {}

  async searchProducts(params: PublicProductSearchParams, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const result = await this.repo.searchPublicProducts({ ...params, offset, limit });
    return {
      data: result.data,
      meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
    };
  }

  async getProduct(id: string, locale = 'fa') {
    const record = await this.repo.findPublicProductById(id, locale);
    if (!record) throw new NotFoundException('Product not found');
    return record;
  }

  async searchVendors(params: PublicVendorSearchParams, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const result = await this.repo.searchPublicVendors({ ...params, offset, limit });
    return {
      data: result.data,
      meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
    };
  }

  async getVendor(id: string) {
    const record = await this.repo.findPublicVendorById(id);
    if (!record) throw new NotFoundException('Vendor not found');
    return record;
  }

  async listCategories() {
    return this.repo.listCategories();
  }

  async suggest(
    calculationType: string,
    resultParams: Record<string, any>,
    locale = 'fa',
    limit = 10,
  ) {
    const category = calcCategory(calculationType);
    if (!category) {
      return {
        data: [],
        category: null,
        meta: { page: 1, limit, total: 0, totalPages: 0 },
      };
    }

    const result = await this.repo.suggestPublicProducts({
      category,
      specs: resultParams,
      locale,
      limit,
    });
    return {
      data: result.data,
      category,
      meta: { page: 1, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
    };
  }
}
