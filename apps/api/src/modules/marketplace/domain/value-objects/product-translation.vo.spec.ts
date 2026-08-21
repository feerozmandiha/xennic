import { BadRequestException } from '@nestjs/common';
import {
  DEFAULT_PRODUCT_LOCALE,
  ProductTranslation,
  SUPPORTED_PRODUCT_LOCALES,
} from './product-translation.vo.js';

describe('ProductTranslation (value object)', () => {
  describe('normalizeLocale', () => {
    it.each([
      ['fa', 'fa'],
      ['FA', 'fa'],
      ['fa-IR', 'fa'],
      ['fa_IR', 'fa'],
      ['  en  ', 'en'],
      ['en-US', 'en'],
    ])('normalizes %s → %s', (input, expected) => {
      expect(ProductTranslation.normalizeLocale(input)).toBe(expected);
    });

    it.each(['', '   ', null, undefined])('rejects the empty locale %p', (input) => {
      expect(() => ProductTranslation.normalizeLocale(input as any)).toThrow(BadRequestException);
    });

    it.each(['de', 'ar', 'fr-FR', 'zz'])('rejects unsupported locale %s', (input) => {
      expect(() => ProductTranslation.normalizeLocale(input)).toThrow(/Unsupported product locale/);
    });

    it('exposes exactly fa and en as supported locales', () => {
      expect([...SUPPORTED_PRODUCT_LOCALES]).toEqual(['fa', 'en']);
      expect(DEFAULT_PRODUCT_LOCALE).toBe('fa');
    });
  });

  describe('isSupportedLocale / resolveReadLocale', () => {
    it('reports support without throwing', () => {
      expect(ProductTranslation.isSupportedLocale('en-GB')).toBe(true);
      expect(ProductTranslation.isSupportedLocale('de')).toBe(false);
      expect(ProductTranslation.isSupportedLocale(undefined)).toBe(false);
    });

    it('degrades unsupported read locales to the default instead of failing', () => {
      expect(ProductTranslation.resolveReadLocale('en')).toBe('en');
      expect(ProductTranslation.resolveReadLocale('de')).toBe('fa');
      expect(ProductTranslation.resolveReadLocale(undefined)).toBe('fa');
    });
  });

  describe('create', () => {
    it('trims title and description and normalizes the locale', () => {
      const t = ProductTranslation.create({
        locale: 'FA-ir',
        title: '  کابل مسی  ',
        description: '  عایق XLPE  ',
      });

      expect(t.locale).toBe('fa');
      expect(t.title).toBe('کابل مسی');
      expect(t.description).toBe('عایق XLPE');
    });

    it('turns a blank description into null', () => {
      const t = ProductTranslation.create({ locale: 'en', title: 'Cable', description: '   ' });
      expect(t.description).toBeNull();

      const withoutDescription = ProductTranslation.create({ locale: 'en', title: 'Cable' });
      expect(withoutDescription.description).toBeNull();
    });

    it('requires a non-empty title', () => {
      expect(() => ProductTranslation.create({ locale: 'fa', title: '   ' })).toThrow(
        BadRequestException,
      );
    });

    it('enforces the title length limit', () => {
      expect(() => ProductTranslation.create({ locale: 'fa', title: 'x'.repeat(201) })).toThrow(
        /exceeds 200 characters/,
      );
    });

    it('enforces the description length limit', () => {
      expect(() =>
        ProductTranslation.create({ locale: 'fa', title: 'ok', description: 'x'.repeat(4001) }),
      ).toThrow(/exceeds 4000 characters/);
    });
  });

  describe('collection', () => {
    it('sorts by the fallback chain (fa before en)', () => {
      const list = ProductTranslation.collection([
        { locale: 'en', title: 'Cable' },
        { locale: 'fa', title: 'کابل' },
      ]);

      expect(list.map((t) => t.locale)).toEqual(['fa', 'en']);
    });

    it('de-duplicates a repeated locale, last one wins', () => {
      const list = ProductTranslation.collection([
        { locale: 'fa', title: 'اول' },
        { locale: 'fa-IR', title: 'دوم' },
      ]);

      expect(list).toHaveLength(1);
      expect(list[0].title).toBe('دوم');
    });

    it('returns an empty array for null/empty input', () => {
      expect(ProductTranslation.collection(null)).toEqual([]);
      expect(ProductTranslation.collection([])).toEqual([]);
    });

    it('propagates validation errors (strict path)', () => {
      expect(() => ProductTranslation.collection([{ locale: 'de', title: 'X' }])).toThrow(
        BadRequestException,
      );
    });
  });

  describe('fromPersistence', () => {
    it('skips malformed rows instead of throwing', () => {
      const list = ProductTranslation.fromPersistence([
        { locale: 'de', title: 'Kabel' },
        { locale: 'fa', title: '' },
        { locale: 'en', title: 'Cable' },
      ]);

      expect(list.map((t) => t.locale)).toEqual(['en']);
    });

    it('returns an empty array for null input', () => {
      expect(ProductTranslation.fromPersistence(undefined)).toEqual([]);
    });
  });

  describe('equals / toJSON', () => {
    it('compares by value', () => {
      const a = ProductTranslation.create({ locale: 'fa', title: 'کابل', description: 'x' });
      const b = ProductTranslation.create({ locale: 'fa-IR', title: 'کابل', description: 'x' });
      const c = ProductTranslation.create({ locale: 'fa', title: 'کابل دیگر' });

      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
      expect(a.equals(null)).toBe(false);
    });

    it('serializes to a plain object', () => {
      const t = ProductTranslation.create({ locale: 'en', title: 'Cable', description: 'XLPE' });
      expect(t.toJSON()).toEqual({ locale: 'en', title: 'Cable', description: 'XLPE' });
    });
  });
});
