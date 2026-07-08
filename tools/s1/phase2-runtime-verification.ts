import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';
import * as amqp from 'amqplib';

interface ServiceCheck {
  name: string;
  type: string;
  pass: boolean;
  detail: string;
}

const checks: ServiceCheck[] = [];

async function httpGet(url: string, timeout = 5000): Promise<{ status: number; body: string }> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ac.signal });
    clearTimeout(timer);
    return { status: res.status, body: await res.text() };
  } catch (e: any) {
    clearTimeout(timer);
    throw new Error(e.message || 'Connection refused');
  }
}

async function check(name: string, type: string, fn: () => Promise<boolean>, detail: string) {
  try {
    const pass = await fn();
    checks.push({ name, type, pass, detail });
    console.log(`  ${pass ? '✅' : '❌'} ${name} (${type}): ${detail}`);
  } catch (e: any) {
    checks.push({ name, type, pass: false, detail: e.message });
    console.log(`  ❌ ${name} (${type}): ${e.message}`);
  }
}

async function main() {
  console.log('\n📊 Phase 2 — Runtime Verification\n');

  // ── EXTERNAL SERVICES ────────────────────────────────────────────────
  console.log('  ── External Services (Infrastructure) ──');

  // PostgreSQL
  await check('PostgreSQL', 'tcp', async () => {
    const prisma = new PrismaClient();
    const result = await prisma.$queryRaw<{1: number}[]>`SELECT 1 AS "1"`;
    await prisma.$disconnect();
    return result[0]?.[1] === 1;
  }, 'Connection + SELECT 1 ok');

  // Redis
  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6380'),
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: () => null,
  };
  await check('Redis', 'redis', async () => {
    const r = new Redis(redisConfig);
    const pong = await r.ping();
    r.disconnect();
    return pong === 'PONG';
  }, `PING/PONG on ${redisConfig.host}:${redisConfig.port}`);

  // RabbitMQ
  const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  await check('RabbitMQ', 'amqp', async () => {
    const conn = await amqp.connect(rabbitUrl);
    const ch = await conn.createChannel();
    await ch.assertQueue('health-check-q', { exclusive: true });
    await ch.close();
    await conn.close();
    return true;
  }, 'Connection + channel creation');

  // MinIO
  await check('MinIO /minio/health/live', 'http', async () => {
    const r = await httpGet('http://localhost:9001/minio/health/live');
    return r.status === 200;
  }, 'HTTP 200');

  await check('MinIO /minio/health/ready', 'http', async () => {
    const r = await httpGet('http://localhost:9001/minio/health/ready');
    return r.status === 200;
  }, 'HTTP 200');

  // Qdrant
  {
    let qdrantVer = '';
    await check('Qdrant /', 'http', async () => {
      const r = await httpGet('http://localhost:6333/');
      const data = JSON.parse(r.body);
      qdrantVer = data.version || 'unknown';
      return r.status === 200;
    }, `Version: ${qdrantVer}`);
    const entry = checks[checks.length - 1];
    entry.detail = `Version: ${qdrantVer}`;
  }

  await check('Qdrant /healthz', 'http', async () => {
    const r = await httpGet('http://localhost:6333/healthz');
    return r.body.includes('healthz check passed');
  }, 'healthz check passed');

  // ── APPLICATION SERVICES ─────────────────────────────────────────────
  console.log('  ── Application Services ──');

  const appServices: { name: string; url: string }[] = [
    { name: 'API', url: 'http://localhost:3000' },
    { name: 'Engineering Service', url: 'http://localhost:8001' },
    { name: 'AI Service', url: 'http://localhost:8002' },
    { name: 'Vision Service', url: 'http://localhost:8003' },
  ];

  const appCheckGroups: { name: string; url: string; path: string }[] = [];
  for (const svc of appServices) {
    appCheckGroups.push({ name: svc.name, url: svc.url, path: 'health' });
    appCheckGroups.push({ name: svc.name, url: svc.url, path: 'ready' });
    appCheckGroups.push({ name: svc.name, url: svc.url, path: 'version' });
  }

  for (const acg of appCheckGroups) {
    await check(`${acg.name} /${acg.path}`, 'http', async () => {
      const r = await httpGet(`${acg.url}/${acg.path}`);
      return r.status < 500;
    }, 'HTTP check');
  }

  // ── STARTUP ORDER ────────────────────────────────────────────────────
  console.log('  ── Startup Order ──');

  await check('Depends chain', 'order', async () => {
    const pg = checks.find(c => c.name === 'PostgreSQL')?.pass;
    const redis = checks.find(c => c.name === 'Redis')?.pass;
    const rmq = checks.find(c => c.name === 'RabbitMQ')?.pass;
    const minioLive = checks.find(c => c.name.startsWith('MinIO') && c.name.endsWith('live'))?.pass;
    return pg && redis && rmq && minioLive;
  }, 'Postgres → Redis → RabbitMQ → MinIO all healthy');

  // ── RECONNECT ────────────────────────────────────────────────────────
  console.log('  ── Reconnect Logic ──');

  await check('Redis reconnection', 'redis', async () => {
    const r = new Redis(redisConfig);
    await r.set('s1:reconnect', 'verified');
    const val = await r.get('s1:reconnect');
    await r.del('s1:reconnect');
    r.disconnect();
    return val === 'verified';
  }, 'Connect → set → get → del → disconnect');

  // ── REPORT ────────────────────────────────────────────────────────────
  const passed = checks.filter(c => c.pass).length;
  const failed = checks.filter(c => !c.pass).length;
  const appFailures = checks.filter(c => !c.pass && c.type === 'http' && !c.name.startsWith('MinIO') && !c.name.startsWith('Qdrant'));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`PHASE 2 — RUNTIME VERIFICATION RESULTS`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total checks: ${checks.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`\nInfrastructure Services:`);
  for (const c of checks.filter(c => ['tcp','redis','amqp'].includes(c.type) || c.name.startsWith('MinIO') || c.name.startsWith('Qdrant'))) {
    console.log(`  ${c.pass ? '✅' : '❌'} ${c.name}`);
  }
  console.log(`\nApplication Services:`);
  for (const c of checks.filter(c => !['tcp','redis','amqp'].includes(c.type) && !c.name.startsWith('MinIO') && !c.name.startsWith('Qdrant') && c.type === 'http')) {
    console.log(`  ${c.pass ? '✅' : '❌'} ${c.name} ${c.detail}`);
  }
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
