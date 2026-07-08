import { Redis } from 'ioredis';

interface RedisCheck {
  operation: string;
  pass: boolean;
  detail: string;
}

const checks: RedisCheck[] = [];

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6380'),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: () => null,
};

async function check(label: string, fn: () => Promise<boolean>, detail: string) {
  try {
    const pass = await fn();
    checks.push({ operation: label, pass, detail });
    console.log(`  ${pass ? '✅' : '❌'} ${label}: ${detail}`);
  } catch (e: any) {
    checks.push({ operation: label, pass: false, detail: e.message });
    console.log(`  ❌ ${label}: ${e.message}`);
  }
}

async function main() {
  console.log('\n📊 Phase 4 — Redis Runtime Validation\n');

  const redis = new Redis(REDIS_CONFIG);

  // Connection
  await check('Connection', async () => {
    const pong = await redis.ping();
    return pong === 'PONG';
  }, 'PING/PONG');

  // String operations
  await check('SET/GET string', async () => {
    await redis.set('test:str', 'hello');
    const val = await redis.get('test:str');
    return val === 'hello';
  }, 'SET + GET roundtrip');

  await check('SET with TTL', async () => {
    await redis.set('test:ttl', 'ephemeral', 'EX', 3);
    const ttl = await redis.ttl('test:ttl');
    return ttl > 0 && ttl <= 3;
  }, 'TTL set');

  // Hash operations
  await check('HSET/HGET', async () => {
    await redis.hset('test:hash', { field1: 'val1', field2: 'val2' });
    const val = await redis.hget('test:hash', 'field1');
    return val === 'val1';
  }, 'HSET + HGET roundtrip');

  await check('HGETALL', async () => {
    const all = await redis.hgetall('test:hash');
    return all.field1 === 'val1' && all.field2 === 'val2';
  }, `2 fields found`);

  await check('HDEL', async () => {
    await redis.hdel('test:hash', 'field1');
    const val = await redis.hget('test:hash', 'field1');
    return val === null;
  }, 'Field removed');

  // List operations
  await check('LPUSH/RPUSH', async () => {
    await redis.del('test:list');
    await redis.lpush('test:list', 'a', 'b');
    await redis.rpush('test:list', 'c');
    const len = await redis.llen('test:list');
    return len === 3;
  }, '3 items');

  await check('RPOP', async () => {
    const val = await redis.rpop('test:list');
    return val === 'c';
  }, 'Popped: c');

  // Set operations
  await check('SADD/SMEMBERS', async () => {
    await redis.del('test:set');
    await redis.sadd('test:set', 'x', 'y', 'z');
    const members = await redis.smembers('test:set');
    return members.length === 3 && members.includes('x');
  }, '3 members');

  await check('SREM', async () => {
    await redis.srem('test:set', 'x');
    const members = await redis.smembers('test:set');
    return members.length === 2 && !members.includes('x');
  }, 'Removed x, 2 remaining');

  // Counter / incr
  await check('INCR', async () => {
    await redis.del('test:counter');
    const v1 = await redis.incr('test:counter');
    const v2 = await redis.incr('test:counter');
    const v3 = await redis.incr('test:counter');
    return v1 === 1 && v2 === 2 && v3 === 3;
  }, '1→2→3');

  await check('DECR', async () => {
    const v = await redis.decr('test:counter');
    return v === 2;
  }, '3→2');

  // EXISTS
  await check('EXISTS', async () => {
    const exists = await redis.exists('test:str');
    const notExists = await redis.exists('nonexistent:key');
    return exists === 1 && notExists === 0;
  }, 'Existing: true, Missing: false');

  // DEL
  await check('DEL', async () => {
    await redis.set('test:deleteme', 'bye');
    await redis.del('test:deleteme');
    const exists = await redis.exists('test:deleteme');
    return exists === 0;
  }, 'Key removed');

  // EXPIRE
  await check('EXPIRE on existing key', async () => {
    await redis.set('test:expireme', 'temp');
    await redis.expire('test:expireme', 60);
    const ttl = await redis.ttl('test:expireme');
    return ttl > 0 && ttl <= 60;
  }, 'TTL set');

  // Pipeline
  await check('Pipeline batch', async () => {
    const pipe = redis.pipeline();
    pipe.set('test:pipe:a', '1');
    pipe.set('test:pipe:b', '2');
    pipe.get('test:pipe:a');
    pipe.get('test:pipe:b');
    const results = await pipe.exec();
    return results !== null && results.length === 4;
  }, '4 commands in pipeline');

  // Session-like pattern (HSET with TTL)
  await check('Session store pattern', async () => {
    const sessionId = 'test:session:123';
    await redis.hset(sessionId, { id: sessionId, agentId: 'agent-1', status: 'active' });
    await redis.expire(sessionId, 3600);
    const session = await redis.hgetall(sessionId);
    return session.id === sessionId && session.status === 'active';
  }, 'Hash + TTL: works');

  // User sessions set pattern
  await check('User session index (SET)', async () => {
    await redis.sadd('user_sessions:ws:uid', 'session-1', 'session-2');
    const sessions = await redis.smembers('user_sessions:ws:uid');
    return sessions.length === 2;
  }, '2 sessions in user set');

  // Cleanup all test keys
  const keys = await redis.keys('test:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
  await redis.del('user_sessions:ws:uid');

  redis.disconnect();

  const passed = checks.filter(c => c.pass).length;
  const failed = checks.filter(c => !c.pass).length;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`PHASE 4 — REDIS VALIDATION RESULTS`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total checks: ${checks.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Score: ${failed === 0 ? 'A+' : failed <= 2 ? 'A' : 'B'}`);
  console.log(`${'='.repeat(60)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
