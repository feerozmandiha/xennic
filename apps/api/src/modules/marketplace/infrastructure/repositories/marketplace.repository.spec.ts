import { ProductEntity } from '../../domain/entities/product.entity.js';
import { ProductTranslation } from '../../domain/value-objects/product-translation.vo.js';

const prismaMock = {
  products: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    groupBy: jest.fn(),
  },
  product_translations: {
    findMany: jest.fn(),
    upsert: jest.fn(),
    deleteMany: jest.fn(),
  },
  vendors: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  },
};

jest.mock('@xennic/database', () => ({ prisma: prismaMock }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { MarketplaceRepository } = require('./marketplace.repository.js');

function productRow(overrides: Record<string, any> = {}) {
  return {
    id: 'prod-1',
    vendor_id: 'vendor-1',
    type: 'physical',
    category: 'cable',
    specifications: { cable_size_mm2: 35 },
    sku: 'CABLE-35',
    price: 250,
    currency: 'USD',
    status: 'active',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-02T00:00:00Z'),
    deleted_at: null,
    translations: [],
    ...overrides,
  };
}

describe('MarketplaceRepository — product translations', () => {
  let repo: any;

  beforeEach(() => {
    repo = new MarketplaceRepository();
    jest.clearAllMocks();
    prismaMock.product_translations.deleteMany.mockResolvedValue({ count: 0 });
  });

  describe('findProductById', () => {
    it('hydrates translations onto the entity', async () => {
      prismaMock.products.findUnique.mockResolvedValue(
        productRow({
          translations: [
            { locale: 'en', title: 'Cable', description: null },
            { locale: 'fa', title: 'کابل', description: 'عایق XLPE' },
          ],
        }),
      );

      const entity = await repo.findProductById('prod-1');

      expect(prismaMock.products.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        include: { translations: true },
      });
      expect(entity.locales).toEqual(['fa', 'en']);
      expect(entity.titleFor('fa')).toBe('کابل');
    });

    it('returns null when the row is missing', async () => {
      prismaMock.products.findUnique.mockResolvedValue(null);
      await expect(repo.findProductById('nope')).resolves.toBeNull();
    });
  });

  describe('searchProducts', () => {
    it('matches the query against SKU and translated title/description', async () => {
      prismaMock.products.findMany.mockResolvedValue([]);
      prismaMock.products.count.mockResolvedValue(0);

      await repo.searchProducts({ query: 'کابل', offset: 0, limit: 20 });

      const where = prismaMock.products.findMany.mock.calls[0][0].where;
      expect(where.OR).toEqual([
        { sku: { contains: 'کابل', mode: 'insensitive' } },
        { translations: { some: { title: { contains: 'کابل', mode: 'insensitive' } } } },
        { translations: { some: { description: { contains: 'کابل', mode: 'insensitive' } } } },
      ]);
      expect(prismaMock.products.findMany.mock.calls[0][0].include).toEqual({
        translations: true,
      });
    });
  });

  describe('saveProduct', () => {
    it('mirrors the entity translation set onto product_translations', async () => {
      prismaMock.products.upsert.mockResolvedValue({});
      prismaMock.product_translations.upsert.mockResolvedValue({});

      const entity = ProductEntity.reconstitute({
        ...productRow(),
        vendorId: 'vendor-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        translations: [
          { locale: 'fa', title: 'کابل' },
          { locale: 'en', title: 'Cable' },
        ],
      } as any);

      await repo.saveProduct(entity);

      expect(prismaMock.product_translations.deleteMany).toHaveBeenCalledWith({
        where: { product_id: 'prod-1', locale: { notIn: ['fa', 'en'] } },
      });
      expect(prismaMock.product_translations.upsert).toHaveBeenCalledTimes(2);
      expect(prismaMock.product_translations.upsert.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          where: { product_id_locale: { product_id: 'prod-1', locale: 'fa' } },
          update: { title: 'کابل', description: null },
        }),
      );
    });

    it('removes every translation row when the entity has none', async () => {
      prismaMock.products.upsert.mockResolvedValue({});

      const entity = ProductEntity.reconstitute({
        ...productRow(),
        vendorId: 'vendor-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        translations: [],
      } as any);

      await repo.saveProduct(entity);

      expect(prismaMock.product_translations.deleteMany).toHaveBeenCalledWith({
        where: { product_id: 'prod-1' },
      });
      expect(prismaMock.product_translations.upsert).not.toHaveBeenCalled();
    });
  });

  describe('upsertProductTranslation / deleteProductTranslation', () => {
    it('upserts a single locale', async () => {
      prismaMock.product_translations.upsert.mockResolvedValue({});
      const translation = ProductTranslation.create({
        locale: 'en',
        title: 'Cable',
        description: 'XLPE',
      });

      await repo.upsertProductTranslation('prod-1', translation);

      expect(prismaMock.product_translations.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { product_id_locale: { product_id: 'prod-1', locale: 'en' } },
          update: { title: 'Cable', description: 'XLPE' },
        }),
      );
    });

    it('reports whether a row was actually deleted', async () => {
      prismaMock.product_translations.deleteMany.mockResolvedValueOnce({ count: 1 });
      await expect(repo.deleteProductTranslation('prod-1', 'en')).resolves.toBe(true);

      prismaMock.product_translations.deleteMany.mockResolvedValueOnce({ count: 0 });
      await expect(repo.deleteProductTranslation('prod-1', 'en')).resolves.toBe(false);
    });
  });

  describe('findProductTranslations', () => {
    it('skips rows with unsupported locales', async () => {
      prismaMock.product_translations.findMany.mockResolvedValue([
        { locale: 'ar', title: 'كابل', description: null },
        { locale: 'fa', title: 'کابل', description: null },
      ]);

      const list = await repo.findProductTranslations('prod-1');

      expect(list.map((t: ProductTranslation) => t.locale)).toEqual(['fa']);
    });
  });

  describe('vendor deletion guard support', () => {
    it('counts only live products by default', async () => {
      prismaMock.products.count.mockResolvedValue(2);

      await repo.countVendorProducts('vendor-1');

      expect(prismaMock.products.count).toHaveBeenCalledWith({
        where: { vendor_id: 'vendor-1', deleted_at: null },
      });
    });

    it('counts soft-deleted products too when asked', async () => {
      prismaMock.products.count.mockResolvedValue(5);

      await repo.countVendorProducts('vendor-1', true);

      expect(prismaMock.products.count).toHaveBeenCalledWith({
        where: { vendor_id: 'vendor-1' },
      });
    });

    it('hard-deletes the vendor row', async () => {
      prismaMock.vendors.delete.mockResolvedValue({});

      await repo.deleteVendor('vendor-1');

      expect(prismaMock.vendors.delete).toHaveBeenCalledWith({ where: { id: 'vendor-1' } });
    });
  });
});
