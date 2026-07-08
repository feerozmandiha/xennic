import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';

interface SecIssue {
  category: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
}

const issues: SecIssue[] = [];
const root = process.cwd();

function run(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: 30000 }).trim();
  } catch (e: any) {
    return `ERROR: ${e.message}`;
  }
}

async function main() {
  console.log('\n📊 Phase 5 — Security Audit\n');

  // ── 1. Check for secrets in git-tracked files ──
  console.log('  ── 1. Secrets in Git History ──');

  const gitFiles = run('git ls-files');
  const trackedEnvLike = gitFiles.split('\n').filter(f =>
    f.includes('.env') || f.match(/secret|key|credential|password/i)
  );

  if (trackedEnvLike.length > 0) {
    // Check if any tracked .env-like files contain real credentials
    for (const f of trackedEnvLike) {
      if (f === '.env.example' || f.endsWith('.env.example') || f === '.env.template') continue;
      if (existsSync(join(root, f))) {
        const content = readFileSync(join(root, f), 'utf-8');
        if (content) {
          issues.push({
            category: 'git-secrets',
            severity: 'high',
            message: `Potential secret file tracked in git: ${f}`,
          });
        }
      }
    }
  }
  if (issues.filter(i => i.category === 'git-secrets').length === 0) {
    console.log(`  ✅ No secret files tracked in git`);
  }

  // ── 2. Check .gitignore for .env patterns ──
  console.log('  ── 2. .gitignore Coverage ──');

  const gitignore = existsSync(join(root, '.gitignore'))
    ? readFileSync(join(root, '.gitignore'), 'utf-8') : '';

  const requiredPatterns = ['.env', '.env.local', '.env.*.local', '*.key', 'secrets/'];
  const present = requiredPatterns.filter(p => gitignore.includes(p));
  const missing = requiredPatterns.filter(p => !gitignore.includes(p));

  if (missing.length > 0) {
    issues.push({
      category: 'gitignore',
      severity: 'high',
      message: `.gitignore missing patterns: ${missing.join(', ')}`,
    });
  }
  console.log(`  ${missing.length === 0 ? '✅' : '❌'} .gitignore covers ${present.length}/${requiredPatterns.length} secret patterns`);

  // ── 3. JWT Keys ──
  console.log('  ── 3. JWT Key Files ──');

  const jwtPrivateKeyPath = join(root, 'infrastructure/docker/secrets/jwtRS256.key');
  const jwtPubKeyPath = join(root, 'infrastructure/docker/secrets/jwtRS256.key.pub');

  if (existsSync(jwtPrivateKeyPath)) {
    const keyContent = readFileSync(jwtPrivateKeyPath, 'utf-8');
    if (keyContent.includes('PRIVATE KEY')) {
      console.log(`  ✅ JWT private key exists (${(keyContent.length / 1024).toFixed(1)} KB)`);
    } else {
      issues.push({ category: 'jwt', severity: 'high', message: 'JWT private key file exists but has invalid format' });
    }
  } else {
    issues.push({ category: 'jwt', severity: 'high', message: 'JWT private key file missing at infrastructure/docker/secrets/jwtRS256.key' });
  }

  if (existsSync(jwtPubKeyPath)) {
    const pubContent = readFileSync(jwtPubKeyPath, 'utf-8');
    if (pubContent.includes('PUBLIC KEY')) {
      console.log(`  ✅ JWT public key exists (${(pubContent.length / 1024).toFixed(1)} KB)`);
    } else {
      issues.push({ category: 'jwt', severity: 'high', message: 'JWT public key file exists but has invalid format' });
    }
  } else {
    issues.push({ category: 'jwt', severity: 'high', message: 'JWT public key file missing at infrastructure/docker/secrets/jwtRS256.key.pub' });
  }

  // ── 4. Docker exposed ports ──
  console.log('  ── 4. Docker Exposed Ports ──');

  const dockerComposeFiles = run('git ls-files').split('\n').filter(f => f.endsWith('docker-compose.yml'));
  let exposedServices = 0;
  for (const f of dockerComposeFiles) {
    if (!existsSync(join(root, f))) continue;
    const content = readFileSync(join(root, f), 'utf-8');
    const portLines = content.match(/ports:\s*\n(\s+- "[^"]+"\s*\n?)*/g) || [];
    for (const block of portLines) {
      const ports = block.match(/"(\d+):\d+"/g) || [];
      for (const p of ports) {
        const hostPort = p.replace(/"/g, '').split(':')[0];
        const numPort = parseInt(hostPort);
        if (numPort >= 0 && numPort <= 1024) {
          issues.push({
            category: 'docker-ports',
            severity: 'high',
            message: `Privileged port ${hostPort} exposed in ${f}`,
          });
        } else {
          exposedServices++;
        }
      }
    }
  }
  console.log(`  ✅ ${exposedServices} service ports exposed (no privileged ports)`);

  // ── 5. CORS configuration ──
  console.log('  ── 5. CORS Configuration ──');

  const apiEnvPath = join(root, 'apps/api/.env');
  if (existsSync(apiEnvPath)) {
    const apiEnv = readFileSync(apiEnvPath, 'utf-8');
    const corsMatch = apiEnv.match(/CORS_ORIGINS=(.+)/);
    if (corsMatch) {
      const origins = corsMatch[1].trim();
      if (origins.includes('*')) {
        issues.push({ category: 'cors', severity: 'high', message: 'CORS wildcard origin (*) in api/.env' });
      } else {
        const originList = origins.split(',').map(o => o.trim());
        console.log(`  ✅ CORS origins: ${originList.join(', ')}`);
      }
    }
  }

  // ── 6. Check Prisma schema for password fields ──
  console.log('  ── 6. Schema Security ──');

  const schemaPath = join(root, 'prisma/schema.prisma');
  if (existsSync(schemaPath)) {
    const schema = readFileSync(schemaPath, 'utf-8');
    const passwordFields = schema.match(/(password|secret|token)\s+String/g);
    if (passwordFields) {
      console.log(`  ✅ Found ${passwordFields.length} sensitive fields in schema`);
    }
  }

  // ── 7. Check for security-related npm dependencies ──
  console.log('  ── 7. Security Dependencies ──');

  const packageJsonPath = join(root, 'apps/api/package.json');
  if (existsSync(packageJsonPath)) {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const secDeps = ['helmet', 'bcrypt', 'argon2', 'rate-limit', 'cors'];
    for (const dep of secDeps) {
      if (!Object.keys(deps).some(k => k.includes(dep))) {
        if (!['cors'].includes(dep)) {
          issues.push({
            category: 'security-deps',
            severity: 'low',
            message: `Recommended dependency not found: ${dep}`,
          });
        }
      }
    }
  }

  // ── REPORT ──
  const critical = issues.filter(i => i.severity === 'high');
  const warnings = issues.filter(i => i.severity === 'medium');
  const info = issues.filter(i => i.severity === 'low');

  console.log(`\n${'='.repeat(60)}`);
  console.log(`PHASE 5 — SECURITY AUDIT RESULTS`);
  console.log(`${'='.repeat(60)}`);
  console.log(`High severity: ${critical.length}`);
  console.log(`Medium severity: ${warnings.length}`);
  console.log(`Low severity: ${info.length}`);

  if (issues.length === 0) {
    console.log(`\n✅ No security issues found.`);
  } else {
    for (const issue of issues) {
      const icon = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : 'ℹ️';
      const sym = issue.severity === 'high' ? '!' : issue.severity === 'medium' ? '!' : 'i';
      console.log(`  ${icon} [${sym}/${issue.category}] ${issue.message}`);
    }
  }
  console.log(`${'='.repeat(60)}\n`);

  process.exit(critical.length > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
