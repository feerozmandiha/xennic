import { getRedisConnectionOptions } from './redis.config.js';

describe('getRedisConnectionOptions', () => {
  const original = process.env.REDIS_URL;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.REDIS_URL;
    } else {
      process.env.REDIS_URL = original;
    }
  });

  it('defaults to localhost:6379 when REDIS_URL is unset', () => {
    delete process.env.REDIS_URL;
    expect(getRedisConnectionOptions()).toEqual({ host: 'localhost', port: 6379 });
  });

  it('parses a plain URL without password', () => {
    process.env.REDIS_URL = 'redis://localhost:6380';
    expect(getRedisConnectionOptions()).toEqual({ host: 'localhost', port: 6380 });
  });

  it('parses password from URL', () => {
    process.env.REDIS_URL = 'redis://:xennic@localhost:6380';
    const opts = getRedisConnectionOptions();
    expect(opts.host).toBe('localhost');
    expect(opts.port).toBe(6380);
    expect(opts.password).toBe('xennic');
    expect(opts.db).toBeUndefined();
  });

  it('parses db index from path', () => {
    process.env.REDIS_URL = 'redis://:secret@redis.internal:6379/3';
    const opts = getRedisConnectionOptions();
    expect(opts.host).toBe('redis.internal');
    expect(opts.port).toBe(6379);
    expect(opts.password).toBe('secret');
    expect(opts.db).toBe(3);
  });

  it('falls back to defaults on an invalid URL', () => {
    process.env.REDIS_URL = 'not-a-valid-url';
    expect(getRedisConnectionOptions()).toEqual({ host: 'localhost', port: 6379 });
  });
});
