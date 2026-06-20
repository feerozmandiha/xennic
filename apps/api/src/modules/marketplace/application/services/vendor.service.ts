import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import type { IMarketplaceRepository } from '../../domain/interfaces/marketplace.repository.interface.js';
import { VendorEntity } from '../../domain/entities/vendor.entity.js';
import type { CreateVendorDto, UpdateVendorDto } from '../../presentation/dtos/vendor.dto.js';

@Injectable()
export class VendorService {
  constructor(
    @Inject('IMarketplaceRepository')
    private readonly repo: IMarketplaceRepository,
  ) {}

  async findAll(query?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const result = await this.repo.searchVendors({ query, offset, limit });
    return {
      data: result.data,
      meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
    };
  }

  async findById(id: string): Promise<VendorEntity> {
    const entity = await this.repo.findVendorById(id);
    if (!entity) throw new NotFoundException('Vendor not found');
    return entity;
  }

  async create(dto: CreateVendorDto): Promise<VendorEntity> {
    const existing = await this.repo.findVendorBySlug(dto.slug ?? dto.name.toLowerCase().replace(/\s+/g, '-'));
    if (existing) throw new ConflictException('Vendor slug already exists');

    const entity = VendorEntity.create(dto);
    await this.repo.saveVendor(entity);
    return entity;
  }

  async update(id: string, dto: UpdateVendorDto): Promise<VendorEntity> {
    const entity = await this.findById(id);
    entity.update(dto);
    await this.repo.saveVendor(entity);
    return entity;
  }
}
