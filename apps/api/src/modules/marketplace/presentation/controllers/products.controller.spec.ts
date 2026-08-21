import { Test } from '@nestjs/testing';
import { ProductsController } from './products.controller.js';
import { ProductService } from '../../application/services/product.service.js';
import { ProductEntity } from '../../domain/entities/product.entity.js';
import { ProductTranslation } from '../../domain/value-objects/product-translation.vo.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';

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
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    deletedAt: null,
    translations: [
      { locale: 'fa', title: 'کابل مسی ۳۵', description: 'عایق XLPE' },
      { locale: 'en', title: 'Copper cable 35', description: 'XLPE insulated' },
    ],
    ...overrides,
  });
}

describe('ProductsController', () => {
  let controller: ProductsController;

  const service = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    suggest: jest.fn(),
    listTranslations: jest.fn(),
    getTranslation: jest.fn(),
    upsertTranslation: jest.fn(),
    removeTranslation: jest.fn(),
    listImages: jest.fn(),
    addImage: jest.fn(),
    updateImage: jest.fn(),
    removeImage: jest.fn(),
    setPrimaryImage: jest.fn(),
    reorderImages: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(ProductsController);
    jest.clearAllMocks();
  });

  describe('serialization', () => {
    it('returns a flat payload instead of the entity private fields', async () => {
      service.findById.mockResolvedValue(makeProduct());

      const result = await controller.findById('prod-1');

      expect(result).toEqual(
        expect.objectContaining({
          id: 'prod-1',
          vendorId: 'vendor-1',
          sku: 'CABLE-35',
          price: 250,
          currency: 'USD',
          status: 'active',
        }),
      );
      expect(Object.keys(result).some((k) => k.startsWith('_'))).toBe(false);
    });

    it('resolves the title for the requested locale', async () => {
      service.findById.mockResolvedValue(makeProduct());

      const fa = await controller.findById('prod-1');
      const en = await controller.findById('prod-1', 'en');

      expect(fa.title).toBe('کابل مسی ۳۵');
      expect(fa.resolvedLocale).toBe('fa');
      expect(en.title).toBe('Copper cable 35');
      expect(en.resolvedLocale).toBe('en');
    });

    it('always exposes the full translation list', async () => {
      service.findById.mockResolvedValue(makeProduct());

      const result = await controller.findById('prod-1');

      expect(result.translations).toEqual([
        { locale: 'fa', title: 'کابل مسی ۳۵', description: 'عایق XLPE' },
        { locale: 'en', title: 'Copper cable 35', description: 'XLPE insulated' },
      ]);
    });

    it('falls back to the SKU when the product has no translation', async () => {
      service.findById.mockResolvedValue(makeProduct({ translations: [] }));

      const result = await controller.findById('prod-1', 'en');

      expect(result.title).toBe('CABLE-35');
      expect(result.resolvedLocale).toBeNull();
      expect(result.translations).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('forwards filters and pagination and maps the list', async () => {
      service.findAll.mockResolvedValue({
        data: [makeProduct()],
        meta: { page: 2, limit: 10, total: 1, totalPages: 1 },
      });

      const result = await controller.findAll(
        'cable',
        'vendor-1',
        'physical',
        'cable',
        'active',
        '2',
        '10',
        'en',
      );

      expect(service.findAll).toHaveBeenCalledWith(
        'cable',
        'vendor-1',
        'physical',
        'cable',
        'active',
        2,
        10,
      );
      expect(result.data[0].title).toBe('Copper cable 35');
      expect(result.meta).toEqual({ page: 2, limit: 10, total: 1, totalPages: 1 });
    });

    it('defaults pagination and locale', async () => {
      service.findAll.mockResolvedValue({ data: [makeProduct()], meta: {} });

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        1,
        20,
      );
      expect(result.data[0].resolvedLocale).toBe('fa');
    });
  });

  describe('mutations', () => {
    it('creates a product with translations', async () => {
      service.create.mockResolvedValue(makeProduct());

      const dto = {
        vendorId: 'vendor-1',
        type: 'physical',
        price: 250,
        translations: [{ locale: 'fa', title: 'کابل مسی ۳۵' }],
      };
      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result.id).toBe('prod-1');
    });

    it('updates a product', async () => {
      service.update.mockResolvedValue(makeProduct({ price: 300 }));

      const result = await controller.update('prod-1', { price: 300 } as any);

      expect(service.update).toHaveBeenCalledWith('prod-1', { price: 300 });
      expect(result.price).toBe(300);
    });

    it('soft-deletes a product', async () => {
      service.remove.mockResolvedValue(undefined);

      await expect(controller.remove('prod-1')).resolves.toEqual({ success: true });
      expect(service.remove).toHaveBeenCalledWith('prod-1');
    });
  });

  describe('translation endpoints', () => {
    it('lists translations as plain objects', async () => {
      service.listTranslations.mockResolvedValue([
        ProductTranslation.create({ locale: 'fa', title: 'کابل' }),
        ProductTranslation.create({ locale: 'en', title: 'Cable' }),
      ]);

      const result = await controller.listTranslations('prod-1');

      expect(result).toEqual([
        { locale: 'fa', title: 'کابل', description: null },
        { locale: 'en', title: 'Cable', description: null },
      ]);
    });

    it('gets one translation', async () => {
      service.getTranslation.mockResolvedValue(
        ProductTranslation.create({ locale: 'en', title: 'Cable' }),
      );

      const result = await controller.getTranslation('prod-1', 'en');

      expect(service.getTranslation).toHaveBeenCalledWith('prod-1', 'en');
      expect(result).toEqual({ locale: 'en', title: 'Cable', description: null });
    });

    it('upserts a translation from the path locale', async () => {
      service.upsertTranslation.mockResolvedValue(
        ProductTranslation.create({ locale: 'fa', title: 'کابل', description: 'شرح' }),
      );

      const result = await controller.upsertTranslation('prod-1', 'fa', {
        title: 'کابل',
        description: 'شرح',
      });

      expect(service.upsertTranslation).toHaveBeenCalledWith('prod-1', 'fa', {
        title: 'کابل',
        description: 'شرح',
      });
      expect(result).toEqual({ locale: 'fa', title: 'کابل', description: 'شرح' });
    });

    it('deletes a translation', async () => {
      service.removeTranslation.mockResolvedValue(undefined);

      await expect(controller.removeTranslation('prod-1', 'en')).resolves.toEqual({
        success: true,
      });
      expect(service.removeTranslation).toHaveBeenCalledWith('prod-1', 'en');
    });
  });

  describe('suggest', () => {
    it('parses the encoded result params', async () => {
      service.suggest.mockResolvedValue({ data: [makeProduct()], meta: {} });

      await controller.suggest(
        'CABLE-001',
        encodeURIComponent(JSON.stringify({ recommended_cable_size: 35 })),
      );

      expect(service.suggest).toHaveBeenCalledWith(
        'CABLE-001',
        { recommended_cable_size: 35 },
        1,
        10,
      );
    });
  });

  describe('images / album', () => {
    function makeProductWithImages() {
      return makeProduct({
        images: [
          { id: 'img-1', url: 'https://cdn/a.jpg', altFa: 'الف', mimeType: 'image/jpeg' },
          { id: 'img-2', url: 'https://cdn/b.jpg' },
        ],
      });
    }

    it('exposes images and primaryImageUrl on the product payload', async () => {
      service.findById.mockResolvedValue(makeProductWithImages());

      const result: any = await controller.findById('prod-1');

      expect(result.primaryImageUrl).toBe('https://cdn/a.jpg');
      expect(result.images).toHaveLength(2);
      expect(result.images[0]).toEqual({
        id: 'img-1',
        url: 'https://cdn/a.jpg',
        altFa: 'الف',
        altEn: null,
        isPrimary: true,
        sortOrder: 0,
        mimeType: 'image/jpeg',
        fileSize: null,
      });
    });

    it('reports a null primaryImageUrl and an empty album for a product with no image', async () => {
      service.findById.mockResolvedValue(makeProduct());

      const result: any = await controller.findById('prod-1');

      expect(result.primaryImageUrl).toBeNull();
      expect(result.images).toEqual([]);
    });

    it('GET :id/images returns the serialized album', async () => {
      service.listImages.mockResolvedValue(makeProductWithImages().images);

      const result = await controller.listImages('prod-1');

      expect(service.listImages).toHaveBeenCalledWith('prod-1');
      expect(result.map((i: any) => i.id)).toEqual(['img-1', 'img-2']);
    });

    it('POST :id/images forwards the dto and serializes the new image', async () => {
      const product = makeProductWithImages();
      service.addImage.mockResolvedValue(product.findImage('img-2'));

      const dto = { url: 'https://cdn/b.jpg' } as any;
      const result: any = await controller.addImage('prod-1', dto);

      expect(service.addImage).toHaveBeenCalledWith('prod-1', dto);
      expect(result.url).toBe('https://cdn/b.jpg');
    });

    it('PATCH :id/images/:imageId forwards both params', async () => {
      const product = makeProductWithImages();
      service.updateImage.mockResolvedValue(product.findImage('img-1'));

      const dto = { altEn: 'Cable' } as any;
      await controller.updateImage('prod-1', 'img-1', dto);

      expect(service.updateImage).toHaveBeenCalledWith('prod-1', 'img-1', dto);
    });

    it('DELETE :id/images/:imageId reports success', async () => {
      service.removeImage.mockResolvedValue(undefined);

      await expect(controller.removeImage('prod-1', 'img-1')).resolves.toEqual({ success: true });
      expect(service.removeImage).toHaveBeenCalledWith('prod-1', 'img-1');
    });

    it('PUT :id/images/:imageId/primary sets the cover image', async () => {
      const product = makeProductWithImages();
      service.setPrimaryImage.mockResolvedValue(product.setPrimaryImage('img-2'));

      const result: any = await controller.setPrimaryImage('prod-1', 'img-2');

      expect(service.setPrimaryImage).toHaveBeenCalledWith('prod-1', 'img-2');
      expect(result.isPrimary).toBe(true);
      expect(result.id).toBe('img-2');
    });

    it('PUT :id/images/order forwards the id list', async () => {
      const product = makeProductWithImages();
      service.reorderImages.mockResolvedValue(product.reorderImages(['img-2', 'img-1']));

      const result = await controller.reorderImages('prod-1', { imageIds: ['img-2', 'img-1'] });

      expect(service.reorderImages).toHaveBeenCalledWith('prod-1', ['img-2', 'img-1']);
      expect(result.map((i: any) => i.id)).toEqual(['img-2', 'img-1']);
    });
  });
});
