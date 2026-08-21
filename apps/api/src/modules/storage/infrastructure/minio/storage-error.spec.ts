import { describeStorageError } from './minio.service.js';

describe('describeStorageError', () => {
  it('reports rejected credentials for MinIO auth error codes', () => {
    for (const code of [
      'InvalidAccessKeyId',
      'SignatureDoesNotMatch',
      'AccessDenied',
      'InvalidRequest',
    ]) {
      expect(describeStorageError({ code }, 'fallback')).toMatch(/credentials rejected/i);
    }
  });

  it('recognises the access-key message even without a code', () => {
    expect(
      describeStorageError(
        { message: 'The Access Key Id you provided does not exist in our records.' },
        'File upload failed',
      ),
    ).toMatch(/credentials rejected/i);
  });

  it('reports an unreachable service for network error codes', () => {
    for (const code of ['ECONNREFUSED', 'ENOTFOUND', 'EHOSTUNREACH', 'ETIMEDOUT']) {
      expect(describeStorageError({ code }, 'fallback')).toMatch(/unreachable/i);
    }
  });

  it('recognises a refused connection from the message', () => {
    expect(
      describeStorageError({ message: 'connect ECONNREFUSED 127.0.0.1:9000' }, 'fallback'),
    ).toMatch(/unreachable/i);
  });

  it('keeps the fallback for unrelated failures', () => {
    expect(describeStorageError({ code: 'NoSuchKey', message: 'missing' }, 'File upload failed')).toBe(
      'File upload failed',
    );
    expect(describeStorageError(null, 'File upload failed')).toBe('File upload failed');
    expect(describeStorageError(undefined, 'File download failed')).toBe('File download failed');
  });
});
