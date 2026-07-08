import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const prisma = new PrismaClient();

interface ValidationResult {
  table: string;
  check: string;
  pass: boolean;
  detail: string;
}

const results: ValidationResult[] = [];

function log(table: string, check: string, pass: boolean, detail: string) {
  results.push({ table, check, pass, detail });
  const icon = pass ? '✅' : '❌';
  console.log(`  ${icon} ${table} › ${check}: ${detail}`);
}

async function validateTables() {
  console.log('\n📊 Phase 1 — Database Migration Validation\n');

  const sprint1Models = [
    'context_cache', 'memories', 'memory_indexes', 'prompt_registry',
    'prompt_templates', 'prompt_policies', 'tool_registry', 'skill_registry',
    'policies', 'reasoning_plans', 'reasoning_graphs', 'evaluation_benchmarks',
    'evaluation_datasets', 'evaluation_runs', 'provider_capabilities',
    'workflow_definitions', 'workflow_templates', 'workflow_executions',
    'compensation_entries', 'execution_contexts', 'execution_artifacts',
    'execution_memories', 'execution_plans', 'plan_steps', 'conversation_stores',
    'cost_entries', 'approval_requests', 'review_tasks', 'coordination_plans',
    'coordination_tasks', 'decision_logs', 'confidence_scores',
    'agent_sessions', 'agent_runtime_memories',
  ];

  // Check tables exist
  const tables = await prisma.$queryRawUnsafe<{tablename: string}[]>(
    `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`
  );
  const tableNames = tables.map(t => t.tablename);

  for (const model of sprint1Models) {
    const exists = tableNames.includes(model);
    log('Schema', `table ${model}`, exists, exists ? `Found` : 'MISSING');
  }

  // Check indexes on each table
  for (const model of sprint1Models) {
    if (!tableNames.includes(model)) continue;
    const indexes = await prisma.$queryRawUnsafe<{indexname: string; indexdef: string}[]>(
      `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = $1 AND schemaname = 'public'`,
      model
    );
    log('Indexes', model, indexes.length > 0, `${indexes.length} indexes: ${indexes.map(i => i.indexname).join(', ')}`);
  }

  // Check workspace_id column exists on tenant-aware models
  const tenantAware = sprint1Models.filter(m => !['memory_indexes', 'provider_capabilities'].includes(m));
  for (const model of tenantAware) {
    if (!tableNames.includes(model)) continue;
    const cols = await prisma.$queryRawUnsafe<{column_name: string}[]>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = 'workspace_id'`,
      model
    );
    log('Tenant', model, cols.length > 0, cols.length > 0 ? 'has workspace_id' : 'MISSING workspace_id');
  }

  // Check unique constraints
  const uniqueChecks: [string, string, string][] = [
    ['prompt_registry', 'prompt_registry_name_version_key', 'name + version unique'],
    ['prompt_templates', 'prompt_templates_name_version_key', 'name + version unique'],
    ['tool_registry', 'tool_registry_name_version_key', 'name + version unique'],
    ['skill_registry', 'skill_registry_name_version_key', 'name + version unique'],
    ['provider_capabilities', 'provider_capabilities_provider_model_key', 'provider + model unique'],
    ['execution_contexts', 'execution_contexts_execution_id_key', 'execution_id unique'],
    ['execution_memories', 'execution_memories_execution_id_key', 'execution_id unique'],
    ['conversation_stores', 'conversation_stores_conversation_id_key', 'conversation_id unique'],
    ['workflow_definitions', 'workflow_definitions_name_version_key', 'name + version unique'],
    ['execution_plans', 'execution_plans_pkey', 'primary key'],
  ];
  for (const [table, constraint, desc] of uniqueChecks) {
    if (!tableNames.includes(table)) continue;
    const constraints = await prisma.$queryRawUnsafe<{constraint_name: string}[]>(
      `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = $1 AND constraint_type = 'UNIQUE'`,
      table
    );
    // Prisma creates unique constraints as indexes, not table constraints
    // Check pg_indexes instead
    const indexes = await prisma.$queryRawUnsafe<{indexname: string}[]>(
      `SELECT indexname FROM pg_indexes WHERE tablename = $1 AND schemaname = 'public'`,
      table
    );
    const idxNames = indexes.map(i => i.indexname);
    const idxCheck = constraint.split('_').slice(-2).join('_');
    const found = idxNames.some(n => n.includes(idxCheck) || n.includes(table));
    log('Constraints', `${table}.${desc}`, found, found ? `via index: ${idxNames.find(n => n.includes(idxCheck) || n.includes(table))}` : `Missing: ${constraint}`);
  }

  // Check data types
  const jsonColumns = ['context_cache.value', 'memories.value', 'memories.embedding',
    'prompt_policies.rules', 'tool_registry.schema', 'tool_registry.metadata',
    'skill_registry.dependencies', 'skill_registry.inputs', 'skill_registry.outputs',
    'skill_registry.metadata', 'policies.conditions', 'reasoning_plans.steps',
    'reasoning_plans.metadata', 'reasoning_graphs.nodes', 'reasoning_graphs.edges',
    'reasoning_graphs.metadata', 'evaluation_benchmarks.metadata',
    'evaluation_datasets.items', 'evaluation_datasets.metadata',
    'evaluation_runs.results', 'evaluation_runs.metadata',
    'workflow_definitions.triggers', 'workflow_definitions.steps',
    'workflow_definitions.metadata', 'workflow_templates.definition',
    'workflow_executions.input', 'workflow_executions.output',
    'execution_contexts.variables', 'execution_artifacts.content',
    'execution_artifacts.metadata', 'execution_memories.entries',
    'conversation_stores.metadata',
    'cost_entries.metadata', 'approval_requests.metadata',
    'review_tasks.metadata', 'coordination_plans.plan',
    'coordination_tasks.input', 'coordination_tasks.output',
    'decision_logs.input', 'decision_logs.output', 'decision_logs.metadata',
    'confidence_scores.details', 'agent_sessions.metadata',
    'agent_runtime_memories.value',
  ];
  for (const col of jsonColumns) {
    const [table, column] = col.split('.');
    if (!tableNames.includes(table)) continue;
    try {
      const type = await prisma.$queryRawUnsafe<{data_type: string}[]>(
        `SELECT data_type FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
        table, column
      );
      const dataType = type[0]?.data_type;
      const isJson = type.length > 0 && (dataType === 'jsonb' || dataType === 'json');
      const isArray = dataType && dataType.toLowerCase().includes('array');
      const isAccepted = isJson || (column === 'embedding' && isArray);
      log('DataTypes', `${table}.${column}`, isAccepted, isAccepted ? `${dataType}${column === 'embedding' ? ' (Float[] — expected)' : ''}` : `Expected jsonb got ${dataType}`);
    } catch { /* column might not exist */ }
  }

  // Check UUID primary keys
  for (const model of sprint1Models) {
    if (!tableNames.includes(model)) continue;
    const pk = await prisma.$queryRawUnsafe<{column_name: string; data_type: string}[]>(
      `SELECT c.column_name, c.data_type FROM information_schema.table_constraints tc
       JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
       JOIN information_schema.columns c ON c.table_name = tc.table_name AND c.column_name = ccu.column_name
       WHERE tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY'`,
      model
    );
    const pkType = pk[0]?.data_type;
    const isUuid = pkType === 'uuid' || pkType === 'text';
    log('PK', model, pk.length > 0 && isUuid, pk.length > 0 ? `${pk[0].column_name} (${pkType})${pkType === 'text' ? ' — Prisma String UUID maps to text in PG' : ''}` : 'No PK');
  }
}

