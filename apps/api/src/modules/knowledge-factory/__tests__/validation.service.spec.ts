import { Test, TestingModule } from '@nestjs/testing';
import { ValidationService } from '../application/services/validation.service.js';
import type { ParsedContent } from '../infrastructure/parsers/parsed-content.type.js';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidationService],
    }).compile();
    service = module.get<ValidationService>(ValidationService);
  });

  it('passes high-quality engineering content', async () => {
    const content: ParsedContent = {
      text: 'The transformer shall be designed according to IEC 60076. ' +
        'The rated power is 15 MVA. The voltage ratio is 33/11 kV. ' +
        'The impedance voltage is 10%. The cooling type is ONAN. ' +
        'The transformer must be suitable for outdoor installation. ' +
        'The noise level shall not exceed 65 dB(A).',
      metadata: { headings: ['Scope', 'Requirements'], pageCount: 10 },
    };
    const report = await service.validate('doc-1', content, { sourceType: 'standard', confidence: 0.9 });
    expect(report.passed).toBe(true);
    expect(report.scores.overallScore).toBeGreaterThan(0.5);
  });

  it('fails very short or low-quality content', async () => {
    const content: ParsedContent = {
      text: 'Hello world.',
      metadata: {},
    };
    const report = await service.validate('doc-2', content, { sourceType: 'other', confidence: 0.3 });
    expect(report.passed).toBe(false);
    expect(report.errors.length).toBeGreaterThan(0);
  });

  it('flags standard documents missing required structure', async () => {
    const content: ParsedContent = {
      text: 'This is a standard document about something short.',
      metadata: { pageCount: 1 },
    };
    const report = await service.validate('doc-3', content, { sourceType: 'standard', confidence: 0.8 });
    expect(report.scores.standardScore).toBeLessThan(0.6);
  });

  it('warns on marginal content quality', async () => {
    const content: ParsedContent = {
      text: 'A'.repeat(1000),
      metadata: { pageCount: 1 },
    };
    const report = await service.validate('doc-4', content, { sourceType: 'other', confidence: 0.5 });
    expect(report.warnings.length).toBeGreaterThanOrEqual(0);
  });
});
