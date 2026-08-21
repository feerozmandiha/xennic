import { Test } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service.js';
import { ProductEntity } from '../../domain/entities/product.entity.js';
import { VendorEntity } from '../../domain/entities/vendor.entity.js';

function makeVendor(): VendorEntity {
  return VendorEntity.reconstitute({
    id: 'vendor-1',
    name: 'Siemens',
    slug: 'siemens',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeProduct(overrides: Record<string, any> = {}): ProductEntity {
  return ProductEntity.reconstitute({
    id: 'prod-1',
    vendorId: 'vendor-1',
    type: 'physical',
    category: 'cable',
    specifications: { cable_size_mm2: 35 },
    sku: 'CABLE-35',
    price: 250,
    currency: 'USD',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  });
}

describe('ProductService', () => {
  let service: ProductService;

  const repo = {
    findVendorById: jest.fn(),
    findProductById: jest.fn(),
    findProductBySku: jest.fn(),
    searchProducts: jest.fn(),
    suggestProducts: jest.fn(),
    saveProduct: jest.fn(),
    upsertProductTranslation: jest.fn(),
    deleteProductTranslation: jest.fn(),
    findProductTranslations: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ProductService, { provide: 'IMarketplaceRepository', useValue: repo }],
    }).compile();

    service = module.get(ProductService);
    jest.clearAllMocks();
    repo.findVendorById.mockResolvedValue(makeVendor());
    repo.findProductBySku.mockResolvedValue(null);
  });

  // ── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('persists a product together with its fa/en translations', async () => {
      const product = await service.create({
        vendorId: 'vendor-1',
        type: 'physical',
        price: 250,
        sku: 'CABLE-35',
        specifications: { cable_size_mm2: 35 },
        translations: [
          { locale: 'en', title: 'Copper cable 35' },
          { locale: 'fa', title: 'کابل مسی ۳۵', description: 'عایق XLPE' },
        ],
      });

      expect(product.locales).toEqual(['fa', 'en']);
      expect(product.titleFor('en')).toBe('Copper cable 35');
      expect(repo.saveProduct).toHaveBeenCalledWith(product);
    });

    it('creates a product without translations', async () => {
      const product = await service.create({ vendorId: 'vendor-1', type: 'digital', price: 10 });

      expect(product.translations).toEqual([]);
      expect(repo.saveProduct).toHaveBeenCalledTimes(1);
    });

    it('rejects an unknown vendor', async () => {
      repo.findVendorById.mockResolvedValue(null);

      await expect(
        service.create({ vendorId: 'ghost', type: 'physical', price: 1 }),
      ).rejects.toThrow(NotFoundException);
      expect(repo.saveProduct).not.toHaveBeenCalled();
    });

    it('rejects a duplicate SKU', async () => {
      repo.findProductBySku.mockResolvedValue(makeProduct());

      await expect(
        service.create({ vendorId: 'vendor-1', type: 'physical', price: 1, sku: 'CABLE-35' }),
      ).rejects.toThrow(ConflictException);
      expect(repo.saveProduct).not.toHaveBeenCalled();
    });

    it('rejects an unsupported translation locale', async () => {
      await expect(
        service.create({
          vendorId: 'vendor-1',
          type: 'physical',
          price: 1,
          translations: [{ locale: 'de', title: 'Kabel' }],
        }),
      ).rejects.toThrow(BadRequestException);
      expect(repo.saveProduct).not.toHaveBeenCalled();
    });
  });

  // ── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates plain attributes without touching translations', async () => {
      repo.findProductById.mockResolvedValue(
        makeProduct({ translations: [{ locale: 'fa', title: 'کابل' }] }),
      );

      const product = await service.update('prod-1', { price: 300, status: 'inactive' });

      expect(product.price).toBe(300);
      expect(product.status).toBe('inactive');
      expect(product.locales).toEqual(['fa']);
    });

    it('replaces the whole translation set when `translations` is sent', async () => {
      repo.findProductById.mockResolvedValue(
        makeProduct({ translations: [{ locale: 'fa', title: 'کابل' }] }),
      );

      const product = await service.update('prod-1', {
        translations: [{ locale: 'en', title: 'Cable' }],
      });

      expect(product.locales).toEqual(['en']);
      expect(repo.saveProduct).toHaveBeenCalledWith(product);
    });

    it('clears translations when an empty array is sent', async () => {
      repo.findProductById.mockResolvedValue(
        makeProduct({ translations: [{ locale: 'fa', title: 'کابل' }] }),
      );

      const product = await service.update('prod-1', { translations: [] });

      expect(product.translations).toEqual([]);
    });

    it('does not send `translations` down to the entity attribute update', async () => {
      const entity = makeProduct();
      const updateSpy = jest.spyOn(entity, 'update');
      repo.findProductById.mockResolvedValue(entity);

      await service.update('prod-1', { price: 1, translations: [{ locale: 'fa', title: 'ک' }] });

      expect(updateSpy).toHaveBeenCalledWith({ price: 1 });
    });

    it('throws when the product does not exist', async () => {
      repo.findProductById.mockResolvedValue(null);

      await expect(service.update('missing', { price: 1 })).rejects.toThrow(NotFoundException);
    });

    it('throws for a soft-deleted product', async () => {
      repo.findProductById.mockResolvedValue(makeProduct({ deletedAt: new Date() }));

      await expect(service.update('prod-1', { price: 1 })).rejects.toThrow(NotFoundException);
    });
  });

  // ── translations ─────────────────────────────────────────────────────────

  describe('listTranslations', () => {
    it('returns every translation of the product', async () => {
      repo.findProductById.mockResolvedValue(
        makeProduct({
          translations: [
            { locale: 'en', title: 'Cable' },
            { locale: 'fa', title: 'کابل' },
          ],
        }),
      );

      const list = await service.listTranslations('prod-1');

      expect(list.map((t) => t.locale)).toEqual(['fa', 'en']);
    });
  });

  describe('getTranslation', () => {
    it('returns the exact locale', async () => {
      repo.findProductById.mockResolvedValue(
        makeProduct({ translations: [{ locale: 'en', title: 'Cable' }] }),
      );

      const translation = await service.getTranslation('prod-1', 'en-US');

      expect(translation.title).toBe('Cable');
    });

    it('does not fall back to another locale', async () => {
      repo.findProductById.mockResolvedValue(
        makeProduct({ translations: [{ locale: 'fa', title: 'کابل' }] }),
      );

      await expect(service.getTranslation('prod-1', 'en')).rejects.toThrow(NotFoundException);
    });

    it('rejects an unsupported locale before hitting the repository', async () => {
      await expect(service.getTranslation('prod-1', 'de')).rejects.toThrow(BadRequestException);
      expect(repo.findProductById).not.toHaveBeenCalled();
    });
  });

  describe('upsertTranslation', () => {
    it('creates a missing translation and persists only that locale', async () => {
      repo.findProductById.mockResolvedValue(makeProduct());

      const translation = await service.upsertTranslation('prod-1', 'fa-IR', {
        title: 'کابل مسی',
        description: 'عایق XLPE',
      });

      expect(translation.locale).toBe('fa');
      expect(repo.upsertProductTranslation).toHaveBeenCalledWith('prod-1', translation);
      expect(repo.saveProduct).not.toHaveBeenCalled();
    });

    it('overwrites an existing translation', async () => {
      repo.findProductById.mockResolvedValue(
        makeProduct({ translations: [{ locale: 'fa', title: 'قدیمی' }] }),
      );

      const translation = await service.upsertTranslation('prod-1', 'fa', { title: 'جدید' });

      expect(translation.title).toBe('جدید');
      expect(repo.upsertProductTranslation).toHaveBeenCalledTimes(1);
    });

    it('rejects an unsupported locale', async () => {
      repo.findProductById.mockResolvedValue(makeProduct());

      await expect(service.upsertTranslation('prod-1', 'de', { title: 'Kabel' })).rejects.toThrow(
        BadRequestException,
      );
      expect(repo.upsertProductTranslation).not.toHaveBeenCalled();
    });

    it('rejects a blank title', async () => {
      repo.findProductById.mockResolvedValue(makeProduct());

      await expect(service.upsertTranslation('prod-1', 'fa', { title: '   ' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws when the product is missing', async () => {
      repo.findProductById.mockResolvedValue(null);

      await expect(service.upsertTranslation('nope', 'fa', { title: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeTranslation', () => {
    it('deletes the translation of a locale', async () => {
      repo.findProductById.mockResolvedValue(
        makeProduct({
          translations: [
            { locale: 'fa', title: 'کابل' },
            { locale: 'en', title: 'Cable' },
          ],
        }),
      );

      await service.removeTranslation('prod-1', 'en-US');

      expect(repo.deleteProductTranslation).toHaveBeenCalledWith('prod-1', 'en');
    });

    it('throws when the locale has no translation', async () => {
      repo.findProductById.mockResolvedValue(
        makeProduct({ translations: [{ locale: 'fa', title: 'کابل' }] }),
      );

      await expect(service.removeTranslation('prod-1', 'en')).rejects.toThrow(NotFoundException);
      expect(repo.deleteProductTranslation).not.toHaveBeenCalled();
    });

    it('rejects an unsupported locale', async () => {
      await expect(service.removeTranslation('prod-1', 'de')).rejects.toThrow(BadRequestException);
    });
  });

  // ── read paths (unchanged behaviour) ─────────────────────────────────────

  describe('findAll', () => {
    it('maps pagination to repository offsets', async () => {
      repo.searchProducts.mockResolvedValue({ data: [], total: 42 });

      const result = await service.findAll(
        'cable',
        'vendor-1',
        undefined,
        'cable',
        'active',
        3,
        10,
      );

      expect(repo.searchProducts).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'cable', offset: 20, limit: 10 }),
      );
      expect(result.meta).toEqual({ page: 3, limit: 10, total: 42, totalPages: 5 });
    });
  });

  describe('remove', () => {
    it('soft-deletes through the entity', async () => {
      const entity = makeProduct();
      repo.findProductById.mockResolvedValue(entity);

      await service.remove('prod-1');

      expect(entity.status).toBe('archived');
      expect(repo.saveProduct).toHaveBeenCalledWith(entity);
    });
  });
});
