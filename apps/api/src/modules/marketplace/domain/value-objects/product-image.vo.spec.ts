import { BadRequestException } from '@nestjs/common';
import { ProductImage, SUPPORTED_IMAGE_MIME_TYPES } from './product-image.vo.js';

describe('ProductImage', () => {
  describe('url normalization', () => {
    it('accepts absolute http(s) urls', () => {
      expect(ProductImage.normalizeUrl('https://cdn.example.com/a.jpg')).toBe(
        'https://cdn.example.com/a.jpg',
      );
      expect(ProductImage.normalizeUrl('http://cdn.example.com/a.jpg')).toBe(
        'http://cdn.example.com/a.jpg',
      );
    });

    it('accepts root-relative storage paths', () => {
      expect(ProductImage.normalizeUrl('/api/v1/storage/files/abc/download')).toBe(
        '/api/v1/storage/files/abc/download',
      );
    });

    it('trims surrounding whitespace', () => {
      expect(ProductImage.normalizeUrl('  https://cdn/a.jpg  ')).toBe('https://cdn/a.jpg');
    });

    it('rejects an empty url', () => {
      expect(() => ProductImage.normalizeUrl('   ')).toThrow(BadRequestException);
    });

    it('rejects protocol-relative and non-http schemes', () => {
      expect(() => ProductImage.normalizeUrl('//cdn/a.jpg')).toThrow(BadRequestException);
      expect(() => ProductImage.normalizeUrl('ftp://cdn/a.jpg')).toThrow(BadRequestException);
      expect(() => ProductImage.normalizeUrl('javascript:alert(1)')).toThrow(BadRequestException);
      expect(() => ProductImage.normalizeUrl('cdn/a.jpg')).toThrow(BadRequestException);
    });

    it('rejects urls longer than 2048 characters', () => {
      const long = `https://cdn/${'a'.repeat(2048)}.jpg`;
      expect(() => ProductImage.normalizeUrl(long)).toThrow(/2048/);
    });
  });

  describe('mime type normalization', () => {
    it.each(SUPPORTED_IMAGE_MIME_TYPES)('accepts %s', (mime) => {
      expect(ProductImage.normalizeMimeType(mime.toUpperCase())).toBe(mime);
    });

    it('treats an empty mime type as unknown', () => {
      expect(ProductImage.normalizeMimeType('')).toBeNull();
      expect(ProductImage.normalizeMimeType(null)).toBeNull();
      expect(ProductImage.normalizeMimeType(undefined)).toBeNull();
    });

    it('rejects non-image mime types', () => {
      expect(() => ProductImage.normalizeMimeType('application/pdf')).toThrow(BadRequestException);
      expect(() => ProductImage.normalizeMimeType('video/mp4')).toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('applies defaults and generates an id', () => {
      const image = ProductImage.create({ url: 'https://cdn/a.jpg' });

      expect(image.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(image.isPrimary).toBe(false);
      expect(image.sortOrder).toBe(0);
      expect(image.altFa).toBeNull();
      expect(image.altEn).toBeNull();
      expect(image.mimeType).toBeNull();
      expect(image.fileSize).toBeNull();
    });

    it('keeps a provided id', () => {
      expect(ProductImage.create({ id: 'img-1', url: 'https://cdn/a.jpg' }).id).toBe('img-1');
    });

    it('normalizes blank alt texts to null', () => {
      const image = ProductImage.create({ url: 'https://cdn/a.jpg', altFa: '  ', altEn: ' hi ' });
      expect(image.altFa).toBeNull();
      expect(image.altEn).toBe('hi');
    });

    it('rejects an alt text longer than 300 characters', () => {
      expect(() =>
        ProductImage.create({ url: 'https://cdn/a.jpg', altFa: 'x'.repeat(301) }),
      ).toThrow(/300/);
    });

    it('rejects a negative or fractional sortOrder', () => {
      expect(() => ProductImage.create({ url: 'https://cdn/a.jpg', sortOrder: -1 })).toThrow(
        BadRequestException,
      );
      expect(() => ProductImage.create({ url: 'https://cdn/a.jpg', sortOrder: 1.5 })).toThrow(
        BadRequestException,
      );
    });

    it('rejects a negative fileSize', () => {
      expect(() => ProductImage.create({ url: 'https://cdn/a.jpg', fileSize: -1 })).toThrow(
        BadRequestException,
      );
    });
  });

  describe('with', () => {
    const base = ProductImage.create({
      id: 'img-1',
      url: 'https://cdn/a.jpg',
      altFa: 'الف',
      sortOrder: 2,
      mimeType: 'image/png',
    });

    it('returns a new instance and keeps the id', () => {
      const next = base.with({ sortOrder: 5 });

      expect(next).not.toBe(base);
      expect(next.id).toBe('img-1');
      expect(next.sortOrder).toBe(5);
      expect(base.sortOrder).toBe(2);
    });

    it('keeps untouched fields', () => {
      const next = base.with({ isPrimary: true });
      expect(next.url).toBe('https://cdn/a.jpg');
      expect(next.altFa).toBe('الف');
      expect(next.mimeType).toBe('image/png');
    });

    it('can explicitly clear a nullable field', () => {
      expect(base.with({ altFa: null }).altFa).toBeNull();
    });
  });

  describe('altFor', () => {
    it('returns the locale alt when present', () => {
      const image = ProductImage.create({ url: 'https://cdn/a.jpg', altFa: 'الف', altEn: 'A' });
      expect(image.altFor('fa')).toBe('الف');
      expect(image.altFor('en')).toBe('A');
    });

    it('falls back to the other locale', () => {
      const faOnly = ProductImage.create({ url: 'https://cdn/a.jpg', altFa: 'الف' });
      expect(faOnly.altFor('en')).toBe('الف');

      const enOnly = ProductImage.create({ url: 'https://cdn/a.jpg', altEn: 'A' });
      expect(enOnly.altFor('fa')).toBe('A');
    });

    it('returns null when no alt text exists', () => {
      expect(ProductImage.create({ url: 'https://cdn/a.jpg' }).altFor('fa')).toBeNull();
    });
  });

  it('serializes every field to JSON', () => {
    const image = ProductImage.create({
      id: 'img-1',
      url: 'https://cdn/a.jpg',
      altFa: 'الف',
      altEn: 'A',
      isPrimary: true,
      sortOrder: 0,
      mimeType: 'image/webp',
      fileSize: 2048,
    });

    expect(image.toJSON()).toEqual({
      id: 'img-1',
      url: 'https://cdn/a.jpg',
      altFa: 'الف',
      altEn: 'A',
      isPrimary: true,
      sortOrder: 0,
      mimeType: 'image/webp',
      fileSize: 2048,
    });
  });
});