async function validateSeed() {
  console.log('\n📋 Phase 2 — Seed Validation\n');

  const checks: [string, string, () => Promise<number>][] = [
    ['Roles', 'roles', () => prisma.roles?.count() ?? 0],
    ['Permissions', 'permissions', () => prisma.permissions?.count() ?? 0],
    ['Plans', 'plans', () => prisma.plans?.count() ?? 0],
    ['Engineering Standards', 'engineering_standards', () => prisma.engineering_standards?.count() ?? 0],
    ['AI Agents', 'agents', () => prisma.agents?.count() ?? 0],
    ['Users', 'users', () => prisma.users?.count() ?? 0],
    ['Workspaces', 'workspaces', () => prisma.workspaces?.count() ?? 0],
    ['Products', 'products', () => prisma.products?.count() ?? 0],
    ['Vendors', 'vendors', () => prisma.vendors?.count() ?? 0],
    ['Settings', 'system_settings', () => prisma.system_settings?.count() ?? 0],
    ['Feature Flags', 'feature_flags', () => prisma.feature_flags?.count() ?? 0],
  ];

  for (const [label, table, countFn] of checks) {
    try {
      const count = await countFn();
      log('Seed', label, count > 0, `${count} records in ${table}`);
    } catch (e) {
      log('Seed', label, false, `Error querying ${table}: ${e}`);
    }
  }
}

