/**
 * Canonical test environment loader for the Xennic API.
 *
 * Loaded via `setupFiles` in BOTH Jest configs:
 *   - apps/api/jest.config.ts      (unit + integration, rootDir: src)
 *   - apps/api/test/jest-e2e.json  (e2e, rootDir: test)
 *
 * Load order (first load wins):
 *   1. Existing process.env (shell / CI secrets) — NEVER overridden.
 *   2. <repo-root>/.env — canonical local configuration.
 *   3. apps/api/.env — optional API-local overrides (when present).
 *
 * Deliberate exclusions:
 *   - MINIO_* keys are NOT injected. MinIO connectivity in integration and
 *     e2e suites is owned by the specs themselves (via `??=` defaults that
 *     match the local MinIO test server). Injecting the deployment-scoped
 *     MINIO_* from .env would silently disable those spec defaults.
 *
 * Security:
 *   - No value is ever logged or printed.
 *   - Values are only written to process.env in-process.
 *   - dotenv.parse is used so keys can be filtered before assignment.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const MINIO_KEYS = new Set([
  'MINIO_ENDPOINT',
  'MINIO_PORT',
  'MINIO_ACCESS_KEY',
  'MINIO_SECRET_KEY',
  'MINIO_BUCKET',
  'MINIO_USE_SSL',
]);

function findRepoRoot(startDir: string): string | null {
  let dir = startDir;
  for (let i = 0; i < 8; i += 1) {
    if (existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
  return null;
}

function loadEnvFile(file: string): void {
  if (!existsSync(file)) return;
  const parsed = dotenv.parse(readFileSync(file, 'utf8'));
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] !== undefined) continue;
    if (MINIO_KEYS.has(key)) continue;
    process.env[key] = value;
  }
}

const repoRoot = findRepoRoot(__dirname) ?? process.cwd();
loadEnvFile(path.join(repoRoot, '.env'));
loadEnvFile(path.join(repoRoot, 'apps', 'api', '.env'));
