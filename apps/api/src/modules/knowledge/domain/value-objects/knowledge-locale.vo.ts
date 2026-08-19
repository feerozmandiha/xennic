/**
 * Locale rules for the Knowledge aggregate.
 *
 * A knowledge article stores its canonical content on the root row and every
 * additional language in a `knowledge_translations` row. This value object owns
 * the normalisation + fallback rules so that both the service layer and the
 * public controllers resolve a locale identically.
 */

export const SUPPORTED_KNOWLEDGE_LOCALES = ['fa', 'en'] as const;

export type SupportedKnowledgeLocale = (typeof SUPPORTED_KNOWLEDGE_LOCALES)[number];

export const DEFAULT_KNOWLEDGE_LOCALE: SupportedKnowledgeLocale = 'fa';

export class KnowledgeLocale {
  private constructor(private readonly _value: SupportedKnowledgeLocale) {}

  /**
   * Normalises an arbitrary input (`FA`, `fa-IR`, `en_US`, ...) to a supported
   * locale. Throws when the base language is not supported.
   */
  static create(value: string): KnowledgeLocale {
    const normalized = KnowledgeLocale.normalize(value);
    if (!normalized) {
      throw new Error(
        `Unsupported knowledge locale "${value}". ` +
          `Supported: ${SUPPORTED_KNOWLEDGE_LOCALES.join(', ')}`,
      );
    }
    return new KnowledgeLocale(normalized);
  }

  /** Same as `create` but falls back to the default locale instead of throwing. */
  static createOrDefault(value?: string | null): KnowledgeLocale {
    if (!value) return new KnowledgeLocale(DEFAULT_KNOWLEDGE_LOCALE);
    return new KnowledgeLocale(KnowledgeLocale.normalize(value) ?? DEFAULT_KNOWLEDGE_LOCALE);
  }

  /** Returns the normalised locale, or `null` when unsupported. */
  static normalize(value: string): SupportedKnowledgeLocale | null {
    const base = value.trim().toLowerCase().split(/[-_]/)[0] ?? '';
    return (SUPPORTED_KNOWLEDGE_LOCALES as readonly string[]).includes(base)
      ? (base as SupportedKnowledgeLocale)
      : null;
  }

  static isSupported(value: string): boolean {
    return KnowledgeLocale.normalize(value) !== null;
  }

  get value(): SupportedKnowledgeLocale {
    return this._value;
  }

  isDefault(): boolean {
    return this._value === DEFAULT_KNOWLEDGE_LOCALE;
  }

  equals(other: KnowledgeLocale): boolean {
    return this._value === other._value;
  }

  /**
   * Fallback chain used when a requested translation is missing:
   * requested locale → default locale → remaining supported locales.
   */
  fallbackChain(): SupportedKnowledgeLocale[] {
    const chain: SupportedKnowledgeLocale[] = [this._value];
    if (!this.isDefault()) chain.push(DEFAULT_KNOWLEDGE_LOCALE);
    for (const locale of SUPPORTED_KNOWLEDGE_LOCALES) {
      if (!chain.includes(locale)) chain.push(locale);
    }
    return chain;
  }

  toString(): string {
    return this._value;
  }
}
