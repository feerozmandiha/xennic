import { readFileSync, readdirSync } from 'fs';
import { join, basename, dirname } from 'path';

interface AuditIssue {
  file: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
}

const issues: AuditIssue[] = [];
const workspaceRoot = process.cwd();

function isGitIgnored(filePath: string): boolean {
  const basename = filePath.split('/').pop() || '';
  return basename === '.env' || basename === '.env.local';
}

function findEnvFiles(dir: string, depth = 0): string[] {
  if (depth > 4) return [];
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'venv') continue;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...findEnvFiles(fullPath, depth + 1));
      } else if (entry.name === '.env' || entry.name.startsWith('.env.') || entry.name === '.env.example' || entry.name === '.env.template') {
        results.push(fullPath);
      }
    }
  } catch { /* skip */ }
  return results;
}

function parseEnv(content: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    map.set(key, val);
  }
  return map;
}

async function main() {
  console.log('\n📊 Phase 4 — Configuration Audit\n');

  const envFiles = findEnvFiles(workspaceRoot);
  console.log(`Found ${envFiles.length} .env files:\n`);

  const requiredVarsByService: Record<string, string[]> = {
    'apps/api': ['DATABASE_URL', 'REDIS_HOST', 'REDIS_PORT', 'RABBITMQ_HOST', 'RABBITMQ_PORT', 'JWT_PRIVATE_KEY_PATH', 'JWT_PUBLIC_KEY_PATH', 'MINIO_ENDPOINT', 'MINIO_PORT'],
    'apps/web': ['NEXT_PUBLIC_API_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'],
    'ai-service': ['QDRANT_API_KEY'],
    'engineering-service': ['ENGINEERING_SERVICE_URL'],
    'vision-service': ['VISION_SERVICE_URL'],
  };

  for (const envFile of envFiles) {
    const content = readFileSync(envFile, 'utf-8');
    const vars = parseEnv(content);
    const relPath = envFile.replace(workspaceRoot, '.');

    // Find which service this belongs to
    const serviceKey = Object.keys(requiredVarsByService).find(k => envFile.includes(k));

    console.log(`  ${relPath} (${vars.size} vars)`);

    // Check for required vars specific to this service
    if (serviceKey) {
      const required = requiredVarsByService[serviceKey];
      const missing = required.filter(v => !vars.has(v));
      if (missing.length > 0) {
        issues.push({ file: relPath, severity: 'medium', message: `Missing required vars: ${missing.join(', ')}` });
        console.log(`    ⚠️ Missing: ${missing.join(', ')}`);
      } else {
        console.log(`    ✅ Required vars present`);
      }
    }

    // Warn about empty values
    for (const [key, val] of vars) {
      if (!val || val === '""' || val === "''") {
        issues.push({ file: relPath, severity: 'low', message: `Empty value for ${key}` });
      }
    }

    // Check for real-looking credentials in non-gitignored files
    const isExample = relPath.includes('.env.example') || relPath.includes('.env.production');
    if (!isGitIgnored(envFile) && !isExample) {
      const secretPatterns = [
        { pattern: /(password|secret|token|key|credential)/i, varMatcher: true },
      ];
      for (const [key, val] of vars) {
        if (secretPatterns.some(p => p.varMatcher && p.pattern.test(key)) && val && val.length > 8) {
          issues.push({
            file: relPath,
            severity: 'high',
            message: `Hardcoded credential in non-gitignored file: ${key}`,
          });
        }
      }
    }
  }

  // Check for duplicate .env files in same directory
  const dirSet = new Map<string, string[]>();
  for (const f of envFiles) {
    const d = dirname(f);
    const existing = dirSet.get(d) || [];
    existing.push(basename(f));
    dirSet.set(d, existing);
  }
  for (const [d, files] of dirSet) {
    if (files.length > 1 && files.includes('.env')) {
      issues.push({
        file: d.replace(workspaceRoot, '.'),
        severity: 'low',
        message: `Multiple env files: ${files.join(', ')}`,
      });
    }
  }

  // ── REPORT ──
  const critical = issues.filter(i => i.severity === 'high');
  const warnings = issues.filter(i => i.severity === 'medium');
  const info = issues.filter(i => i.severity === 'low');

  console.log(`\n${'='.repeat(60)}`);
  console.log(`PHASE 4 — CONFIGURATION AUDIT RESULTS`);
  console.log(`${'='.repeat(60)}`);
  console.log(`High severity: ${critical.length}`);
  console.log(`Medium severity: ${warnings.length}`);
  console.log(`Low severity: ${info.length}`);

  if (issues.length === 0) {
    console.log(`\n✅ No configuration issues found.`);
  } else {
    for (const issue of issues) {
      const icon = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : 'ℹ️';
      console.log(`  ${icon} [${issue.severity}] ${issue.file}: ${issue.message}`);
    }
  }
  console.log(`${'='.repeat(60)}\n`);

  process.exit(critical.length > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
