import { BadRequestException } from '@nestjs/common';
import { ProductEntity } from './product.entity.js';

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
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    deletedAt: null,
    ...overrides,
  });
}

describe('ProductEntity — translations', () => {
  it('creates a product with normalized, sorted translations', () => {
    const product = ProductEntity.create({
      vendorId: 'vendor-1',
      type: 'physical',
      price: 100,
      translations: [
        { locale: 'en-US', title: 'Copper cable' },
        { locale: 'fa', title: 'کابل مسی', description: 'عایق XLPE' },
      ],
    });

    expect(product.locales).toEqual(['fa', 'en']);
    expect(product.translations[0].title).toBe('کابل مسی');
    expect(product.translations[1].locale).toBe('en');
  });

  it('creates a product with no translations when none are supplied', () => {
    const product = ProductEntity.create({ vendorId: 'v', type: 'digital', price: 10 });
    expect(product.translations).toEqual([]);
    expect(product.translationFor('fa')).toBeNull();
  });

  it('drops unsupported locales when hydrating from persistence', () => {
    const product = makeProduct({
      translations: [
        { locale: 'ar', title: 'كابل' },
        { locale: 'en', title: 'Cable' },
      ],
    });

    expect(product.locales).toEqual(['en']);
  });

  it('returns a defensive copy of the translation list', () => {
    const product = makeProduct({ translations: [{ locale: 'fa', title: 'کابل' }] });

    product.translations.pop();

    expect(product.translations).toHaveLength(1);
  });

  describe('translationFor (fallback chain)', () => {
    it('returns the exact locale when present', () => {
      const product = makeProduct({
        translations: [
          { locale: 'fa', title: 'کابل' },
          { locale: 'en', title: 'Cable' },
        ],
      });

      expect(product.translationFor('en')!.title).toBe('Cable');
      expect(product.translationFor('en-GB')!.title).toBe('Cable');
    });

    it('falls back to fa when the requested locale is missing', () => {
      const product = makeProduct({ translations: [{ locale: 'fa', title: 'کابل' }] });
      expect(product.translationFor('en')!.locale).toBe('fa');
    });

    it('falls back to en when fa is missing', () => {
      const product = makeProduct({ translations: [{ locale: 'en', title: 'Cable' }] });
      expect(product.translationFor('fa')!.locale).toBe('en');
    });

    it('falls back to the default locale for an unsupported request', () => {
      const product = makeProduct({
        translations: [
          { locale: 'fa', title: 'کابل' },
          { locale: 'en', title: 'Cable' },
        ],
      });

      expect(product.translationFor('de')!.locale).toBe('fa');
      expect(product.translationFor(undefined)!.locale).toBe('fa');
    });

    it('returns null when the product has no translation at all', () => {
      expect(makeProduct().translationFor('fa')).toBeNull();
    });
  });

  describe('titleFor', () => {
    it('falls back to the SKU for untranslated products', () => {
      expect(makeProduct().titleFor('fa')).toBe('CABLE-35');
    });

    it('uses the localized title when available', () => {
      const product = makeProduct({ translations: [{ locale: 'en', title: 'Cable' }] });
      expect(product.titleFor('en')).toBe('Cable');
    });
  });

  describe('findTranslation / hasTranslation', () => {
    it('matches exactly, without fallback', () => {
      const product = makeProduct({ translations: [{ locale: 'fa', title: 'کابل' }] });

      expect(product.findTranslation('fa-IR')!.title).toBe('کابل');
      expect(product.findTranslation('en')).toBeNull();
      expect(product.hasTranslation('fa')).toBe(true);
      expect(product.hasTranslation('en')).toBe(false);
    });

    it('rejects unsupported locales', () => {
      expect(() => makeProduct().findTranslation('de')).toThrow(BadRequestException);
    });
  });

  describe('upsertTranslation', () => {
    it('adds a new locale and keeps the list ordered', () => {
      const product = makeProduct({ translations: [{ locale: 'en', title: 'Cable' }] });

      product.upsertTranslation({ locale: 'fa', title: 'کابل' });

      expect(product.locales).toEqual(['fa', 'en']);
    });

    it('replaces the translation of an existing locale', () => {
      const product = makeProduct({ translations: [{ locale: 'fa', title: 'قدیمی' }] });

      const result = product.upsertTranslation({
        locale: 'fa-IR',
        title: 'جدید',
        description: 'توضیح',
      });

      expect(product.translations).toHaveLength(1);
      expect(result.title).toBe('جدید');
      expect(product.findTranslation('fa')!.description).toBe('توضیح');
    });

    it('bumps updatedAt', () => {
      const product = makeProduct();
      const before = product.updatedAt;

      product.upsertTranslation({ locale: 'fa', title: 'کابل' });

      expect(product.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(product.updatedAt).not.toBe(before);
    });

    it('validates the payload', () => {
      const product = makeProduct();
      expect(() => product.upsertTranslation({ locale: 'fa', title: '  ' })).toThrow(
        BadRequestException,
      );
      expect(() => product.upsertTranslation({ locale: 'de', title: 'Kabel' })).toThrow(
        BadRequestException,
      );
    });
  });

  describe('removeTranslation', () => {
    it('removes an existing locale and reports success', () => {
      const product = makeProduct({
        translations: [
          { locale: 'fa', title: 'کابل' },
          { locale: 'en', title: 'Cable' },
        ],
      });

      expect(product.removeTranslation('fa-IR')).toBe(true);
      expect(product.locales).toEqual(['en']);
    });

    it('reports false when the locale has no translation', () => {
      const product = makeProduct({ translations: [{ locale: 'fa', title: 'کابل' }] });
      expect(product.removeTranslation('en')).toBe(false);
      expect(product.locales).toEqual(['fa']);
    });

    it('rejects unsupported locales', () => {
      expect(() => makeProduct().removeTranslation('de')).toThrow(BadRequestException);
    });
  });

  describe('replaceTranslations', () => {
    it('swaps the whole set', () => {
      const product = makeProduct({ translations: [{ locale: 'fa', title: 'کابل' }] });

      product.replaceTranslations([{ locale: 'en', title: 'Cable' }]);

      expect(product.locales).toEqual(['en']);
    });

    it('clears the set when given an empty array', () => {
      const product = makeProduct({ translations: [{ locale: 'fa', title: 'کابل' }] });

      product.replaceTranslations([]);

      expect(product.translations).toEqual([]);
    });

    it('rejects an invalid entry without partially applying the change', () => {
      const product = makeProduct({ translations: [{ locale: 'fa', title: 'کابل' }] });

      expect(() =>
        product.replaceTranslations([
          { locale: 'en', title: 'Cable' },
          { locale: 'de', title: 'Kabel' },
        ]),
      ).toThrow(BadRequestException);
      expect(product.locales).toEqual(['fa']);
    });
  });

  it('keeps existing behaviour: softDelete archives the product', () => {
    const product = makeProduct({ translations: [{ locale: 'fa', title: 'کابل' }] });

    product.softDelete();

    expect(product.status).toBe('archived');
    expect(product.deletedAt).toBeInstanceOf(Date);
    expect(product.locales).toEqual(['fa']);
  });
});
