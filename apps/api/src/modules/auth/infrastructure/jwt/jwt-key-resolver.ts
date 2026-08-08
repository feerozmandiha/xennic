import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const REPO_ROOT_MARKER = 'pnpm-workspace.yaml';
const MAX_WALK_DEPTH = 8;

const MODULE_DIR =
  typeof __dirname === 'string' && __dirname.length > 0 ? __dirname : process.cwd();

function findRepoRoot(startDir: string): string | null {
  let dir = startDir;
  for (let i = 0; i < MAX_WALK_DEPTH; i += 1) {
    if (existsSync(path.join(dir, REPO_ROOT_MARKER))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
  return null;
}

export function resolveJwtKeyPath(
  rawPath: string | undefined,
  envVarName: string,
  startDir: string = process.cwd(),
): string {
  if (!rawPath || rawPath.trim() === '') {
    throw new Error(
      `Missing required environment variable ${envVarName}. ` +
        'Set it to an absolute path (e.g. /run/secrets/jwt_public_key) ' +
        'or a path relative to the repository root ' +
        '(e.g. infrastructure/docker/secrets/jwt-public.key).',
    );
  }

  if (path.isAbsolute(rawPath)) {
    return path.normalize(rawPath);
  }

  const repoRoot = findRepoRoot(startDir) ?? findRepoRoot(MODULE_DIR);
  return repoRoot ? path.resolve(repoRoot, rawPath) : path.resolve(rawPath);
}

export function loadJwtKeyFile(
  rawPath: string | undefined,
  envVarName: string,
  startDir: string = process.cwd(),
): string {
  const resolved = resolveJwtKeyPath(rawPath, envVarName, startDir);
  try {
    return readFileSync(resolved, 'utf8');
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Unable to read JWT key file for ${envVarName}.\n` +
        `  configured value: ${rawPath}\n` +
        `  resolved path:    ${resolved}\n` +
        `  reason:           ${reason}\n` +
        `Fix: create the key file at the resolved path, or point ${envVarName} to an absolute ` +
        'path (e.g. a Docker Secrets mount at /run/secrets/jwt_private_key).',
    );
  }
}
