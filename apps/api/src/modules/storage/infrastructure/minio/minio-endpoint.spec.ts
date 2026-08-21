import { resolveMinioEndpoint } from './minio.service.js';

describe('resolveMinioEndpoint', () => {
  it('uses host:port when the endpoint carries a port', () => {
    expect(resolveMinioEndpoint({ MINIO_ENDPOINT: 'minio.internal:9100' } as NodeJS.ProcessEnv)).toEqual(
      { host: 'minio.internal', port: 9100 },
    );
  });

  it('falls back to MINIO_PORT when the endpoint is host only (the .env.example shape)', () => {
    expect(
      resolveMinioEndpoint({ MINIO_ENDPOINT: 'localhost', MINIO_PORT: '9500' } as NodeJS.ProcessEnv),
    ).toEqual({ host: 'localhost', port: 9500 });
  });

  it('prefers the port inside the endpoint over MINIO_PORT', () => {
    expect(
      resolveMinioEndpoint({
        MINIO_ENDPOINT: 'localhost:9100',
        MINIO_PORT: '9500',
      } as NodeJS.ProcessEnv),
    ).toEqual({ host: 'localhost', port: 9100 });
  });

  it('defaults to localhost:9000 when nothing is configured', () => {
    expect(resolveMinioEndpoint({} as NodeJS.ProcessEnv)).toEqual({
      host: 'localhost',
      port: 9000,
    });
  });

  it('ignores a malformed port', () => {
    expect(
      resolveMinioEndpoint({ MINIO_ENDPOINT: 'localhost', MINIO_PORT: 'nope' } as NodeJS.ProcessEnv),
    ).toEqual({ host: 'localhost', port: 9000 });
  });

  it('trims whitespace around the host', () => {
    expect(resolveMinioEndpoint({ MINIO_ENDPOINT: '  minio  ' } as NodeJS.ProcessEnv)).toEqual({
      host: 'minio',
      port: 9000,
    });
  });
});
