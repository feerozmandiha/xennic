import { normalizeProviderBaseUrl } from '../ai-provider.entity.js';

describe('normalizeProviderBaseUrl', () => {
  it('returns undefined for empty input', () => {
    expect(normalizeProviderBaseUrl(undefined)).toBeUndefined();
    expect(normalizeProviderBaseUrl(null)).toBeUndefined();
    expect(normalizeProviderBaseUrl('')).toBeUndefined();
  });

  it('removes trailing slashes', () => {
    expect(normalizeProviderBaseUrl('https://api.mistral.ai/v1/')).toBe(
      'https://api.mistral.ai/v1',
    );
  });

  it('removes chat completion suffix', () => {
    expect(normalizeProviderBaseUrl('https://api.mistral.ai/v1/chat/completions')).toBe(
      'https://api.mistral.ai/v1',
    );
  });

  it('removes completion suffix', () => {
    expect(normalizeProviderBaseUrl('https://api.openai.com/v1/completions')).toBe(
      'https://api.openai.com/v1',
    );
  });

  it('removes models suffix', () => {
    expect(normalizeProviderBaseUrl('https://api.mistral.ai/v1/models')).toBe(
      'https://api.mistral.ai/v1',
    );
  });

  it('trims whitespace', () => {
    expect(normalizeProviderBaseUrl('  https://api.mistral.ai/v1  ')).toBe(
      'https://api.mistral.ai/v1',
    );
  });
});
