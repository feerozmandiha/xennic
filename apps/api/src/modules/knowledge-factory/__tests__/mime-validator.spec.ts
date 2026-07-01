import { isAllowedMimeType, getExtension } from '../application/utils/mime-validator.js';

describe('MimeValidator', () => {
  describe('isAllowedMimeType', () => {
    it('should allow application/pdf', () => {
      expect(isAllowedMimeType('application/pdf')).toBe(true);
    });

    it('should allow application/vnd.openxmlformats-officedocument.wordprocessingml.document', () => {
      expect(
        isAllowedMimeType(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ),
      ).toBe(true);
    });

    it('should allow text/markdown', () => {
      expect(isAllowedMimeType('text/markdown')).toBe(true);
    });

    it('should allow text/plain', () => {
      expect(isAllowedMimeType('text/plain')).toBe(true);
    });

    it('should reject unknown MIME types', () => {
      expect(isAllowedMimeType('image/png')).toBe(false);
      expect(isAllowedMimeType('application/zip')).toBe(false);
      expect(isAllowedMimeType('')).toBe(false);
    });
  });

  describe('getExtension', () => {
    it('should return pdf for application/pdf', () => {
      expect(getExtension('application/pdf')).toBe('pdf');
    });

    it('should return docx for docx mime type', () => {
      expect(
        getExtension(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ),
      ).toBe('docx');
    });

    it('should return md for text/markdown', () => {
      expect(getExtension('text/markdown')).toBe('md');
    });

    it('should return txt for text/plain', () => {
      expect(getExtension('text/plain')).toBe('txt');
    });

    it('should return empty string for unknown MIME', () => {
      expect(getExtension('image/png')).toBe('');
    });
  });
});
