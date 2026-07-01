import { FingerprintService } from '../application/utils/fingerprint.service.js';

describe('FingerprintService', () => {
  let service: FingerprintService;

  beforeEach(() => {
    service = new FingerprintService();
  });

  it('should compute SHA-256 checksum for a buffer', () => {
    const buffer = Buffer.from('hello world');
    const checksum = service.computeChecksum(buffer);
    expect(checksum).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
  });

  it('should return a hex string of 64 characters', () => {
    const buffer = Buffer.from('test');
    const checksum = service.computeChecksum(buffer);
    expect(checksum).toHaveLength(64);
    expect(/^[a-f0-9]{64}$/.test(checksum)).toBe(true);
  });

  it('should produce different checksums for different buffers', () => {
    const a = service.computeChecksum(Buffer.from('foo'));
    const b = service.computeChecksum(Buffer.from('bar'));
    expect(a).not.toBe(b);
  });

  it('should produce the same checksum for identical buffers', () => {
    const a = service.computeChecksum(Buffer.from('same data'));
    const b = service.computeChecksum(Buffer.from('same data'));
    expect(a).toBe(b);
  });

  it('should handle empty buffer', () => {
    const checksum = service.computeChecksum(Buffer.alloc(0));
    expect(checksum).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
});
