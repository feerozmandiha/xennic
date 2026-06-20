import 'reflect-metadata';
import { readFileSync, existsSync } from 'fs';

const envPath = '/home/ahmad/xennic/.env';
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim(); if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx > 0) { const k = trimmed.slice(0, idx).trim(); const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, ''); if (!process.env[k]) process.env[k] = v; }
  }
}

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

async function main() {
  const { ApiModule } = await import('./dist/api.module.js');
  console.log('ApiModule imported from dist');

  @Module({ imports: [ApiModule] })
  class Test {}

  console.log('Creating app...');
  const app = await NestFactory.create(Test, { logger: false });
  console.log('OK');
  await app.close();
}

main().catch(e => console.error('Error:', e.message?.slice(0, 500) ?? e));
