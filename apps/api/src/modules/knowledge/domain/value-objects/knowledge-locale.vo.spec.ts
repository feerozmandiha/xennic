import {
  KnowledgeLocale,
  DEFAULT_KNOWLEDGE_LOCALE,
  SUPPORTED_KNOWLEDGE_LOCALES,
} from './knowledge-locale.vo.js';

describe('KnowledgeLocale', () => {
  describe('normalize', () => {
    it('accepts a bare supported locale', () => {
      expect(KnowledgeLocale.normalize('fa')).toBe('fa');
      expect(KnowledgeLocale.normalize('en')).toBe('en');
    });

    it('lowercases and trims input', () => {
      expect(KnowledgeLocale.normalize('  EN  ')).toBe('en');
      expect(KnowledgeLocale.normalize('FA')).toBe('fa');
    });

    it('strips region subtags with either separator', () => {
      expect(KnowledgeLocale.normalize('fa-IR')).toBe('fa');
      expect(KnowledgeLocale.normalize('en_US')).toBe('en');
      expect(KnowledgeLocale.normalize('en-GB')).toBe('en');
    });

    it('returns null for unsupported languages', () => {
      expect(KnowledgeLocale.normalize('de')).toBeNull();
      expect(KnowledgeLocale.normalize('ar-SA')).toBeNull();
    });

    it('returns null for empty input', () => {
      expect(KnowledgeLocale.normalize('')).toBeNull();
      expect(KnowledgeLocale.normalize('   ')).toBeNull();
    });
  });

  describe('isSupported', () => {
    it('reports support correctly', () => {
      expect(KnowledgeLocale.isSupported('fa-IR')).toBe(true);
      expect(KnowledgeLocale.isSupported('de')).toBe(false);
    });
  });

  describe('create', () => {
    it('builds a value object for a supported locale', () => {
      expect(KnowledgeLocale.create('en').value).toBe('en');
    });

    it('normalises region subtags', () => {
      expect(KnowledgeLocale.create('fa-IR').value).toBe('fa');
    });

    it('throws for an unsupported locale', () => {
      expect(() => KnowledgeLocale.create('de')).toThrow(/Unsupported knowledge locale "de"/);
    });

    it('lists supported locales in the error message', () => {
      expect(() => KnowledgeLocale.create('de')).toThrow(
        new RegExp(SUPPORTED_KNOWLEDGE_LOCALES.join(', ')),
      );
    });
  });

  describe('createOrDefault', () => {
    it('falls back to the default locale for undefined', () => {
      expect(KnowledgeLocale.createOrDefault(undefined).value).toBe(DEFAULT_KNOWLEDGE_LOCALE);
    });

    it('falls back to the default locale for null', () => {
      expect(KnowledgeLocale.createOrDefault(null).value).toBe(DEFAULT_KNOWLEDGE_LOCALE);
    });

    it('falls back to the default locale for unsupported input', () => {
      expect(KnowledgeLocale.createOrDefault('de').value).toBe(DEFAULT_KNOWLEDGE_LOCALE);
    });

    it('keeps a supported locale', () => {
      expect(KnowledgeLocale.createOrDefault('en').value).toBe('en');
    });
  });

  describe('isDefault / equals', () => {
    it('detects the default locale', () => {
      expect(KnowledgeLocale.create('fa').isDefault()).toBe(true);
      expect(KnowledgeLocale.create('en').isDefault()).toBe(false);
    });

    it('compares by value', () => {
      expect(KnowledgeLocale.create('en').equals(KnowledgeLocale.create('en-US'))).toBe(true);
      expect(KnowledgeLocale.create('en').equals(KnowledgeLocale.create('fa'))).toBe(false);
    });
  });

  describe('fallbackChain', () => {
    it('starts with the requested locale', () => {
      expect(KnowledgeLocale.create('en').fallbackChain()[0]).toBe('en');
    });

    it('puts the default locale right after a non-default request', () => {
      expect(KnowledgeLocale.create('en').fallbackChain()).toEqual(['en', 'fa']);
    });

    it('does not duplicate the default locale', () => {
      const chain = KnowledgeLocale.create('fa').fallbackChain();
      expect(chain).toEqual(['fa', 'en']);
      expect(new Set(chain).size).toBe(chain.length);
    });

    it('covers every supported locale', () => {
      const chain = KnowledgeLocale.create('en').fallbackChain();
      for (const locale of SUPPORTED_KNOWLEDGE_LOCALES) {
        expect(chain).toContain(locale);
      }
    });
  });

  describe('toString', () => {
    it('renders the normalised value', () => {
      expect(String(KnowledgeLocale.create('EN-us'))).toBe('en');
    });
  });
});
