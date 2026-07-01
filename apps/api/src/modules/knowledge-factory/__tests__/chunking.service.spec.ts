import { Test, TestingModule } from '@nestjs/testing';
import { ChunkingService } from '../application/services/chunking.service.js';
import type { ParsedContent } from '../application/services/chunking.service.js';
import type { DocumentChunk } from '../domain/chunk.types.js';

const SAMPLE_MARKDOWN = `# Introduction

This document covers the electrical engineering standards used in Xennic.

## Voltage Drop Calculation

The voltage drop is calculated using the formula:

$$ V_d = \\frac{\\sqrt{3} \\times I \\times L \\times (R \\cos\\phi + X \\sin\\phi)}{1000} $$

Where:
- \\( I \\) is the load current in amperes
- \\( L \\) is the cable length in meters

## Cable Sizing Table

| Conductor Size | Ampacity (A) | Voltage Drop (V) |
|---------------|-------------|-----------------|
| 2.5 mm²       | 25          | 3.2             |
| 4 mm²         | 34          | 2.1             |
| 6 mm²         | 44          | 1.4             |

## Cross References

See [[Voltage Drop Calculation]] for more details on the formula.
Also refer to [[Cable Sizing Methodology]] for sizing guidance.
`;

const SAMPLE_DOC: ParsedContent = {
  docId: 'doc-001',
  workspaceId: 'ws-001',
  content: SAMPLE_MARKDOWN,
  format: 'markdown',
};

describe('ChunkingService', () => {
  let service: ChunkingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChunkingService],
    }).compile();

    service = module.get<ChunkingService>(ChunkingService);
  });

  describe('chunkDocument', () => {
    it('should return an array of chunks', () => {
      const chunks = service.chunkDocument(SAMPLE_DOC);
      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBeGreaterThan(0);
    });

    it('should create heading chunks for ## headings', () => {
      const chunks = service.chunkDocument(SAMPLE_DOC);
      const headingChunks = chunks.filter((c) => c.chunkType === 'heading');

      expect(headingChunks.length).toBe(4);
      expect(headingChunks[0]?.heading).toBe('Introduction');
      expect(headingChunks[1]?.heading).toBe('Voltage Drop Calculation');
      expect(headingChunks[2]?.heading).toBe('Cable Sizing Table');
      expect(headingChunks[3]?.heading).toBe('Cross References');
    });

    it('should assign correct indices in order', () => {
      const chunks = service.chunkDocument(SAMPLE_DOC);
      for (let i = 0; i < chunks.length; i++) {
        expect(chunks[i]!.index).toBe(i);
      }
    });

    it('should generate stable chunk IDs', () => {
      const chunks = service.chunkDocument(SAMPLE_DOC);
      for (const chunk of chunks) {
        expect(chunk.chunkId).toMatch(/^doc-001-chunk-\d+$/);
      }
    });

    it('should mark table chunks with chunkType table', () => {
      const chunks = service.chunkDocument(SAMPLE_DOC);
      const tableChunks = chunks.filter((c) => c.chunkType === 'table');

      expect(tableChunks.length).toBe(1);
      expect(tableChunks[0]!.content).toContain('Conductor Size');
      expect(tableChunks[0]!.metadata.tables).toBeDefined();
    });

    it('should preserve formula chunks with chunkType formula', () => {
      const chunks = service.chunkDocument(SAMPLE_DOC);
      const formulaChunks = chunks.filter((c) => c.chunkType === 'formula');

      expect(formulaChunks.length).toBe(1);
      expect(formulaChunks[0]!.content).toContain('$$');
      expect(formulaChunks[0]!.metadata.formulas).toBeDefined();
    });

    it('should track cross-references in metadata', () => {
      const chunks = service.chunkDocument(SAMPLE_DOC);
      const chunksWithRefs = chunks.filter(
        (c) => c.metadata.crossReferences && c.metadata.crossReferences.length > 0,
      );

      const allRefs = chunksWithRefs.flatMap((c) => c.metadata.crossReferences!);
      expect(allRefs).toContain('Voltage Drop Calculation');
      expect(allRefs).toContain('Cable Sizing Methodology');
    });

    it('should assign chunkId format docId-chunk-index', () => {
      const chunks = service.chunkDocument(SAMPLE_DOC);
      for (const chunk of chunks) {
        expect(chunk.docId).toBe('doc-001');
        expect(chunk.workspaceId).toBe('ws-001');
        expect(chunk.chunkId).toBe(`doc-001-chunk-${chunk.index}`);
      }
    });

    it('should handle empty content gracefully', () => {
      const emptyDoc: ParsedContent = {
        docId: 'doc-empty',
        workspaceId: 'ws-001',
        content: '',
        format: 'plain',
      };

      const chunks = service.chunkDocument(emptyDoc);
      expect(chunks).toEqual([]);
    });

    it('should handle content with no headings', () => {
      const plainDoc: ParsedContent = {
        docId: 'doc-plain',
        workspaceId: 'ws-001',
        content: 'Just a plain paragraph.\n\nAnother paragraph here.',
        format: 'plain',
      };

      const chunks = service.chunkDocument(plainDoc);
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.every((c) => c.chunkType === 'text')).toBe(true);
    });

    it('should populate workspaceId and docId on every chunk', () => {
      const chunks = service.chunkDocument(SAMPLE_DOC);

      for (const chunk of chunks) {
        expect(chunk.workspaceId).toBe('ws-001');
        expect(chunk.docId).toBe('doc-001');
      }
    });

    it('should provide token estimates', () => {
      const chunks = service.chunkDocument(SAMPLE_DOC);

      for (const chunk of chunks) {
        expect(chunk.tokenCount).toBeGreaterThan(0);
      }
    });
  });
});
