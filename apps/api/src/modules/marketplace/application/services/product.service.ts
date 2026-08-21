import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import type { IMarketplaceRepository } from '../../domain/interfaces/marketplace.repository.interface.js';
import { ProductEntity } from '../../domain/entities/product.entity.js';
import { ProductTranslation } from '../../domain/value-objects/product-translation.vo.js';
import type { ProductImage } from '../../domain/value-objects/product-image.vo.js';
import type { CreateProductDto, UpdateProductDto } from '../../presentation/dtos/product.dto.js';
import type {
  CreateProductImageDto,
  UpdateProductImageDto,
  UpsertProductTranslationDto,
} from '../../presentation/dtos/product.dto.js';
import { calcCategory } from '../calc-category.map.js';

@Injectable()
export class ProductService {
  constructor(
    @Inject('IMarketplaceRepository')
    private readonly repo: IMarketplaceRepository,
  ) {}

  async findAll(
    query?: string,
    vendorId?: string,
    type?: string,
    category?: string,
    status?: string,
    page = 1,
    limit = 20,
  ) {
    const offset = (page - 1) * limit;
    const result = await this.repo.searchProducts({
      query,
      vendorId,
      type,
      category,
      status,
      offset,
      limit,
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
    const vendor = await this.repo.findVendorById(dto.vendorId);
    if (!vendor) throw new NotFoundException('Vendor not found');

    if (dto.sku) {
      const duplicate = await this.repo.findProductBySku(dto.sku);
      if (duplicate) throw new ConflictException('Product SKU already exists');
    }

    const entity = ProductEntity.create({
      vendorId: dto.vendorId,
      type: dto.type,
      category: dto.category,
      specifications: dto.specifications,
      sku: dto.sku,
      price: dto.price,
      currency: dto.currency,
      translations: dto.translations,
      images: dto.images,
    });
    await this.repo.saveProduct(entity);
    return entity;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductEntity> {
    const entity = await this.findById(id);
    const { translations, images, ...attributes } = dto;

    entity.update(attributes);
    // ارسال آرایه ترجمه‌ها یعنی «جایگزینی کامل مجموعه ترجمه‌ها»
    if (translations !== undefined) entity.replaceTranslations(translations);
    // ارسال آرایه تصاویر یعنی «جایگزینی کامل آلبوم»
    if (images !== undefined) entity.replaceImages(images);

    await this.repo.saveProduct(entity);
    return entity;
  }

  // ── Images / gallery (آلبوم تصاویر) ──────────────────────────────────────

  async listImages(productId: string): Promise<ProductImage[]> {
    const entity = await this.findById(productId);
    return entity.images;
  }

  async addImage(productId: string, dto: CreateProductImageDto): Promise<ProductImage> {
    const entity = await this.findById(productId);
    const image = entity.addImage(dto);

    // چون افزودن ممکن است ترتیب و تصویر شاخص را جابه‌جا کند، کل آلبوم ذخیره می‌شود
    await this.repo.saveProductImages(entity.id, entity.images);
    return entity.findImage(image.id)!;
  }

  async updateImage(
    productId: string,
    imageId: string,
    dto: UpdateProductImageDto,
  ): Promise<ProductImage> {
    const entity = await this.findById(productId);
    const image = entity.updateImage(imageId, dto);

    await this.repo.saveProductImages(entity.id, entity.images);
    return image;
  }

  async removeImage(productId: string, imageId: string): Promise<void> {
    const entity = await this.findById(productId);
    entity.removeImage(imageId);

    await this.repo.saveProductImages(entity.id, entity.images);
  }

  async setPrimaryImage(productId: string, imageId: string): Promise<ProductImage> {
    const entity = await this.findById(productId);
    const image = entity.setPrimaryImage(imageId);

    await this.repo.saveProductImages(entity.id, entity.images);
    return image;
  }

  async reorderImages(productId: string, imageIds: string[]): Promise<ProductImage[]> {
    const entity = await this.findById(productId);
    const images = entity.reorderImages(imageIds);

    await this.repo.saveProductImages(entity.id, images);
    return images;
  }

  // ── Translations (fa / en) ───────────────────────────────────────────────

  async listTranslations(productId: string): Promise<ProductTranslation[]> {
    const entity = await this.findById(productId);
    return entity.translations;
  }

  async getTranslation(productId: string, locale: string): Promise<ProductTranslation> {
    const normalized = ProductTranslation.normalizeLocale(locale);
    const entity = await this.findById(productId);

    const translation = entity.findTranslation(normalized);
    if (!translation) {
      throw new NotFoundException(`Translation "${normalized}" not found for this product`);
    }
    return translation;
  }

  async upsertTranslation(
    productId: string,
    locale: string,
    dto: UpsertProductTranslationDto,
  ): Promise<ProductTranslation> {
    const entity = await this.findById(productId);
    const translation = entity.upsertTranslation({
      locale,
      title: dto.title,
      description: dto.description,
    });

    await this.repo.upsertProductTranslation(entity.id, translation);
    return translation;
  }

  async removeTranslation(productId: string, locale: string): Promise<void> {
    const normalized = ProductTranslation.normalizeLocale(locale);
    const entity = await this.findById(productId);

    if (!entity.removeTranslation(normalized)) {
      throw new NotFoundException(`Translation "${normalized}" not found for this product`);
    }
    await this.repo.deleteProductTranslation(entity.id, normalized);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findById(id);
    entity.softDelete();
    await this.repo.saveProduct(entity);
  }

  async suggest(calculationType: string, resultParams: Record<string, any>, page = 1, limit = 10) {
    const category = calcCategory(calculationType);
    if (!category) {
      return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
    }

    const offset = (page - 1) * limit;
    const result = await this.repo.suggestProducts({
      category,
      specs: resultParams,
      offset,
      limit,
    });
    return {
      data: result.data,
      meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
    };
  }
}
