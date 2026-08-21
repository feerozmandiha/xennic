import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import {
  CreateProductDto,
  CreateProductImageDto,
  ReorderProductImagesDto,
  UpdateProductImageDto,
} from './product.dto.js';
import { MAX_PRODUCT_IMAGES } from '../../domain/value-objects/product-gallery.vo.js';

function failedProperties(dto: object): string[] {
  return validateSync(dto, { whitelist: true, forbidNonWhitelisted: true }).map((e) => e.property);
}

describe('product image DTOs', () => {
  describe('CreateProductImageDto', () => {
    it('accepts a minimal payload', () => {
      const dto = plainToInstance(CreateProductImageDto, { url: 'https://cdn/a.jpg' });
      expect(failedProperties(dto)).toEqual([]);
    });

    it('accepts the full payload including an existing id', () => {
      const dto = plainToInstance(CreateProductImageDto, {
        id: 'img-1',
        url: '/api/v1/storage/files/abc/download',
        altFa: 'کابل',
        altEn: 'Cable',
        isPrimary: true,
        sortOrder: 2,
        mimeType: 'image/webp',
        fileSize: 1024,
      });
      expect(failedProperties(dto)).toEqual([]);
    });

    it('requires a url', () => {
      const dto = plainToInstance(CreateProductImageDto, {});
      expect(failedProperties(dto)).toContain('url');
    });

    it('rejects an unsupported mime type', () => {
      const dto = plainToInstance(CreateProductImageDto, {
        url: 'https://cdn/a.pdf',
        mimeType: 'application/pdf',
      });
      expect(failedProperties(dto)).toContain('mimeType');
    });

    it('rejects a negative sortOrder and fileSize', () => {
      const dto = plainToInstance(CreateProductImageDto, {
        url: 'https://cdn/a.jpg',
        sortOrder: -1,
        fileSize: -5,
      });
      expect(failedProperties(dto)).toEqual(expect.arrayContaining(['sortOrder', 'fileSize']));
    });

    it('rejects an alt text longer than 300 characters', () => {
      const dto = plainToInstance(CreateProductImageDto, {
        url: 'https://cdn/a.jpg',
        altFa: 'x'.repeat(301),
      });
      expect(failedProperties(dto)).toContain('altFa');
    });

    it('rejects unknown properties', () => {
      const dto = plainToInstance(CreateProductImageDto, {
        url: 'https://cdn/a.jpg',
        hacked: true,
      } as any);
      expect(failedProperties(dto)).toContain('hacked');
    });
  });

  describe('UpdateProductImageDto', () => {
    it('accepts an empty patch', () => {
      expect(failedProperties(plainToInstance(UpdateProductImageDto, {}))).toEqual([]);
    });

    it('accepts a partial patch', () => {
      const dto = plainToInstance(UpdateProductImageDto, { altEn: 'Cable', isPrimary: true });
      expect(failedProperties(dto)).toEqual([]);
    });

    it('rejects a non-boolean isPrimary', () => {
      const dto = plainToInstance(UpdateProductImageDto, { isPrimary: 'yes' } as any);
      expect(failedProperties(dto)).toContain('isPrimary');
    });
  });

  describe('ReorderProductImagesDto', () => {
    it('accepts a list of ids', () => {
      const dto = plainToInstance(ReorderProductImagesDto, { imageIds: ['a', 'b'] });
      expect(failedProperties(dto)).toEqual([]);
    });

    it('rejects an empty list', () => {
      const dto = plainToInstance(ReorderProductImagesDto, { imageIds: [] });
      expect(failedProperties(dto)).toContain('imageIds');
    });

    it(`rejects more than ${MAX_PRODUCT_IMAGES} ids`, () => {
      const dto = plainToInstance(ReorderProductImagesDto, {
        imageIds: Array.from({ length: MAX_PRODUCT_IMAGES + 1 }, (_, i) => `img-${i}`),
      });
      expect(failedProperties(dto)).toContain('imageIds');
    });
  });

  describe('CreateProductDto images', () => {
    it('accepts an album within the limit', () => {
      const dto = plainToInstance(CreateProductDto, {
        vendorId: '6f1c2b7e-1111-4222-8333-444455556666',
        type: 'physical',
        price: 100,
        images: [{ url: 'https://cdn/a.jpg' }, { url: 'https://cdn/b.jpg', isPrimary: true }],
      });
      expect(failedProperties(dto)).toEqual([]);
    });

    it(`rejects more than ${MAX_PRODUCT_IMAGES} images`, () => {
      const dto = plainToInstance(CreateProductDto, {
        vendorId: '6f1c2b7e-1111-4222-8333-444455556666',
        type: 'physical',
        price: 100,
        images: Array.from({ length: MAX_PRODUCT_IMAGES + 1 }, (_, i) => ({
          url: `https://cdn/${i}.jpg`,
        })),
      });
      expect(failedProperties(dto)).toContain('images');
    });

    it('rejects an invalid nested image', () => {
      const dto = plainToInstance(CreateProductDto, {
        vendorId: '6f1c2b7e-1111-4222-8333-444455556666',
        type: 'physical',
        price: 100,
        images: [{ url: 'https://cdn/a.jpg', mimeType: 'video/mp4' }],
      });
      expect(failedProperties(dto)).toContain('images');
    });
  });
});
