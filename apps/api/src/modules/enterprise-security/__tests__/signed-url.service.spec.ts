import { SignedUrlService } from '../application/services/signed-url.service.js';
import type { SignedUrlRequest } from '../domain/types/security.types.js';

describe('SignedUrlService', () => {
  let service: SignedUrlService;

  beforeEach(() => {
    service = new SignedUrlService();
  });

  const makeRequest = (overrides: Partial<SignedUrlRequest> = {}): SignedUrlRequest => ({
    operation: 'download',
    bucket: 'documents',
    path: '/reports/design-v2.pdf',
    expiresIn: 3600,
    ...overrides,
  });

  it('generates a signed download URL', async () => {
    const result = await service.generate(makeRequest());
    expect(result.url).toContain('/api/v1/storage/documents//reports/design-v2.pdf');
    expect(result.token).toBeDefined();
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(result.method).toBe('GET');
  });

  it('generates a signed upload URL with PUT method', async () => {
    const result = await service.generate(makeRequest({ operation: 'upload' }));
    expect(result.method).toBe('PUT');
  });

  it('generates a signed delete URL with DELETE method', async () => {
    const result = await service.generate(makeRequest({ operation: 'delete' }));
    expect(result.method).toBe('DELETE');
  });

  it('verifies a valid token', async () => {
    const result = await service.generate(makeRequest());
    const valid = await service.verify(result.token, result.url);
    expect(valid).toBe(true);
  });

  it('rejects a revoked token', async () => {
    const result = await service.generate(makeRequest());
    await service.revoke(result.token);
    const valid = await service.verify(result.token, result.url);
    expect(valid).toBe(false);
  });

  it('rejects an expired token', async () => {
    const result = await service.generate(makeRequest({ expiresIn: -1 }));
    const valid = await service.verify(result.token, result.url);
    expect(valid).toBe(false);
  });

  it('rejects unknown tokens', async () => {
    const valid = await service.verify('fake-token', 'http://localhost/path');
    expect(valid).toBe(false);
  });

  it('handles concurrent generation and revocation', async () => {
    const results = await Promise.all([
      service.generate(makeRequest()),
      service.generate(makeRequest()),
      service.generate(makeRequest()),
    ]);
    await service.revoke(results[0].token);
    expect(await service.verify(results[0].token, results[0].url)).toBe(false);
    expect(await service.verify(results[1].token, results[1].url)).toBe(true);
  });

  it('generates unique tokens for same request', async () => {
    const a = await service.generate(makeRequest());
    const b = await service.generate(makeRequest());
    expect(a.token).not.toBe(b.token);
  });
});
