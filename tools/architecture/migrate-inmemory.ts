#!/usr/bin/env npx tsx
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname, relative, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '../../');
const MODULES_DIR = join(ROOT, 'apps/api/src/modules');

interface Entry { module: string; source: string; class: string; }

const ENTRIES: Entry[] = [
  // enterprise-intelligence
  { module: 'enterprise-intelligence/context-engine', source: 'infrastructure/persistence/in-memory-context-store.ts', class: 'InMemoryContextStore' },
  { module: 'enterprise-intelligence/policy-engine', source: 'infrastructure/persistence/in-memory-policy-repository.ts', class: 'InMemoryPolicyRepository' },
  { module: 'enterprise-intelligence/prompt-governance', source: 'infrastructure/persistence/in-memory-prompt-policy-repo.ts', class: 'InMemoryPromptPolicyRepo' },
  { module: 'enterprise-intelligence/prompt-governance', source: 'infrastructure/persistence/in-memory-prompt-registry.ts', class: 'InMemoryPromptRegistry' },
  { module: 'enterprise-intelligence/prompt-governance', source: 'infrastructure/persistence/in-memory-template-registry.ts', class: 'InMemoryTemplateRegistry' },
  { module: 'enterprise-intelligence/skill-registry', source: 'infrastructure/persistence/in-memory-skill-registry.ts', class: 'InMemorySkillRegistry' },
  { module: 'enterprise-intelligence/ai-gateway', source: 'infrastructure/persistence/in-memory-provider-capability-registry.ts', class: 'InMemoryProviderCapabilityRegistry' },
  { module: 'enterprise-intelligence/memory-platform', source: 'infrastructure/persistence/in-memory-memory-store.ts', class: 'InMemoryMemoryStore' },
  { module: 'enterprise-intelligence/memory-platform', source: 'infrastructure/persistence/in-memory-memory-index.ts', class: 'InMemoryMemoryIndex' },
  { module: 'enterprise-intelligence/evaluation-platform', source: 'infrastructure/persistence/in-memory-evaluation-repository.ts', class: 'InMemoryEvaluationRepository' },
  { module: 'enterprise-intelligence/reasoning-engine', source: 'infrastructure/persistence/in-memory-reasoning-repository.ts', class: 'InMemoryReasoningRepository' },
  { module: 'enterprise-intelligence/tool-registry', source: 'infrastructure/persistence/in-memory-tool-registry.ts', class: 'InMemoryToolRegistry' },
  // enterprise-orchestration
  { module: 'enterprise-orchestration/planning-engine', source: 'infrastructure/persistence/in-memory-planner-repository.ts', class: 'InMemoryPlannerRepository' },
  { module: 'enterprise-orchestration/human-in-the-loop', source: 'infrastructure/persistence/in-memory-hitl-repository.ts', class: 'InMemoryHitlRepository' },
  { module: 'enterprise-orchestration/explainability', source: 'infrastructure/persistence/in-memory-explainability-repository.ts', class: 'InMemoryExplainabilityRepository' },
  { module: 'enterprise-orchestration/multi-agent', source: 'infrastructure/persistence/in-memory-coordination-repository.ts', class: 'InMemoryCoordinationRepository' },
  { module: 'enterprise-orchestration/workflow-engine', source: 'infrastructure/persistence/in-memory-workflow-repository.ts', class: 'InMemoryWorkflowRepository' },
  { module: 'enterprise-orchestration/cost-management', source: 'infrastructure/persistence/in-memory-cost-repository.ts', class: 'InMemoryCostRepository' },
  { module: 'enterprise-orchestration/workflow-runtime', source: 'infrastructure/persistence/in-memory-execution-repository.ts', class: 'InMemoryExecutionRepository' },
  { module: 'enterprise-orchestration/conversation-runtime', source: 'infrastructure/persistence/in-memory-conversation-repository.ts', class: 'InMemoryConversationRepository' },
  { module: 'enterprise-orchestration/execution-context', source: 'infrastructure/persistence/in-memory-context-repository.ts', class: 'InMemoryContextRepository' },
  // ai-runtime (uses stores/ instead of persistence/)
  { module: 'ai-runtime', source: 'infrastructure/stores/in-memory-session.store.ts', class: 'InMemorySessionStore' },
  { module: 'ai-runtime', source: 'infrastructure/stores/in-memory-prompt-template.store.ts', class: 'InMemoryPromptTemplateStore' },
  { module: 'ai-runtime', source: 'infrastructure/stores/in-memory-memory.store.ts', class: 'InMemoryMemoryStore' },
];

function basename(p: string): string { return p.split('/').pop() || p; }
function readFile(p: string): string { try { return readFileSync(p, 'utf8'); } catch { return ''; } }

