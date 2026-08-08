import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadJwtKeyFile, resolveJwtKeyPath } from './jwt-key-resolver.js';

function findRepoRoot(startDir: string): string | null {
  let dir = startDir;
  for (let i = 0; i < 8; i += 1) {
    if (existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
  return null;
}

const repoRoot = findRepoRoot(__dirname) ?? process.cwd();
const RELATIVE_PUBLIC_KEY = path.join('infrastructure', 'docker', 'secrets', 'jwt-public.key');

describe('resolveJwtKeyPath', () => {
  it('keeps an absolute path unchanged', () => {
    expect(resolveJwtKeyPath('/run/secrets/jwt_public_key', 'JWT_PUBLIC_KEY_PATH')).toBe(
      '/run/secrets/jwt_public_key',
    );
    const abs = path.join(repoRoot, RELATIVE_PUBLIC_KEY);
    expect(resolveJwtKeyPath(abs, 'JWT_PUBLIC_KEY_PATH')).toBe(abs);
  });

  it('resolves a relative path against the repository root when cwd is the repo root', () => {
    const resolved = resolveJwtKeyPath(RELATIVE_PUBLIC_KEY, 'JWT_PUBLIC_KEY_PATH', repoRoot);
    expect(resolved).toBe(path.resolve(repoRoot, RELATIVE_PUBLIC_KEY));
  });

  it('resolves a relative path against the repository root when cwd is apps/api', () => {
    const nested = path.join(repoRoot, 'apps', 'api');
    const resolved = resolveJwtKeyPath(RELATIVE_PUBLIC_KEY, 'JWT_PUBLIC_KEY_PATH', nested);
    expect(resolved).toBe(path.resolve(repoRoot, RELATIVE_PUBLIC_KEY));
  });

  it('throws a clear error when the env var is missing', () => {
    expect(() => resolveJwtKeyPath(undefined, 'JWT_PUBLIC_KEY_PATH')).toThrow(
      'Missing required environment variable JWT_PUBLIC_KEY_PATH',
    );
  });

  it('treats a blank value as missing', () => {
    expect(() => resolveJwtKeyPath('   ', 'JWT_PUBLIC_KEY_PATH')).toThrow(
      'Missing required environment variable JWT_PUBLIC_KEY_PATH',
    );
  });
});

describe('loadJwtKeyFile', () => {
  it('loads an existing relative key file from a nested cwd', () => {
    const nested = path.join(repoRoot, 'apps', 'api');
    const content = loadJwtKeyFile(RELATIVE_PUBLIC_KEY, 'JWT_PUBLIC_KEY_PATH', nested);
    expect(content).toMatch(/^-----BEGIN/);
  });

  it('loads an existing absolute key file', () => {
    const abs = path.join(repoRoot, RELATIVE_PUBLIC_KEY);
    const content = loadJwtKeyFile(abs, 'JWT_PUBLIC_KEY_PATH');
    expect(content).toMatch(/^-----BEGIN/);
  });

  it('throws an actionable error mentioning the resolved path when the file is missing', () => {
    const missing = path.join('infrastructure', 'docker', 'secrets', 'jwt-missing.key');
    const nested = path.join(repoRoot, 'apps', 'api');
    let error: Error | undefined;
    try {
      loadJwtKeyFile(missing, 'JWT_PRIVATE_KEY_PATH', nested);
    } catch (err) {
      error = err as Error;
    }
    expect(error).toBeDefined();
    expect(error!.message).toContain('JWT_PRIVATE_KEY_PATH');
    expect(error!.message).toContain(path.resolve(repoRoot, missing));
  });
});