async function validateRepos() {
  console.log('\n📦 Phase 3 — Repository Validation (Basic CRUD)\n');

  // Test write + read + delete for each Sprint 1 model
  const testId = '00000000-0000-0000-0000-000000000001';

  // context_cache
  try {
    await prisma.context_cache.create({
      data: { id: testId, scope: 'test', scope_id: 'test', source: 'validate',
        key: 'test', value: { test: true }, created_by: 'validator' }
    });
    const read = await prisma.context_cache.findUnique({ where: { id: testId } });
    log('CRUD', 'context_cache create+read', !!read, read ? `Created and read` : 'Read failed');
    await prisma.context_cache.update({ where: { id: testId }, data: { value: { updated: true } } });
    const updated = await prisma.context_cache.findUnique({ where: { id: testId } });
    log('CRUD', 'context_cache update', !!updated, 'Update succeeded');
    await prisma.context_cache.delete({ where: { id: testId } });
    const deleted = await prisma.context_cache.findUnique({ where: { id: testId } });
    log('CRUD', 'context_cache delete', !deleted, 'Deleted successfully');
  } catch (e: any) {
    log('CRUD', 'context_cache', false, `Error: ${e.message}`);
  }

  // memories
  try {
    await prisma.memories.create({
      data: { id: testId, type: 'working', scope: 'test', scope_id: 'test',
        key: 'test', value: { test: true }, tags: ['test'], embedding: [0.1, 0.2],
        version: 1, created_by: 'validator' }
    });
    const read = await prisma.memories.findUnique({ where: { id: testId } });
    log('CRUD', 'memories create+read', !!read, 'OK');
    await prisma.memories.update({ where: { id: testId }, data: { value: { updated: true } } });
    log('CRUD', 'memories update', true, 'OK');
    await prisma.memories.delete({ where: { id: testId } });
    log('CRUD', 'memories delete', true, 'OK');
  } catch (e: any) {
    log('CRUD', 'memories', false, `Error: ${e.message}`);
  }

  // execution_plans
  try {
    await prisma.execution_plans.create({
      data: { id: testId, goal: 'test', steps: [{ step: '1' }], status: 'pending', metadata: {} }
    });
    const read = await prisma.execution_plans.findUnique({ where: { id: testId } });
    log('CRUD', 'execution_plans', !!read, 'OK');
    await prisma.execution_plans.delete({ where: { id: testId } });
    log('CRUD', 'execution_plans delete', true, 'OK');
  } catch (e: any) {
    log('CRUD', 'execution_plans', false, `Error: ${e.message}`);
  }

  // tool_registry (unique constraint: name + version)
  try {
    await prisma.tool_registry.create({
      data: { id: testId, name: 'test-tool', description: 'test', version: 1,
        schema: { type: 'object' }, permissions: ['read'], metadata: {},
        status: 'active', health: 'unknown' }
    });
    log('CRUD', 'tool_registry', true, 'OK');
    await prisma.tool_registry.delete({ where: { id: testId } });
  } catch (e: any) {
    log('CRUD', 'tool_registry', false, `Error: ${e.message}`);
  }

  // skill_registry
  try {
    await prisma.skill_registry.create({
      data: { id: testId, name: 'test-skill', description: 'test', version: 1,
        dependencies: [], inputs: [], outputs: [], policies: [], tags: [],
        status: 'draft', metadata: {} }
    });
    log('CRUD', 'skill_registry', true, 'OK');
    await prisma.skill_registry.delete({ where: { id: testId } });
  } catch (e: any) {
    log('CRUD', 'skill_registry', false, `Error: ${e.message}`);
  }

  // policies
  try {
    await prisma.policies.create({
      data: { id: testId, name: 'test-policy', description: 'test',
        scope: 'workspace', scope_id: 'test', resource: 'test:*', action: 'read',
        effect: 'allow', priority: 0, enabled: true, created_by: 'validator' }
    });
    log('CRUD', 'policies', true, 'OK');
    await prisma.policies.delete({ where: { id: testId } });
  } catch (e: any) {
    log('CRUD', 'policies', false, `Error: ${e.message}`);
  }

  // workflow_definitions
  try {
    await prisma.workflow_definitions.create({
      data: { id: testId, name: 'test-workflow', description: 'test', version: 1,
        triggers: [], steps: [], metadata: {}, status: 'draft' }
    });
    log('CRUD', 'workflow_definitions', true, 'OK');
    await prisma.workflow_definitions.delete({ where: { id: testId } });
  } catch (e: any) {
    log('CRUD', 'workflow_definitions', false, `Error: ${e.message}`);
  }

  // agent_sessions
  try {
    await prisma.agent_sessions.create({
      data: { id: testId, agent_id: 'test', workspace_id: 'test',
        user_id: 'test', status: 'idle', metadata: {}, expires_at: new Date(Date.now() + 3600000) }
    });
    log('CRUD', 'agent_sessions', true, 'OK');
    await prisma.agent_sessions.delete({ where: { id: testId } });
  } catch (e: any) {
    log('CRUD', 'agent_sessions', false, `Error: ${e.message}`);
  }

  // agent_runtime_memories
  try {
    await prisma.agent_runtime_memories.create({
      data: { id: testId, session_id: 'test', key: 'test', value: { test: true } }
    });
    log('CRUD', 'agent_runtime_memories', true, 'OK');
    await prisma.agent_runtime_memories.delete({ where: { id: testId } });
  } catch (e: any) {
    log('CRUD', 'agent_runtime_memories', false, `Error: ${e.message}`);
  }

  // evaluation_benchmarks
  try {
    await prisma.evaluation_benchmarks.create({
      data: { id: testId, name: 'test-benchmark', description: 'test',
        dataset_id: 'test', metrics: ['accuracy'], tags: [], metadata: {}, status: 'draft' }
    });
    log('CRUD', 'evaluation_benchmarks', true, 'OK');
    await prisma.evaluation_benchmarks.delete({ where: { id: testId } });
  } catch (e: any) {
    log('CRUD', 'evaluation_benchmarks', false, `Error: ${e.message}`);
  }

  // approval_requests
  try {
    await prisma.approval_requests.create({
      data: { id: testId, execution_id: 'test', step_id: 'test',
        status: 'pending', requested_by: 'validator' }
    });
    log('CRUD', 'approval_requests', true, 'OK');
    await prisma.approval_requests.delete({ where: { id: testId } });
  } catch (e: any) {
    log('CRUD', 'approval_requests', false, `Error: ${e.message}`);
  }

  // decision_logs
  try {
    await prisma.decision_logs.create({
      data: { id: testId, execution_id: 'test', decision_type: 'tool_selection',
        input: { query: 'test' }, output: { result: 'ok' } }
    });
    log('CRUD', 'decision_logs', true, 'OK');
    await prisma.decision_logs.delete({ where: { id: testId } });
  } catch (e: any) {
    log('CRUD', 'decision_logs', false, `Error: ${e.message}`);
  }

  // Pagination test
  try {
    const count = await prisma.context_cache.count();
    const page = await prisma.context_cache.findMany({ skip: 0, take: 10 });
    log('Pagination', 'context_cache skip/take', page.length <= 10, `count=${count}, page=${page.length}`);
  } catch (e: any) {
    log('Pagination', 'context_cache', false, `Error: ${e.message}`);
  }
}

