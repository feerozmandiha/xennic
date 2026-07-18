import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import * as amqp from 'amqplib';

interface Benchmark {
  name: string;
  target: string;
  type: 'latency' | 'throughput' | 'resource';
  iterations: number;
  results: number[];
  p50: number;
  p95: number;
  p99: number;
  pass: boolean;
}

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

const THRESHOLDS = {
  'API /health': { p50: 100, p95: 300 },
  'Engineering /health': { p50: 50, p95: 200 },
  'AI /health': { p50: 100, p95: 500 },
  'Vision /health': { p50: 50, p95: 200 },
  'PostgreSQL SELECT 1': { p50: 10, p95: 50 },
  'Redis PING': { p50: 5, p95: 20 },
};

const BENCHMARKS: Benchmark[] = [];

async function httpGet(url: string, timeout = 5000): Promise<number> {
  const start = Date.now();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ac.signal });
    clearTimeout(timer);
    await res.text();
    return Date.now() - start;
  } catch (e: any) {
    clearTimeout(timer);
    throw new Error(e.message);
  }
}

async function benchmarkLatency(name: string, target: string, url: string, iterations = 20) {
  const b: Benchmark = {
    name,
    target,
    type: 'latency',
    iterations,
    results: [],
    p50: 0,
    p95: 0,
    p99: 0,
    pass: false,
  };

  // Warmup
  for (let i = 0; i < 3; i++) {
    try {
      await httpGet(url, 5000);
    } catch {
      /* skip */
    }
  }

  for (let i = 0; i < iterations; i++) {
    try {
      const ms = await httpGet(url, 5000);
      b.results.push(ms);
    } catch {
      // Connection refused — skip
    }
  }

  if (b.results.length === 0) {
    console.log(`  ${RED}❌${RESET} ${name}: no successful requests`);
    BENCHMARKS.push(b);
    return;
  }

  b.results.sort((a, b) => a - b);
  b.p50 = b.results[Math.floor(b.results.length * 0.5)];
  b.p95 = b.results[Math.floor(b.results.length * 0.95)];
  b.p99 = b.results[Math.floor(b.results.length * 0.99)];

  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (threshold) {
    b.pass = b.p50 <= threshold.p50 && b.p95 <= threshold.p95;
  } else {
    b.pass = b.p95 < 1000;
  }

  const icon = b.pass ? GREEN + '✅' : RED + '❌';
  console.log(
    `  ${icon}${RESET} ${name} → p50: ${b.p50}ms, p95: ${b.p95}ms, p99: ${b.p99}ms (${b.results.length} samples)`,
  );
  BENCHMARKS.push(b);
}

async function benchmarkDBLatency(iterations = 10) {
  const prisma = new PrismaClient();
  const results: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    results.push(Date.now() - start);
  }
  await prisma.$disconnect();

  results.sort((a, b) => a - b);
  const p50 = results[Math.floor(results.length * 0.5)];
  const p95 = results[Math.floor(results.length * 0.95)];
  const p99 = results[Math.floor(results.length * 0.99)];
  const pass =
    p50 <= (THRESHOLDS['PostgreSQL SELECT 1']?.p50 || 10) &&
    p95 <= (THRESHOLDS['PostgreSQL SELECT 1']?.p95 || 50);

  BENCHMARKS.push({
    name: 'PostgreSQL SELECT 1',
    target: 'Database',
    type: 'latency',
    iterations,
    results,
    p50,
    p95,
    p99,
    pass,
  });

  const icon = pass ? GREEN + '✅' : RED + '❌';
  console.log(
    `  ${icon}${RESET} PostgreSQL SELECT 1 → p50: ${p50}ms, p95: ${p95}ms, p99: ${p99}ms`,
  );
}

async function benchmarkRedisLatency(iterations = 10) {
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6380,
    password: process.env.REDIS_PASSWORD || '',
    retryStrategy: () => null,
  });
  const results: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await redis.ping();
    results.push(Date.now() - start);
  }
  // Set/Get test
  const setStart = Date.now();
  await redis.set('s1:perf:test', 'benchmark');
  await redis.get('s1:perf:test');
  await redis.del('s1:perf:test');
  const setGetMs = Date.now() - setStart;
  redis.disconnect();

  results.sort((a, b) => a - b);
  const p50 = results[Math.floor(results.length * 0.5)];
  const p95 = results[Math.floor(results.length * 0.95)];
  const p99 = results[Math.floor(results.length * 0.99)];
  const pass =
    p50 <= (THRESHOLDS['Redis PING']?.p50 || 5) && p95 <= (THRESHOLDS['Redis PING']?.p95 || 20);

  BENCHMARKS.push({
    name: 'Redis PING',
    target: 'Memory Platform',
    type: 'latency',
    iterations,
    results,
    p50,
    p95,
    p99,
    pass,
  });

  const icon = pass ? GREEN + '✅' : RED + '❌';
  console.log(`  ${icon}${RESET} Redis PING → p50: ${p50}ms, p95: ${p95}ms, p99: ${p99}ms`);
  console.log(`     Set/Get/Del: ${setGetMs}ms`);
}

