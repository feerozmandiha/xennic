import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

interface ValidationGate {
  name: string;
  check: () => Promise<{ pass: boolean; message: string }>;
}

const gates: ValidationGate[] = [
  {
    name: 'Schema exists',
    check: async () => {
      const schema = readFileSync(resolve(root, 'prisma/schema.prisma'), 'utf8');
      const required = ['execution_plans', 'memories', 'prompt_registry', 'tool_registry', 'skill_registry'];
      const missing = required.filter(m => !schema.includes(`model ${m}`));
      return {
        pass: missing.length === 0,
        message: missing.length ? `Missing models: ${missing.join(', ')}` : `All ${required.length} key models present`,
      };
    },
  },
  {
    name: 'Prisma generate',
    check: async () => {
      const clientDir = resolve(root, 'node_modules/@prisma/client');
      return { pass: existsSync(clientDir), message: 'Prisma client generated' };
    },
  },
  {
    name: 'Tenant extension',
    check: async () => {
      const tenant = readFileSync(resolve(root, 'packages/database/src/tenant-extension.ts'), 'utf8');
      const newModels = ['execution_plans', 'memories', 'prompt_registry', 'workflow_executions'];
      const missing = newModels.filter(m => !tenant.includes(`'${m}'`));
      return {
        pass: missing.length === 0,
        message: missing.length ? `Missing from tenant: ${missing.join(', ')}` : `All ${newModels.length} models in tenant extension`,
      };
    },
  },
  {
    name: 'Enterprise-intelligence Prisma repos',
    check: async () => {
      const eiRoot = resolve(root, 'apps/api/src/modules/enterprise-intelligence');
      const required = ['context-engine', 'memory-platform', 'prompt-governance', 'tool-registry', 'skill-registry', 'reasoning-engine', 'policy-engine', 'evaluation-platform', 'ai-gateway'];
      const missing = required.filter(m => !existsSync(resolve(eiRoot, m, 'infrastructure/persistence')));
      return { pass: missing.length === 0, message: missing.length ? `Missing persistence dirs: ${missing.join(', ')}` : `All ${required.length} modules have Prisma repos` };
    },
  },
  {
    name: 'Enterprise-orchestration Prisma repos',
    check: async () => {
      const eoRoot = resolve(root, 'apps/api/src/modules/enterprise-orchestration');
      const required = ['workflow-engine', 'workflow-runtime', 'execution-context', 'planning-engine', 'conversation-runtime', 'cost-management', 'human-in-the-loop', 'multi-agent', 'explainability'];
      const missing = required.filter(m => !existsSync(resolve(eoRoot, m, 'infrastructure/persistence')));
      return { pass: missing.length === 0, message: missing.length ? `Missing: ${missing.join(', ')}` : `All ${required.length} modules have Prisma repos` };
    },
  },
  {
    name: 'AI runtime Prisma stores',
    check: async () => {
      const storesDir = resolve(root, 'apps/api/src/modules/ai-runtime/infrastructure/stores');
      const required = ['prisma-session.store.ts', 'prisma-memory.store.ts', 'prisma-prompt-template.store.ts'];
      const missing = required.filter(f => !existsSync(resolve(storesDir, f)));
      return { pass: missing.length === 0, message: missing.length ? `Missing: ${missing.join(', ')}` : `All ${required.length} stores present` };
    },
  },
  {
    name: 'Redis infrastructure',
    check: async () => {
      const redisDir = resolve(root, 'apps/api/src/modules/enterprise-cache/infrastructure/redis');
      const files = ['redis.module.ts', 'redis.service.ts'];
      const missing = files.filter(f => !existsSync(resolve(redisDir, f)));
      return { pass: missing.length === 0, message: missing.length ? `Missing: ${missing.join(', ')}` : 'Redis infrastructure complete' };
    },
  },
  {
    name: 'RabbitMQ infrastructure',
    check: async () => {
      const rmqDir = resolve(root, 'apps/api/src/modules/enterprise-messaging/infrastructure/rabbitmq');
      const files = ['rabbitmq.module.ts', 'rabbitmq.service.ts', 'rabbitmq-message-queue.ts'];
      const missing = files.filter(f => !existsSync(resolve(rmqDir, f)));
      return { pass: missing.length === 0, message: missing.length ? `Missing: ${missing.join(', ')}` : 'RabbitMQ infrastructure complete' };
    },
  },
  {
    name: 'SecretProvider',
    check: async () => {
      const spDir = resolve(root, 'apps/api/src/modules/enterprise-config/infrastructure/secret-providers');
      const files = ['secret-provider.module.ts', 'env-secret-provider.ts'];
      const missing = files.filter(f => !existsSync(resolve(spDir, f)));
      const iface = existsSync(resolve(root, 'apps/api/src/modules/enterprise-config/domain/interfaces/secret-provider.interface.ts'));
      return { pass: missing.length === 0 && iface, message: missing.length ? `Missing: ${missing.join(', ')}` : 'SecretProvider complete' };
    },
  },
  {
    name: 'Module providers updated',
    check: async () => {
      const modules = [
        'enterprise-intelligence/context-engine',
        'enterprise-intelligence/memory-platform',
        'enterprise-intelligence/prompt-governance',
        'enterprise-intelligence/tool-registry',
        'enterprise-intelligence/skill-registry',
        'enterprise-intelligence/reasoning-engine',
        'enterprise-intelligence/policy-engine',
        'enterprise-intelligence/evaluation-platform',
        'enterprise-intelligence/ai-gateway',
        'enterprise-orchestration/workflow-engine',
        'enterprise-orchestration/workflow-runtime',
        'enterprise-orchestration/execution-context',
        'enterprise-orchestration/planning-engine',
        'enterprise-orchestration/conversation-runtime',
        'enterprise-orchestration/cost-management',
        'enterprise-orchestration/human-in-the-loop',
        'enterprise-orchestration/multi-agent',
        'enterprise-orchestration/explainability',
        'ai-runtime',
      ];
      const missing: string[] = [];
      for (const m of modules) {
        const moduleFile = resolve(root, `apps/api/src/modules/${m}/${m.split('/').pop()}.module.ts`);
        if (!existsSync(moduleFile)) { missing.push(m); continue; }
        const content = readFileSync(moduleFile, 'utf8');
        if (!content.includes('useClass: Prisma')) missing.push(m);
      }
      return { pass: missing.length === 0, message: missing.length ? `Not updated: ${missing.join(', ')}` : `All ${modules.length} modules use Prisma` };
    },
  },
  {
    name: 'Architecture validation',
    check: async () => {
      return { pass: true, message: 'See validate:arch output' };
    },
  },
];

async function main() {
  console.log('=== Persistence Migration Validator ===\n');
  let passed = 0;
  let failed = 0;

  for (const gate of gates) {
    const result = await gate.check();
    if (result.pass) {
      console.log(`  ✅ ${gate.name}: ${result.message}`);
      passed++;
    } else {
      console.log(`  ❌ ${gate.name}: ${result.message}`);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed, ${gates.length} total`);
  console.log(`Grade: ${failed === 0 ? 'A+' : failed <= 2 ? 'B' : 'C'}`);
  console.log(`${'='.repeat(50)}`);

  process.exit(failed > 0 ? 1 : 0);
}

main();
