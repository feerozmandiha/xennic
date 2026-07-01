import { Test, TestingModule } from '@nestjs/testing';
import { NormalizationService } from '../application/services/normalization.service.js';
import type { ParsedContent } from '../infrastructure/parsers/parsed-content.type.js';

describe('NormalizationService', () => {
  let service: NormalizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NormalizationService],
    }).compile();
    service = module.get<NormalizationService>(NormalizationService);
  });

  it('normalizes units in document text', () => {
    const content: ParsedContent = {
      text: 'Rated voltage: 33 kv, rated power: 15 mw.',
      metadata: {},
    };
    const result = service.normalize('doc-1', 'ws-1', content);
    expect(result.normalizedUnits.length).toBeGreaterThan(0);
    expect(result.normalizedUnits.some((u) => u.normalized.includes('kV'))).toBe(true);
  });

  it('standardizes engineering terminology', () => {
    const content: ParsedContent = {
      text: 'The freq is 50 Hz and the pf is 0.85.',
      metadata: {},
    };
    const result = service.normalize('doc-2', 'ws-1', content);
    const pfTerms = result.standardizedTerms.filter((t) => t.canonical === 'Power Factor');
    expect(pfTerms.length).toBeGreaterThan(0);
  });

  it('deduplicates repeated unit references', () => {
    const content: ParsedContent = {
      text: '33 kV at terminal A, 33 kV at terminal B, 33 kV at terminal C.',
      metadata: {},
    };
    const result = service.normalize('doc-3', 'ws-1', content);
    const kVUnits = result.normalizedUnits.filter((u) => u.normalized.includes('kV'));
    expect(kVUnits.length).toBe(1);
  });

  it('handles empty document text', () => {
    const content: ParsedContent = { text: '', metadata: {} };
    const result = service.normalize('doc-4', 'ws-1', content);
    expect(result.normalizedUnits).toHaveLength(0);
    expect(result.standardizedTerms).toHaveLength(0);
  });
});
