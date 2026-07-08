import * as amqp from 'amqplib';
import { randomUUID } from 'crypto';

interface RMQCheck {
  operation: string;
  pass: boolean;
  detail: string;
}

const checks: RMQCheck[] = [];
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

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

const cleanup: (() => Promise<void>)[] = [];

async function main() {
  console.log('\n📊 Phase 5 — RabbitMQ Runtime Validation\n');

  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();
  const testId = randomUUID().slice(0, 8);
  const PREFIX = `test${testId}`;

  await check('Connection', async () => {
    return conn.connection.serverProperties != null;
  }, 'Connected to RabbitMQ');

  // Use server-named exclusive queues for all tests (RabbitMQ 4 compatible)
  await check('Assert exchange', async () => {
    await channel.assertExchange(`${PREFIX}.ex`, 'topic', { durable: false });
    return true;
  }, 'Topic exchange created');

  // Test 1: Direct queue publish + consume via exclusive queue
  await check('Publish + Consume (direct queue)', async () => {
    const q = await channel.assertQueue('', { exclusive: true });
    const queueName = q.queue;
    const msg = `direct-${testId}`;

    // Set up consumer before publishing to avoid race
    const msgPromise = new Promise<string | null>((resolve) => {
      channel.consume(queueName, (m) => {
        if (m) { resolve(m.content.toString()); channel.ack(m); } else resolve(null);
      }, { noAck: false });
    });

    channel.sendToQueue(queueName, Buffer.from(msg));
    const result = await msgPromise;
    return result === msg;
  }, 'Direct queue roundtrip');

  // Test 2: Exchange publish + queue binding + consume
  await check('Exchange publish + Topic routing', async () => {
    const q = await channel.assertQueue('', { exclusive: true });
    const queueName = q.queue;
    await channel.bindQueue(queueName, `${PREFIX}.ex`, `${PREFIX}.*`);

    // Consumer first, then publish
    const msgPromise = new Promise<string | null>((resolve) => {
      channel.consume(queueName, (m) => {
        if (m) { resolve(m.content.toString()); channel.ack(m); } else resolve(null);
      }, { noAck: false });
    });

    channel.publish(`${PREFIX}.ex`, `${PREFIX}.test`, Buffer.from('topic-msg'));
    const result = await msgPromise;
    return result === 'topic-msg';
  }, 'Topic routing');

  // Test 3: Multiple messages on one queue
  await check('Multiple messages on single queue', async () => {
    const q = await channel.assertQueue('', { exclusive: true });
    const queueName = q.queue;
    const received: string[] = [];
    const allReceived = new Promise<void>((resolve) => {
      channel.consume(queueName, (m) => {
        if (m) {
          received.push(m.content.toString());
          channel.ack(m);
          if (received.length === 5) resolve();
        }
      });
    });
    for (let i = 0; i < 5; i++) {
      channel.sendToQueue(queueName, Buffer.from(`multi-${i}`));
    }
    await allReceived;
    return received.length === 5 && received.sort()[0] === 'multi-0';
  }, '5 messages consumed');

  // Test 4: Dead letter exchange pattern
  await check('Dead letter exchange', async () => {
    const dlx = `${PREFIX}.dlx`;
    const dlq = `${PREFIX}.dlq`;
    await channel.assertExchange(dlx, 'fanout', { durable: false });
    await channel.assertQueue(dlq, { durable: true });
    await channel.bindQueue(dlq, dlx, '');
    cleanup.push(async () => { await channel.deleteQueue(dlq); await channel.deleteExchange(dlx); });

    const mainQ = await channel.assertQueue(`${PREFIX}.dlmain`, {
      durable: true,
      arguments: { 'x-dead-letter-exchange': dlx },
    });
    cleanup.push(async () => { await channel.deleteQueue(`${PREFIX}.dlmain`); });

    // Set up DLQ consumer BEFORE sending to main queue
    const dlMsgPromise = new Promise<string | null>((resolve) => {
      channel.consume(dlq, (m) => {
        if (m) { resolve(m.content.toString()); channel.ack(m); } else resolve(null);
      }, { noAck: false });
    });

    channel.sendToQueue(`${PREFIX}.dlmain`, Buffer.from('dead-letter-test'));

    // Consume from main and nack (don't requeue)
    await new Promise<void>((resolve) => {
      channel.consume(`${PREFIX}.dlmain`, (m) => {
        if (m) {
          channel.nack(m, false, false);
          resolve();
        }
      }, { noAck: false });
    });

    const dlMsg = await dlMsgPromise;

    return dlMsg === 'dead-letter-test';
  }, 'Dead letter routing works');

  // Test 5: Queue TTL
  await check('Message TTL', async () => {
    const q = await channel.assertQueue(`${PREFIX}.ttlq`, {
      durable: true,
      arguments: { 'x-message-ttl': 100 },
    });
    cleanup.push(async () => { await channel.deleteQueue(`${PREFIX}.ttlq`); });
    return true;
  }, 'Queue with TTL created');

  // Test 6: Queue purge
  await check('Queue purge', async () => {
    const q = await channel.assertQueue(`${PREFIX}.purgeq`, { durable: true });
    cleanup.push(async () => { await channel.deleteQueue(`${PREFIX}.purgeq`); });
    for (let i = 0; i < 5; i++) {
      channel.sendToQueue(`${PREFIX}.purgeq`, Buffer.from(`p-${i}`));
    }
    // Wait briefly for messages to be routed
    await new Promise(r => setTimeout(r, 100));
    const purged = await channel.purgeQueue(`${PREFIX}.purgeq`);
    return purged.messageCount === 5;
  }, 'Purged 5 messages');

  // Test 7: Publisher confirm
  await check('Publisher confirm', async () => {
    const confirmChannel = await conn.createConfirmChannel();
    const q = await confirmChannel.assertQueue('', { exclusive: true });
    let confirmed = false;
    confirmChannel.on('ack', () => { confirmed = true; });

    await new Promise<void>((resolve, reject) => {
      confirmChannel.sendToQueue(q.queue, Buffer.from('confirm-test'), {}, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await confirmChannel.close();
    return confirmed;
  }, 'Message confirmed by broker');

  // Cleanup durable queues/exchanges
  for (const fn of cleanup) {
    try { await fn(); } catch {}
  }

  await channel.close();
  await conn.close();

  const passed = checks.filter(c => c.pass).length;
  const failed = checks.filter(c => !c.pass).length;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`PHASE 5 — RABBITMQ VALIDATION RESULTS`);
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