async function benchmarkRabbitMQThroughput(iterations = 5) {
  const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  const conn = await amqp.connect(rabbitUrl);
  const ch = await conn.createChannel();

  const exchange = `s1-perf-ex`;
  const queue = `s1-perf-q`;
  await ch.assertExchange(exchange, 'topic', { durable: false, autoDelete: true });
  await ch.assertQueue(queue, { exclusive: true });
  await ch.bindQueue(queue, exchange, 'perf.#');

  // Publish 100 messages
  const publishStart = Date.now();
  const msgCount = 100;
  for (let i = 0; i < msgCount; i++) {
    ch.publish(exchange, 'perf.test', Buffer.from(JSON.stringify({ seq: i })));
  }
  const publishMs = Date.now() - publishStart;

  // Consume them
  let received = 0;
  const consumeStart = Date.now();
  await new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, 3000);
    ch.consume(
      queue,
      (msg) => {
        if (msg) {
          received++;
          ch.ack(msg);
          if (received >= msgCount) {
            clearTimeout(timer);
            resolve();
          }
        }
      },
      { noAck: false },
    );
  });
  const consumeMs = Date.now() - consumeStart;

  await ch.deleteQueue(queue);
  await ch.deleteExchange(exchange);
  await ch.close();
  await conn.close();

  const throughput = Math.round(msgCount / (publishMs / 1000));
  const pass = received === msgCount;

  const icon = pass ? GREEN + '✅' : RED + '❌';
  console.log(
    `  ${icon}${RESET} RabbitMQ throughput: ${throughput} msgs/sec (pub), ${received}/${msgCount} received in ${consumeMs}ms`,
  );
}

async function main() {
  console.log(`\n${CYAN}══════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${CYAN}  PHASE 6 — PRODUCTION PERFORMANCE BASELINE${RESET}`);
  console.log(`${CYAN}  ${new Date().toISOString()}${RESET}`);
  console.log(`${CYAN}══════════════════════════════════════════════════════════════${RESET}\n`);

  // ═══ SMOKE TEST (1 request) ═══
  console.log(`  ── Smoke Tests ──`);
  await benchmarkLatency('API /health', 'API', 'http://localhost:3000/api/v1/health', 1);
  await benchmarkLatency(
    'Engineering /health',
    'Engineering Service',
    'http://localhost:8001/health',
    1,
  );
  await benchmarkLatency('AI /health', 'AI Service', 'http://localhost:8002/health', 1);
  await benchmarkLatency('Vision /health', 'Vision Service', 'http://localhost:8003/health', 1);

  // ═══ LOAD TEST (20 iterations) ═══
  console.log(`\n  ── Load Tests (20 requests each) ──`);
  const loadUrls = [
    ['Engineering /health', 'Engineering Service', 'http://localhost:8001/health'],
    ['AI /health', 'AI Service', 'http://localhost:8002/health'],
    ['Vision /health', 'Vision Service', 'http://localhost:8003/health'],
  ];

  for (const [name, target, url] of loadUrls) {
    await benchmarkLatency(name as string, target as string, url as string, 20);
  }

  // ═══ DATABASE LATENCY ═══
  console.log(`\n  ── Database & Cache Latency ──`);
  await benchmarkDBLatency(10);
  await benchmarkRedisLatency(10);

  // ═══ RABBITMQ THROUGHPUT ═══
  console.log(`\n  ── Message Queue Throughput ──`);
  await benchmarkRabbitMQThroughput(5);

  // ═══ REPORT ═══
  const passed = BENCHMARKS.filter((b) => b.pass).length;
  const failed = BENCHMARKS.filter((b) => !b.pass).length;

  console.log(`\n${CYAN}══════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${CYAN}  PERFORMANCE BASELINE RESULTS${RESET}`);
  console.log(`${CYAN}══════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${GREEN}  ✅ Passed: ${passed}${RESET}`);
  console.log(`${RED}  ❌ Failed: ${failed}${RESET}`);
  console.log(`  Total:    ${BENCHMARKS.length}`);

  if (failed === 0) {
    console.log(`${GREEN}  All benchmarks within thresholds${RESET}`);
  } else {
    console.log(`\n  Failed benchmarks:\n`);
    for (const b of BENCHMARKS.filter((b) => !b.pass)) {
      const detail = `${b.results.length} samples, p50: ${b.p50}ms, p95: ${b.p95}ms`;
      console.log(`    ${RED}❌${RESET} ${b.name}: ${detail}`);
    }
  }
  console.log(`${CYAN}══════════════════════════════════════════════════════════════${RESET}\n`);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