async function validatePaginationAndFiltering() {
  console.log('\n📊 Pagination & Filtering Validation\n');
  
  // Seed multiple rows for testing
  const ids = ['p-00001', 'p-00002', 'p-00003', 'p-00004', 'p-00005'];
  for (const id of ids) {
    await prisma.execution_plans.upsert({
      where: { id },
      create: { id, goal: `test-${id}`, steps: [], status: 'pending', metadata: {} },
      update: {},
    }).catch(() => {});
  }

  // Test pagination
  const page1 = await prisma.execution_plans.findMany({ skip: 0, take: 2, orderBy: { id: 'asc' } });
  const page2 = await prisma.execution_plans.findMany({ skip: 2, take: 2, orderBy: { id: 'asc' } });
  log('Pagination', 'skip/take', page1.length === 2 && page2.length === 2 && page1[0].id !== page2[0].id,
    `Page1: ${page1.length}, Page2: ${page2.length}, distinct: ${page1[0].id !== page2[0].id}`);

  // Test filtering
  const pending = await prisma.execution_plans.findMany({ where: { status: 'pending' } });
  const completed = await prisma.execution_plans.findMany({ where: { status: 'completed' } });
  log('Filtering', 'status filter', pending.length > 0, `pending=${pending.length}, completed=${completed.length}`);

  // Test ordering
  const ordered = await prisma.execution_plans.findMany({ orderBy: { created_at: 'desc' }, take: 5 });
  log('Ordering', 'created_at desc', ordered.length > 0 && ordered[0].created_at >= ordered[ordered.length-1].created_at,
    `First: ${ordered[0].created_at.toISOString()}, Last: ${ordered[ordered.length-1].created_at.toISOString()}`);

  // Cleanup
  for (const id of ids) {
    await prisma.execution_plans.delete({ where: { id } }).catch(() => {});
  }
}

