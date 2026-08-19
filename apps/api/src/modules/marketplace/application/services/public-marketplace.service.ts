import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type {
  IMarketplaceRepository,
  PublicProductSearchParams,
  PublicVendorSearchParams,
} from '../../domain/interfaces/marketplace.repository.interface.js';

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
}
