import { calcCategory, CALC_TO_CATEGORY } from './calc-category.map.js';

describe('calcCategory', () => {
  it('maps cable calculations to cable category', () => {
    expect(calcCategory('CABLE-001')).toBe('cable');
    expect(calcCategory('CABLE-005')).toBe('cable');
  });

  it('maps transformer calculations to transformer category', () => {
    expect(calcCategory('TRF-001')).toBe('transformer');
  });

  it('returns undefined for unknown calculation types', () => {
    expect(calcCategory('UNKNOWN-999')).toBeUndefined();
  });

  it('keeps the map exhaustive enough for common categories', () => {
    expect(Object.values(CALC_TO_CATEGORY)).toEqual(
      expect.arrayContaining(['cable', 'transformer', 'mccb', 'fuse', 'switchgear', 'motor']),
    );
  });
});