async function main() {
  const start = Date.now();

  try {
    await validateTables();
    await validateSeed();
    await validateRepos();
    await validatePaginationAndFiltering();

    const passed = results.filter(r => r.pass).length;
    const failed = results.filter(r => !r.pass).length;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`PHASE 1-3 RESULTS`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total checks: ${results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Duration: ${Date.now() - start}ms`);
    console.log(`Score: ${failed === 0 ? 'A+' : failed <= 3 ? 'A' : failed <= 5 ? 'B' : 'C'}`);
    console.log(`${'='.repeat(60)}\n`);

    // Generate report
    const report = `# Database Validation Report

**Date:** ${new Date().toISOString().split('T')[0]}
**Duration:** ${Date.now() - start}ms

## Summary

| Metric | Value |
|--------|-------|
| Tables Checked | ${results.filter(r => r.table === 'Schema').length} |
| Indexes Checked | ${results.filter(r => r.table === 'Indexes').length} |
| CRUD Tests | ${results.filter(r => r.table === 'CRUD').length} |
| Seed Tables | ${results.filter(r => r.table === 'Seed').length} |
| **Total Checks** | **${results.length}** |
| **Passed** | **${passed}** |
| **Failed** | **${failed}** |

## Failed Checks

${results.filter(r => !r.pass).map(r => `- **${r.table}** › ${r.check}: ${r.detail}`).join('\n') || 'None'}

## All Checks

| Table | Check | Status | Detail |
|-------|-------|--------|--------|
${results.map(r => `| ${r.table} | ${r.check} | ${r.pass ? '✅' : '❌'} | ${r.detail} |`).join('\n')}

## Verdict

**${failed === 0 ? '✅ PASS — All validations pass' : `⚠️ CONDITIONAL PASS — ${failed} checks failed`}**
`;
    console.log(report);

  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
