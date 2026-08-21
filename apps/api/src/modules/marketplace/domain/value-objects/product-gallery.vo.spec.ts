import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MAX_PRODUCT_IMAGES, ProductGallery } from './product-gallery.vo.js';
import type { ProductImageData } from './product-image.vo.js';

function img(id: string, overrides: Partial<ProductImageData> = {}): ProductImageData {
  return { id, url: `https://cdn/${id}.jpg`, ...overrides };
}

/** خلاصهٔ آلبوم به‌صورت [id, isPrimary, sortOrder] برای اظهارنظر ساده‌تر. */
function shape(gallery: ProductGallery) {
  return gallery.all.map((image) => [image.id, image.isPrimary, image.sortOrder]);
}

describe('ProductGallery', () => {
  describe('create', () => {
    it('returns an empty gallery for null/undefined/empty input', () => {
      expect(ProductGallery.create(null).isEmpty).toBe(true);
      expect(ProductGallery.create(undefined).isEmpty).toBe(true);
      expect(ProductGallery.create([]).isEmpty).toBe(true);
      expect(ProductGallery.empty().primaryUrl).toBeNull();
    });

    it('promotes the first image to primary when none is flagged', () => {
      const gallery = ProductGallery.create([img('a'), img('b')]);

      expect(shape(gallery)).toEqual([
        ['a', true, 0],
        ['b', false, 1],
      ]);
      expect(gallery.primaryUrl).toBe('https://cdn/a.jpg');
    });

    it('moves the flagged primary to the front and renumbers sortOrder', () => {
      const gallery = ProductGallery.create([
        img('a', { sortOrder: 0 }),
        img('b', { sortOrder: 1, isPrimary: true }),
        img('c', { sortOrder: 2 }),
      ]);

      expect(shape(gallery)).toEqual([
        ['b', true, 0],
        ['a', false, 1],
        ['c', false, 2],
      ]);
    });

    it('orders by the incoming sortOrder before normalizing', () => {
      const gallery = ProductGallery.create([
        img('c', { sortOrder: 30 }),
        img('a', { sortOrder: 10 }),
        img('b', { sortOrder: 20 }),
      ]);

      expect(gallery.all.map((i) => i.id)).toEqual(['a', 'b', 'c']);
      expect(gallery.all.map((i) => i.sortOrder)).toEqual([0, 1, 2]);
    });

    it('keeps exactly one primary even when several are flagged', () => {
      const gallery = ProductGallery.create([
        img('a', { isPrimary: true }),
        img('b', { isPrimary: true, sortOrder: 1 }),
      ]);

      expect(gallery.all.filter((i) => i.isPrimary)).toHaveLength(1);
      expect(gallery.primary?.id).toBe('a');
    });

    it('rejects duplicate urls', () => {
      expect(() =>
        ProductGallery.create([
          { id: 'a', url: 'https://cdn/same.jpg' },
          { id: 'b', url: 'https://cdn/same.jpg' },
        ]),
      ).toThrow(/Duplicate image url/);
    });

    it(`rejects more than ${MAX_PRODUCT_IMAGES} images`, () => {
      const many = Array.from({ length: MAX_PRODUCT_IMAGES + 1 }, (_, i) => img(`i${i}`));
      expect(() => ProductGallery.create(many)).toThrow(BadRequestException);
    });

    it('propagates invalid image errors', () => {
      expect(() => ProductGallery.create([{ url: 'not-a-url' }])).toThrow(BadRequestException);
    });
  });

  describe('fromPersistence', () => {
    it('drops malformed rows instead of throwing', () => {
      const gallery = ProductGallery.fromPersistence([
        { id: 'bad', url: 'not-a-url' },
        img('good'),
      ]);

      expect(gallery.all.map((i) => i.id)).toEqual(['good']);
      expect(gallery.primary?.isPrimary).toBe(true);
    });

    it('drops duplicate urls instead of throwing', () => {
      const gallery = ProductGallery.fromPersistence([
        { id: 'a', url: 'https://cdn/same.jpg' },
        { id: 'b', url: 'https://cdn/same.jpg' },
      ]);

      expect(gallery.size).toBe(1);
      expect(gallery.all[0].id).toBe('a');
    });

    it(`truncates legacy rows beyond ${MAX_PRODUCT_IMAGES}`, () => {
      const many = Array.from({ length: MAX_PRODUCT_IMAGES + 5 }, (_, i) =>
        img(`i${i}`, { sortOrder: i }),
      );

      expect(ProductGallery.fromPersistence(many).size).toBe(MAX_PRODUCT_IMAGES);
    });

    it('repairs legacy rows with no primary and sparse sort orders', () => {
      const gallery = ProductGallery.fromPersistence([
        img('a', { sortOrder: 7 }),
        img('b', { sortOrder: 3 }),
      ]);

      expect(shape(gallery)).toEqual([
        ['b', true, 0],
        ['a', false, 1],
      ]);
    });
  });

  describe('add', () => {
    it('makes the very first image primary automatically', () => {
      const gallery = ProductGallery.empty().add(img('a'));
      expect(shape(gallery)).toEqual([['a', true, 0]]);
    });

    it('appends further images without stealing the primary flag', () => {
      const gallery = ProductGallery.empty().add(img('a')).add(img('b'));
      expect(shape(gallery)).toEqual([
        ['a', true, 0],
        ['b', false, 1],
      ]);
    });

    it('honours isPrimary on the added image', () => {
      const gallery = ProductGallery.create([img('a'), img('b')]).add(
        img('c', { isPrimary: true }),
      );

      expect(shape(gallery)).toEqual([
        ['c', true, 0],
        ['a', false, 1],
        ['b', false, 2],
      ]);
    });

    it('does not mutate the source gallery', () => {
      const original = ProductGallery.create([img('a')]);
      original.add(img('b'));
      expect(original.size).toBe(1);
    });

    it('rejects a duplicate url', () => {
      const gallery = ProductGallery.create([img('a')]);
      expect(() => gallery.add({ url: 'https://cdn/a.jpg' })).toThrow(/Duplicate image url/);
    });

    it('rejects going over the limit', () => {
      const full = ProductGallery.create(
        Array.from({ length: MAX_PRODUCT_IMAGES }, (_, i) => img(`i${i}`, { sortOrder: i })),
      );
      expect(() => full.add(img('extra'))).toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    const gallery = ProductGallery.create([img('a'), img('b'), img('c')]);

    it('patches alt texts without touching the order', () => {
      const next = gallery.update('b', { altFa: 'دو', altEn: 'two' });

      expect(next.find('b')?.altFa).toBe('دو');
      expect(next.find('b')?.altEn).toBe('two');
      expect(next.all.map((i) => i.id)).toEqual(['a', 'b', 'c']);
    });

    it('promotes the image when isPrimary is set to true', () => {
      const next = gallery.update('c', { isPrimary: true });

      expect(shape(next)).toEqual([
        ['c', true, 0],
        ['a', false, 1],
        ['b', false, 2],
      ]);
    });

    it('re-sorts when sortOrder changes', () => {
      const next = gallery.update('c', { sortOrder: 0 });
      expect(next.all.map((i) => i.id)).toEqual(['a', 'c', 'b']);
    });

    it('rejects a url that collides with another image', () => {
      expect(() => gallery.update('b', { url: 'https://cdn/a.jpg' })).toThrow(
        /Duplicate image url/,
      );
    });

    it('allows re-saving the same url on the same image', () => {
      expect(gallery.update('b', { url: 'https://cdn/b.jpg' }).size).toBe(3);
    });

    it('throws NotFound for an unknown image', () => {
      expect(() => gallery.update('nope', { altFa: 'x' })).toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('renumbers the remaining images', () => {
      const next = ProductGallery.create([img('a'), img('b'), img('c')]).remove('b');

      expect(shape(next)).toEqual([
        ['a', true, 0],
        ['c', false, 1],
      ]);
    });

    it('promotes the next image when the primary is removed', () => {
      const next = ProductGallery.create([img('a'), img('b')]).remove('a');
      expect(shape(next)).toEqual([['b', true, 0]]);
    });

    it('can empty the gallery', () => {
      const next = ProductGallery.create([img('a')]).remove('a');
      expect(next.isEmpty).toBe(true);
      expect(next.primaryUrl).toBeNull();
    });

    it('throws NotFound for an unknown image', () => {
      expect(() => ProductGallery.create([img('a')]).remove('zz')).toThrow(NotFoundException);
    });
  });

  describe('setPrimary', () => {
    it('moves the chosen image to the front', () => {
      const next = ProductGallery.create([img('a'), img('b'), img('c')]).setPrimary('c');

      expect(shape(next)).toEqual([
        ['c', true, 0],
        ['a', false, 1],
        ['b', false, 2],
      ]);
      expect(next.primaryUrl).toBe('https://cdn/c.jpg');
    });

    it('is a no-op when the image is already primary', () => {
      const next = ProductGallery.create([img('a'), img('b')]).setPrimary('a');
      expect(shape(next)).toEqual([
        ['a', true, 0],
        ['b', false, 1],
      ]);
    });

    it('throws NotFound for an unknown image', () => {
      expect(() => ProductGallery.create([img('a')]).setPrimary('zz')).toThrow(NotFoundException);
    });
  });

  describe('reorder', () => {
    const gallery = ProductGallery.create([img('a'), img('b'), img('c')]);

    it('applies the given order and makes the first id primary', () => {
      const next = gallery.reorder(['c', 'a', 'b']);

      expect(shape(next)).toEqual([
        ['c', true, 0],
        ['a', false, 1],
        ['b', false, 2],
      ]);
    });

    it('rejects a partial list', () => {
      expect(() => gallery.reorder(['a', 'b'])).toThrow(/all 3 image/);
    });

    it('rejects duplicate ids', () => {
      expect(() => gallery.reorder(['a', 'a', 'b'])).toThrow(/duplicate image ids/);
    });

    it('rejects unknown ids', () => {
      expect(() => gallery.reorder(['a', 'b', 'zz'])).toThrow(NotFoundException);
    });
  });

  describe('accessors', () => {
    it('exposes size, primary and lookup', () => {
      const gallery = ProductGallery.create([img('a'), img('b')]);

      expect(gallery.size).toBe(2);
      expect(gallery.isEmpty).toBe(false);
      expect(gallery.primary?.id).toBe('a');
      expect(gallery.find('b')?.id).toBe('b');
      expect(gallery.find('zz')).toBeNull();
    });

    it('returns a defensive copy from all', () => {
      const gallery = ProductGallery.create([img('a')]);
      gallery.all.pop();
      expect(gallery.size).toBe(1);
    });

    it('serializes to an ordered JSON array', () => {
      const json = ProductGallery.create([img('a'), img('b')]).toJSON();

      expect(json).toHaveLength(2);
      expect(json[0]).toEqual(expect.objectContaining({ id: 'a', isPrimary: true, sortOrder: 0 }));
      expect(json[1]).toEqual(expect.objectContaining({ id: 'b', isPrimary: false, sortOrder: 1 }));
    });
  });
});
