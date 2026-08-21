import { boundedInteger, boundedNumber } from './query-parameters.js';

describe('knowledge intelligence query parameters', () => {
  describe('boundedNumber', () => {
    it('parses numeric query-string values', () => {
      expect(boundedNumber('0.75', 0.6, 0, 1)).toBe(0.75);
    });

    it('uses the fallback for invalid values', () => {
      expect(boundedNumber('not-a-number', 0.6, 0, 1)).toBe(0.6);
    });

    it('clamps values to the accepted range', () => {
      expect(boundedNumber('-1', 0.6, 0, 1)).toBe(0);
      expect(boundedNumber('2', 0.6, 0, 1)).toBe(1);
    });
  });

  describe('boundedInteger', () => {
    it('truncates and clamps integer inputs', () => {
      expect(boundedInteger('12.9', 10, 1, 20)).toBe(12);
      expect(boundedInteger('100', 10, 1, 20)).toBe(20);
    });
  });
});
