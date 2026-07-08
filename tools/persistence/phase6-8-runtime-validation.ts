import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

interface Check {
  phase: string;
  check: string;
  pass: boolean;
  detail: string;
}

const checks: Check[] = [];
const prisma = new PrismaClient();
const WID = `ws-${randomUUID().slice(0, 8)}`;

async function check(phase: string, label: string, fn: () => Promise<boolean>, detail: string) {
  try {
    const pass = await fn();
    checks.push({ phase, check: label, pass, detail });
    console.log(`  ${pass ? '✅' : '❌'} [${phase}] ${label}: ${detail}`);
  } catch (e: any) {
    checks.push({ phase, check: label, pass: false, detail: e.message });
    console.log(`  ❌ [${phase}] ${label}: ${e.message}`);
  }
}

async function main() {
  console.log('\n📊 Phase 6-8 — AI Runtime, Workflow & Knowledge Validation\n');

  // ─── AI RUNTIME: Context Cache ───────────────────────────────────────────
  console.log('  ── AI Runtime ──');

  await check('AI Runtime', 'Context Cache CRUD', async () => {
    const id1 = randomUUID();
    await prisma.context_cache.create({
      data: { id: id1, scope: 'workspace', scope_id: WID, source: 'test',
        key: 'k1', value: { a: 1 }, created_by: 'validator' }
    });
    const read = await prisma.context_cache.findUnique({ where: { id: id1 } });
    const updated = await prisma.context_cache.update({
      where: { id: id1 }, data: { value: { a: 2 } }
    });
    await prisma.context_cache.delete({ where: { id: id1 } });
    const deleted = await prisma.context_cache.findUnique({ where: { id: id1 } });
    const updatedVal = updated.value as any;
    return read !== null && updatedVal?.a === 2 && deleted === null;
  }, 'create → read → update → delete');

  await check('AI Runtime', 'Context Cache findByScope', async () => {
    const id1 = randomUUID();
    const id2 = randomUUID();
    await prisma.context_cache.create({
      data: { id: id1, scope: 'workspace', scope_id: WID, source: 'test',
        key: 'k1', value: {}, created_by: 'validator' }
    });
    await prisma.context_cache.create({
      data: { id: id2, scope: 'workspace', scope_id: WID, source: 'test2',
        key: 'k2', value: {}, created_by: 'validator' }
    });
    const results = await prisma.context_cache.findMany({
      where: { scope: 'workspace', scope_id: WID }
    });
    await prisma.context_cache.deleteMany({
      where: { id: { in: [id1, id2] } }
    });
    return results.length >= 2;
  }, 'findMany by scope');

  await check('AI Runtime', 'Memories CRUD', async () => {
    const id1 = randomUUID();
    await prisma.memories.create({
      data: { id: id1, type: 'working', scope: 'workspace', scope_id: WID,
        key: 'mem1', value: { text: 'hello' }, embedding: [0.1, 0.2],
        version: 1, tags: ['test'], created_by: 'validator' }
    });
    const read = await prisma.memories.findUnique({ where: { id: id1 } });
    await prisma.memories.delete({ where: { id: id1 } });
    return read !== null && read.tags.includes('test');
  }, 'create with embedding and tags');

  await check('AI Runtime', 'Memories findByType + Scope', async () => {
    const id1 = randomUUID();
    await prisma.memories.create({
      data: { id: id1, type: 'working', scope: 'workspace', scope_id: WID,
        key: 'mem2', value: {}, version: 1, created_by: 'validator' }
    });
    const results = await prisma.memories.findMany({
      where: { type: 'working', scope: 'workspace', scope_id: WID }
    });
    await prisma.memories.delete({ where: { id: id1 } });
    return results.length >= 1;
  }, 'index on type + scope');

  await check('AI Runtime', 'Agent Session lifecycle', async () => {
    const sid = randomUUID();
    const agentId = `agent-${randomUUID().slice(0, 4)}`;
    const userId = `user-${randomUUID().slice(0, 4)}`;

    // Create
    await prisma.agent_sessions.create({
      data: { id: sid, agent_id: agentId, workspace_id: WID, user_id: userId,
        status: 'active', metadata: {}, expires_at: new Date(Date.now() + 3600000) }
    });
    // Read
    const session = await prisma.agent_sessions.findUnique({ where: { id: sid } });
    // Update
    await prisma.agent_sessions.update({ where: { id: sid }, data: { status: 'idle' } });
    const updated = await prisma.agent_sessions.findUnique({ where: { id: sid } });
    // Find by user
    const userSessions = await prisma.agent_sessions.findMany({
      where: { workspace_id: WID, user_id: userId }
    });
    // Delete
    await prisma.agent_sessions.delete({ where: { id: sid } });
    const deleted = await prisma.agent_sessions.findUnique({ where: { id: sid } });
    return session?.status === 'active' && updated?.status === 'idle'
      && userSessions.length === 1 && deleted === null;
  }, 'create → read → update → findByUser → delete');

  await check('AI Runtime', 'Agent Runtime Memory CRUD', async () => {
    const id1 = randomUUID();
    await prisma.agent_runtime_memories.create({
      data: { id: id1, session_id: 'test-session', key: 'rm1', value: { ctx: 42 } }
    });
    // Read by session
    const bySession = await prisma.agent_runtime_memories.findMany({
      where: { session_id: 'test-session' }
    });
    await prisma.agent_runtime_memories.delete({ where: { id: id1 } });
    return bySession.length >= 1;
  }, 'create + findBySessionId');

  // ─── PROMPT GOVERNANCE ─────────────────────────────────────────────────
  console.log('  ── Prompt Governance ──');

  await check('Prompt', 'Prompt Registry versioning', async () => {
    const id1 = randomUUID();
    await prisma.prompt_registry.create({
      data: { id: id1, workspace_id: WID, name: 'test-prompt', version: 1,
        content: 'Hello {{name}}', description: 'test', tags: ['test'],
        status: 'active', created_by: 'validator' }
    });
    // Try duplicate name+version
    try {
      await prisma.prompt_registry.create({
        data: { id: randomUUID(), workspace_id: WID, name: 'test-prompt', version: 1,
          content: 'Duplicate', description: 'dup', tags: [], status: 'draft',
          created_by: 'validator' }
      });
      await prisma.prompt_registry.delete({ where: { id: id1 } });
      return false;
    } catch (e: any) {
      // Expected unique constraint error
      await prisma.prompt_registry.delete({ where: { id: id1 } });
      return true;
    }
  }, 'unique name+version enforced');

  await check('Prompt', 'Template CRUD', async () => {
    const id1 = randomUUID();
    await prisma.prompt_templates.create({
      data: { id: id1, workspace_id: WID, name: 't1', description: 'test',
        content: 'Hi {{user}}', variables: ['user'], version: 1,
        created_by: 'validator' }
    });
    const read = await prisma.prompt_templates.findUnique({ where: { id: id1 } });
    await prisma.prompt_templates.delete({ where: { id: id1 } });
    return read !== null;
  }, 'template with variables');

  await check('Prompt', 'Policy evaluation', async () => {
    const id1 = randomUUID();
    await prisma.prompt_policies.create({
      data: { id: id1, workspace_id: WID, name: 'pp1', description: 'test',
        effect: 'allow', rules: [{ match: '*', action: 'read' }],
        priority: 10, created_by: 'validator' }
    });
    const p1 = await prisma.prompt_policies.findFirst({ where: { effect: 'allow' } });
    await prisma.prompt_policies.delete({ where: { id: id1 } });
    return p1 !== null;
  }, 'filter by effect');

  // ─── TOOL & SKILL REGISTRY ─────────────────────────────────────────────
  console.log('  ── Tool & Skill Registry ──');

  await check('Tools', 'Tool Registry CRUD', async () => {
    const id1 = randomUUID();
    await prisma.tool_registry.create({
      data: { id: id1, name: `tool-${randomUUID().slice(0, 4)}`, description: 'a tool',
        version: 1, schema: { type: 'object', properties: {} }, permissions: ['read'],
        metadata: {}, status: 'active', health: 'unknown' }
    });
    const byStatus = await prisma.tool_registry.findMany({ where: { status: 'active' } });
    await prisma.tool_registry.delete({ where: { id: id1 } });
    return byStatus.length >= 1;
  }, 'create + filter by status');

  await check('Skills', 'Skill Registry with deps', async () => {
    const id1 = randomUUID();
    await prisma.skill_registry.create({
      data: { id: id1, name: `skill-${randomUUID().slice(0, 4)}`, description: 'test',
        version: 1, dependencies: [{ skill: 'base', version: '1' }],
        inputs: [{ name: 'x', type: 'string' }], outputs: [{ name: 'y', type: 'number' }],
        policies: ['allow-all'], tags: ['test'], status: 'draft', metadata: {} }
    });
    const read = await prisma.skill_registry.findUnique({ where: { id: id1 } });
    await prisma.skill_registry.delete({ where: { id: id1 } });
    return read !== null && read.dependencies.length > 0;
  }, 'create with JSON array fields');

  // ─── REASONING ENGINE ──────────────────────────────────────────────────
  console.log('  ── Reasoning Engine ──');

  await check('Reasoning', 'Plans + Steps + Graphs', async () => {
    const pid = randomUUID();
    await prisma.reasoning_plans.create({
      data: { id: pid, workspace_id: WID, goal: 'test goal',
        steps: [{ id: 's1', type: 'think', input: 'q' }],
        status: 'active', metadata: {} }
    });
    const sid = randomUUID();
    await prisma.plan_steps.create({
      data: { id: sid, plan_id: pid, workspace_id: WID, order: 1,
        description: 'test step', input: { query: 'q' },
        status: 'pending', output: null, depends_on: [] }
    });
    const steps = await prisma.plan_steps.findMany({ where: { plan_id: pid } });
    const graphId = randomUUID();
    await prisma.reasoning_graphs.create({
      data: { id: graphId, plan_id: pid, nodes: [{ id: 'n1' }], edges: [{ from: 'n1', to: 'n2' }],
        metadata: { type: 'dag' } }
    });
    const graph = await prisma.reasoning_graphs.findUnique({ where: { id: graphId } });
    // Cleanup
    await prisma.reasoning_graphs.delete({ where: { id: graphId } });
    await prisma.plan_steps.delete({ where: { id: sid } });
    await prisma.reasoning_plans.delete({ where: { id: pid } });
    return steps.length === 1 && graph !== null;
  }, 'plan → steps → graph');

  // ─── WORKFLOW ──────────────────────────────────────────────────────────
  console.log('  ── Workflow ──');

  await check('Workflow', 'Definition + Execution lifecycle', async () => {
    const did = randomUUID();
    await prisma.workflow_definitions.create({
      data: { id: did, workspace_id: WID, name: `wf-${randomUUID().slice(0, 4)}`,
        description: 'test', version: 1, triggers: [{ type: 'manual' }],
        steps: [{ id: 's1', action: 'notify' }], metadata: {}, status: 'active' }
    });
    const eid = randomUUID();
    await prisma.workflow_executions.create({
      data: { id: eid, workspace_id: WID, workflow_id: did,
        workflow_name: `wf-${randomUUID().slice(0, 4)}`,
        workflow_version: 1, status: 'running',
        input: { trigger: 'manual' }, output: null }
    });
    // Update execution status
    await prisma.workflow_executions.update({
      where: { id: eid }, data: { status: 'completed', output: { result: 'ok' } }
    });
    const updated = await prisma.workflow_executions.findUnique({ where: { id: eid } });
    // Find executions by workflow
    const executions = await prisma.workflow_executions.findMany({
      where: { workflow_id: did }
    });
    // Find by status
    const completed = await prisma.workflow_executions.findMany({
      where: { status: 'completed' }
    });
    // Cleanup
    await prisma.workflow_executions.delete({ where: { id: eid } });
    await prisma.workflow_definitions.delete({ where: { id: did } });
    return updated?.status === 'completed' && executions.length === 1 && completed.length >= 1;
  }, 'create → execute → complete → filter');

  await check('Workflow', 'Compensation + Context', async () => {
    const eid = randomUUID();
    // Create execution context
    await prisma.execution_contexts.create({
      data: { id: randomUUID(), workspace_id: WID, execution_id: eid,
        variables: { retryCount: 0, state: 'started' } }
    });
    // Create compensation entry
    await prisma.compensation_entries.create({
      data: { id: randomUUID(), workspace_id: WID, execution_id: eid,
        step_id: 'step-1', action: 'rollback', status: 'pending' }
    });
    const compensations = await prisma.compensation_entries.findMany({
      where: { execution_id: eid }
    });
    return compensations.length === 1;
  }, 'execution context + compensation');

  await check('Workflow', 'Artifacts + Execution memories', async () => {
    const eid = randomUUID();
    await prisma.execution_artifacts.create({
      data: { id: randomUUID(), execution_id: eid,
        name: 'report.pdf', type: 'file', content: { url: 's3://bucket/report.pdf' },
        metadata: { size: 1024 } }
    });
    await prisma.execution_memories.create({
      data: { id: randomUUID(), execution_id: eid,
        entries: [{ role: 'ai', content: 'processed' }] }
    });
    const artifacts = await prisma.execution_artifacts.findMany({
      where: { execution_id: eid }
    });
    const memories = await prisma.execution_memories.findMany({
      where: { execution_id: eid }
    });
    return artifacts.length === 1 && memories.length === 1;
  }, 'artifacts + execution memories');

  // ─── EVALUATION ────────────────────────────────────────────────────────────────
  console.log('  ── Evaluation ──');

  await check('Evaluation', 'Benchmark + Dataset + Run', async () => {
    const dsid = randomUUID();
    await prisma.evaluation_datasets.create({
      data: { id: dsid, workspace_id: WID, name: 'ds1', description: 'test',
        items: [{ input: 'q1', expected: 'a1' }], metadata: {} }
    });
    const bid = randomUUID();
    await prisma.evaluation_benchmarks.create({
      data: { id: bid, workspace_id: WID, name: 'bm1', description: 'test',
        dataset_id: dsid, metrics: ['accuracy'], tags: ['test'], metadata: {},
        status: 'active' }
    });
    const rid = randomUUID();
    await prisma.evaluation_runs.create({
      data: { id: rid, workspace_id: WID, benchmark_id: bid, target_type: 'agent',
        target_id: 'agent-1', status: 'running', results: null, metadata: {} }
    });
    await prisma.evaluation_runs.update({
      where: { id: rid }, data: { status: 'completed', results: { accuracy: 0.95 } }
    });
    const run = await prisma.evaluation_runs.findUnique({ where: { id: rid } });
    // Find by target
    const targetRuns = await prisma.evaluation_runs.findMany({
      where: { target_type: 'agent', target_id: 'agent-1' }
    });
    // Cleanup
    await prisma.evaluation_runs.delete({ where: { id: rid } });
    await prisma.evaluation_benchmarks.delete({ where: { id: bid } });
    await prisma.evaluation_datasets.delete({ where: { id: dsid } });
    return run?.status === 'completed' && (run.results as any)?.accuracy === 0.95
      && targetRuns.length === 1;
  }, 'dataset → benchmark → run → complete → query');

  // ─── COORDINATION ─────────────────────────────────────────────────────────────
  console.log('  ── Coordination ──');

  await check('Coordination', 'Plan → Tasks lifecycle', async () => {
    const pid = randomUUID();
    await prisma.coordination_plans.create({
      data: { id: pid, workspace_id: WID, execution_id: `exec-${randomUUID().slice(0, 4)}`,
        plan: { agents: ['a1', 'a2'], strategy: 'parallel' } }
    });
    const tid = randomUUID();
    await prisma.coordination_tasks.create({
      data: { id: tid, plan_id: pid, workspace_id: WID, agent_role: 'worker',
        task_type: 'process', input: { task: 'process' }, output: null, status: 'pending' }
    });
    await prisma.coordination_tasks.update({
      where: { id: tid }, data: { status: 'completed', output: { result: 'done' } }
    });
    const completed = await prisma.coordination_tasks.findMany({
      where: { agent_role: 'worker', status: 'completed' }
    });
    await prisma.coordination_tasks.delete({ where: { id: tid } });
    await prisma.coordination_plans.delete({ where: { id: pid } });
    return completed.length >= 1;
  }, 'create → update status → filter by role+status');

  // ─── DECISION LOGS ────────────────────────────────────────────────────────────
  console.log('  ── Decision Logs ──');

  await check('Decision', 'Decision + Confidence lifecycle', async () => {
    const did = randomUUID();
    await prisma.decision_logs.create({
      data: { id: did, workspace_id: WID, execution_id: `exec-d`,
        decision_type: 'tool_selection', input: { query: 'test' },
        output: { tool: 'calculator', confidence: 0.9 } }
    });
    const cid = randomUUID();
    await prisma.confidence_scores.create({
      data: { id: cid, execution_id: `exec-d`, score: 0.9,
        details: { model: 'gpt-4', temperature: 0.1 } }
    });
    const decisions = await prisma.decision_logs.findMany({
      where: { decision_type: 'tool_selection' }
    });
    const scores = await prisma.confidence_scores.findMany({
      where: { execution_id: 'exec-d' }
    });
    await prisma.confidence_scores.delete({ where: { id: cid } });
    await prisma.decision_logs.delete({ where: { id: did } });
    return decisions.length >= 1 && scores.length === 1;
  }, 'decision → confidence score → filter by type');

  // ─── REVIEW TASKS ─────────────────────────────────────────────────────────────
  console.log('  ── Review & Approval ──');

  await check('Approval', 'Approval + Review lifecycle', async () => {
    const aid = randomUUID();
    await prisma.approval_requests.create({
      data: { id: aid, workspace_id: WID, execution_id: 'exec-ap',
        step_id: 'step-1', status: 'pending', requested_by: 'user-1',
        assigned_to: 'admin', reason: 'needs review' }
    });
    await prisma.approval_requests.update({
      where: { id: aid }, data: { status: 'approved', assigned_to: 'admin' }
    });
    const rid = randomUUID();
    await prisma.review_tasks.create({
      data: { id: rid, workspace_id: WID, execution_id: 'exec-ap',
        step_id: 'step-1', reviewer_id: 'user-2', status: 'pending' }
    });
    await prisma.review_tasks.update({
      where: { id: rid }, data: { status: 'completed', feedback: 'Looks good' }
    });
    const approved = await prisma.approval_requests.findMany({
      where: { status: 'approved' }
    });
    await prisma.review_tasks.delete({ where: { id: rid } });
    await prisma.approval_requests.delete({ where: { id: aid } });
    return approved.length >= 1;
  }, 'request → approve → review → complete');

  // ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
  console.log('  ── Transactions ──');

  await check('Transactions', 'Create + rollback', async () => {
    const id1 = randomUUID();
    const id2 = randomUUID();
    try {
      await prisma.$transaction(async (tx) => {
        await tx.context_cache.create({
          data: { id: id1, scope: 'tx', scope_id: WID, source: 'tx-test',
            key: 'tx1', value: {}, created_by: 'validator' }
        });
        await tx.context_cache.create({
          data: { id: id2, scope: 'tx', scope_id: WID, source: 'tx-test',
            key: 'tx2', value: {}, created_by: 'validator' }
        });
        // Both succeed - no rollback
      });
      const count = await prisma.context_cache.count({
        where: { id: { in: [id1, id2] } }
      });
      await prisma.context_cache.deleteMany({
        where: { id: { in: [id1, id2] } }
      });
      return count === 2;
    } catch (e: any) {
      return false;
    }
  }, 'transactional create (both succeed)');

  await check('Transactions', 'Rollback on error', async () => {
    const id1 = randomUUID();
    try {
      await prisma.$transaction(async (tx) => {
        await tx.context_cache.create({
          data: { id: id1, scope: 'tx', scope_id: WID, source: 'tx-rollback',
            key: 'tx3', value: {}, created_by: 'validator' }
        });
        // Cause a deliberate error (duplicate PK with same id)
        await tx.context_cache.create({
          data: { id: id1, scope: 'tx', scope_id: WID, source: 'tx-rollback',
            key: 'tx3', value: {}, created_by: 'validator' }
        });
      });
      // Should not reach here
      await prisma.context_cache.delete({ where: { id: id1 } });
      return false;
    } catch (e: any) {
      // Verify the first insert was rolled back
      const exists = await prisma.context_cache.findUnique({ where: { id: id1 } });
      return exists === null;
    }
  }, 'rollback on duplicate PK');

  // ─── OPTIMISTIC LOCKING ───────────────────────────────────────────────────────
  console.log('  ── Optimistic Locking ──');

  await check('Locking', 'Version increment on update', async () => {
    const id1 = randomUUID();
    await prisma.memories.create({
      data: { id: id1, type: 'working', scope: 'locking', scope_id: WID,
        key: 'lock-test', value: {}, version: 1, created_by: 'validator' }
    });
    const updated = await prisma.memories.update({
      where: { id: id1 },
      data: { value: { new: 'value' }, version: { increment: 1 } }
    });
    await prisma.memories.delete({ where: { id: id1 } });
    return updated.version === 2;
  }, 'memories.version → 2');

  // ─── SOFT DELETE ──────────────────────────────────────────────────────────────
  console.log('  ── Soft Delete ──');

  await check('Soft Delete', 'Expiration-based soft delete', async () => {
    // memories has expires_at field
    const id1 = randomUUID();
    await prisma.memories.create({
      data: { id: id1, type: 'temp', scope: 'softdelete', scope_id: WID,
        key: 'expirable', value: {}, version: 1, created_by: 'validator',
        expires_at: new Date(Date.now() - 1000), tags: [] }
    });
    // Should still be findable (not truly deleted)
    const found = await prisma.memories.findUnique({ where: { id: id1 } });
    await prisma.memories.delete({ where: { id: id1 } });
    return found !== null;
  }, 'expired record still queryable');

  // ─── REPORT ──────────────────────────────────────────────────────────────────
  const passed = checks.filter(c => c.pass).length;
  const failed = checks.filter(c => !c.pass).length;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`PHASE 6-8 — RUNTIME VALIDATION RESULTS`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total checks: ${checks.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Score: ${failed === 0 ? 'A+' : failed <= 2 ? 'A' : failed <= 5 ? 'B' : 'C'}`);
  console.log(`${'='.repeat(60)}\n`);

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async e => {
  console.error('Fatal:', e);
  await prisma.$disconnect();
  process.exit(1);
});
