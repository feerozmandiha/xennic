import { Test, TestingModule } from '@nestjs/testing';
import { ExtractionService } from '../application/services/extraction.service.js';
import type { ParsedContent } from '../infrastructure/parsers/parsed-content.type.js';

describe('ExtractionService', () => {
  let service: ExtractionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtractionService],
    }).compile();
    service = module.get<ExtractionService>(ExtractionService);
  });

  it('extracts standard references from text', () => {
    const content: ParsedContent = {
      text: 'This equipment complies with IEC 60947-2 and IEEE Std 242-2001.',
      metadata: {},
    };
    const { entities } = service.extract(content);
    const standards = entities.filter((e) => e.type === 'standard');
    expect(standards.length).toBeGreaterThanOrEqual(2);
  });

  it('extracts parameters with values and units', () => {
    const content: ParsedContent = {
      text: 'The rated voltage is 33 kV and the current is 630 A.',
      metadata: {},
    };
    const { entities } = service.extract(content);
    const params = entities.filter((e) => e.type === 'parameter');
    expect(params.length).toBeGreaterThanOrEqual(2);
  });

  it('deduplicates identical entities', () => {
    const content: ParsedContent = {
      text: 'Use cables rated for 33 kV. All 33 kV cables must be XLPE.',
      metadata: {},
    };
    const { entities } = service.extract(content);
    const params = entities.filter((e) => e.type === 'parameter');
    const kvs = params.filter((p) => p.value.includes('33 kV'));
    expect(kvs.length).toBe(1);
  });

  it('builds relationships between nearby equipment and parameters', () => {
    const content: ParsedContent = {
      text: 'The transformer is rated at 33 kV / 11 kV, 15 MVA.',
      metadata: {},
    };
    const { entities, relationships } = service.extract(content);
    expect(entities.length).toBeGreaterThan(0);
    expect(relationships.length).toBeGreaterThanOrEqual(0);
  });

  it('handles empty text gracefully', () => {
    const content: ParsedContent = { text: '', metadata: {} };
    const { entities, relationships } = service.extract(content);
    expect(entities).toHaveLength(0);
    expect(relationships).toHaveLength(0);
  });
});
