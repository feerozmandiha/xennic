import { Test, TestingModule } from '@nestjs/testing';
import { CitationService } from '../application/services/citation.service.js';
import type { ParsedContent } from '../infrastructure/parsers/parsed-content.type.js';

describe('CitationService', () => {
  let service: CitationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CitationService],
    }).compile();
    service = module.get<CitationService>(CitationService);
  });

  it('builds evidence chain from document content and chunks', () => {
    const content: ParsedContent = {
      text: 'The transformer shall be rated for 33 kV. The impedance shall not exceed 10%.',
      metadata: { title: 'Transformer Spec' },
    };
    const chunks = [
      { chunkId: 'chunk-1', content: 'The transformer shall be rated for 33 kV.', heading: 'Voltage Rating', index: 0 },
      { chunkId: 'chunk-2', content: 'The impedance shall not exceed 10%.', heading: 'Impedance', index: 1 },
    ];
    const chain = service.buildEvidenceChain('doc-1', content, chunks);
    expect(chain.evidenceId).toBeDefined();
    expect(chain.sources.length).toBe(2);
    expect(chain.sources[0].location).toBe('Voltage Rating');
  });

  it('generates XENNIC-CITE format citations', () => {
    const content: ParsedContent = { text: 'Test content.', metadata: {} };
    const chunks = [
      { chunkId: 'chunk-1', content: 'Test content.', heading: 'Section 1', index: 0 },
    ];
    const chain = service.buildEvidenceChain('doc-1', content, chunks);
    const citations = service.generateCitations(chain);
    expect(citations.length).toBe(1);
    expect(citations[0].format).toMatch(/^XENNIC-CITE:/);
  });

  it('parses XENNIC-CITE strings', () => {
    const ref = service.parseCitation('XENNIC-CITE:doc-1:chunk-1:1:Section 1:0.9');
    expect(ref).not.toBeNull();
    expect(ref!.documentId).toBe('doc-1');
    expect(ref!.sourceId).toBe('chunk-1');
    expect(ref!.version).toBe(1);
    expect(ref!.location).toBe('Section 1');
    expect(ref!.confidence).toBe(0.9);
  });

  it('returns null for invalid citation format', () => {
    const ref = service.parseCitation('invalid-citation');
    expect(ref).toBeNull();
  });

  it('generates display-friendly citation text', () => {
    const content: ParsedContent = { text: 'Test.', metadata: {} };
    const chunks = [
      { chunkId: 'abcd1234efgh', content: 'Test content.', heading: 'Section 2', index: 0 },
    ];
    const chain = service.buildEvidenceChain('doc-1', content, chunks);
    const citations = service.generateCitations(chain);
    const display = service.formatForDisplay(citations[0]);
    expect(display).toContain('Section 2');
    expect(display).toContain('confidence');
  });
});
