import type { ClassificationResult } from './classification-result.vo.js';

describe('ClassificationResult', () => {
  it('should accept a valid classification', () => {
    const result: ClassificationResult = {
      domain: 'electrical-engineering',
      standard: 'IEEE',
      equipmentType: 'transformer',
      confidence: 0.92,
      detectedLanguage: 'en',
      suggestedSlug: 'transformer-specification',
    };

    expect(result.domain).toBe('electrical-engineering');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('should allow minimal classification', () => {
    const result: ClassificationResult = {
      domain: 'general',
      confidence: 0.5,
    };

    expect(result.domain).toBe('general');
    expect(result.standard).toBeUndefined();
    expect(result.equipmentType).toBeUndefined();
  });
});