function collectSpecFiles(dir: string): string[] {
  const results: string[] = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const fp = join(dir, e.name);
      if (e.isDirectory()) results.push(...collectSpecFiles(fp));
      else if (e.name.endsWith('.spec.ts') || e.name.endsWith('.e2e-spec.ts')) results.push(fp);
    }
  } catch { /* skip */ }
  return results;
}

async function main() {
  console.log('🔧 InMemory → testing/adapters/ Migration\n');

  let copied = 0;
  let updated = 0;
  let e2eUpdated = 0;

  for (const entry of ENTRIES) {
    const modulePath = join(MODULES_DIR, entry.module);
    const sourcePath = join(modulePath, entry.source);
    const destDir = join(modulePath, 'testing', 'adapters');
    const destRel = join('testing', 'adapters', basename(entry.source));
    const destPath = join(destDir, basename(entry.source));

    if (!existsSync(sourcePath)) {
      console.log(`  ⚠️  MISSING: ${join(entry.module, entry.source)}`);
      continue;
    }

    // Step 1: Create target + copy file (remove @Injectable)
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

    let content = readFile(sourcePath);
    content = content.replace(/import \{ Injectable \} from ['"]@nestjs\/common['"];?\n?/g, '');
    content = content.replace(/@Injectable\(\)\n/g, '');
    content = content.replace(/\n{3,}/g, '\n\n');
    writeFileSync(destPath, content, 'utf8');
    copied++;
    console.log(`  📦 ${entry.class} → ${join(entry.module, destRel)}`);

    // Step 2: Update spec file imports
    const specFiles = collectSpecFiles(modulePath);
    const sourceBasename = basename(entry.source).replace(/\.ts$/, '');

    for (const specPath of specFiles) {
      const specContent = readFile(specPath);
      const specDir = dirname(specPath);
      const testingDir = join(modulePath, 'testing', 'adapters');
      let rel = relative(specDir, testingDir);
      if (!rel.startsWith('.')) rel = './' + rel;
      const newImport = `${rel}/${sourceBasename}`;

      // Match both ../infrastructure/persistence/ and ../infrastructure/stores/ variants
      // Match both with and without .js extension
      const patterns = [
        `../infrastructure/persistence/${sourceBasename}`,
        `../infrastructure/persistence/${sourceBasename}.js`,
        `../infrastructure/stores/${sourceBasename}`,
        `../infrastructure/stores/${sourceBasename}.js`,
      ];

      let newContent = specContent;
      let changed = false;

      for (const pattern of patterns) {
        if (newContent.includes(pattern)) {
          newContent = newContent.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
          changed = true;
        }
      }

      if (changed) {
        writeFileSync(specPath, newContent, 'utf8');
        updated++;
        console.log(`  📝 Spec: ${relative(ROOT, specPath)}`);
      }
    }
  }

  // Step 3: Update E2E files
  console.log('\n📋 Step 3: E2E files\n');
  const e2eFiles = [
    join(ROOT, 'apps/api/test/enterprise-intelligence.e2e-spec.ts'),
    join(ROOT, 'apps/api/test/enterprise-orchestration.e2e-spec.ts'),
  ];

  for (const e2ePath of e2eFiles) {
    if (!existsSync(e2ePath)) continue;
    let content = readFile(e2ePath);
    let changed = false;

    for (const entry of ENTRIES) {
      const sourceBasename = basename(entry.source).replace(/\.ts$/, '');
      const moduleRel = entry.module;

      // Replace any import path containing `infrastructure/` for this in-memory file
      // with the new `testing/adapters/` path
      const oldPattern = new RegExp(
        `(from\\s+['"][^'"]*?)infrastructure/(?:persistence|stores)/${sourceBasename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\.js)?(['"])`,
        'g'
      );

      const newPath = `../src/modules/${moduleRel}/testing/adapters/${sourceBasename}`;

      if (oldPattern.test(content)) {
        content = readFile(e2ePath);
        content = content.replace(oldPattern, `from '${newPath}$2`);
        writeFileSync(e2ePath, content, 'utf8');
        changed = true;
      }
    }

    if (changed) {
      console.log(`  📝 Updated: ${relative(ROOT, e2ePath)}`);
      e2eUpdated++;
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('  MIGRATION SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`  Files copied to testing/adapters/: ${copied}`);
  console.log(`  Spec files updated:                  ${updated}`);
  console.log(`  E2E files updated:                   ${e2eUpdated}`);
  if (copied < ENTRIES.length) console.log(`  ⚠️  ${ENTRIES.length - copied} files were missing (already migrated?)`);
  console.log('═══════════════════════════════════════\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(2); });
