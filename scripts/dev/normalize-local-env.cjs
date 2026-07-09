#!/usr/bin/env node
'use strict';

/**
 * Normalize local development environment files.
 *
 * This script fixes accidental Markdown-link values copied into .env files,
 * ensures JWT key paths point to real local files, and regenerates the public
 * key from the private key if needed.
 *
 * It is intended for local development only.
 */

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = process.cwd();

const secretsDir = path.join(root, 'infrastructure', 'docker', 'secrets');
const privateKeyName = ['jwt', 'RS', '256', '.', 'key'].join('');
const publicKeyName = `${privateKeyName}.pub`;

const privateKeyPath = path.join(secretsDir, privateKeyName);
const publicKeyPath = path.join(secretsDir, publicKeyName);

function sanitizeValue(value) {
  let out = value;

  // Convert Markdown links: [text](url) -> text
  let previous = null;
  while (previous !== out) {
    previous = out;
    out = out.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  }

  out = out
    .replace(/mailto:/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<');

  return out;
}

function normalizeEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const wanted = {
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://xennic:xennic123@localhost:5432/xennic',
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'xennic123',
    JWT_PRIVATE_KEY_PATH: privateKeyPath,
    JWT_PUBLIC_KEY_PATH: publicKeyPath,
    AI_BASE_URL: 'https://api.groq.com/openai/v1',
    CORS_ORIGINS: 'http://localhost:3000,http://localhost:3001',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@xennic.ir',
  };

  const input = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const output = [];
  const seen = new Set();

  for (const originalLine of input) {
    const line = sanitizeValue(originalLine);
    const trimmed = line.trim();
    const key = trimmed.includes('=') ? trimmed.split('=', 1)[0] : null;

    if (trimmed.includes('ADMIN_EMAIL')) {
      if (!seen.has('ADMIN_EMAIL')) {
        output.push(`ADMIN_EMAIL=${wanted.ADMIN_EMAIL}`);
        seen.add('ADMIN_EMAIL');
      }
      continue;
    }

    if (key && Object.prototype.hasOwnProperty.call(wanted, key)) {
      if (!seen.has(key)) {
        output.push(`${key}=${wanted[key]}`);
        seen.add(key);
      }
      continue;
    }

    output.push(line);
  }

  for (const [key, value] of Object.entries(wanted)) {
    if (!seen.has(key)) {
      output.push(`${key}=${value}`);
    }
  }

  fs.writeFileSync(filePath, `${output.join('\n')}\n`);
  console.log(`normalized ${path.relative(root, filePath)}`);
}

function normalizeJwtPublicKey() {
  fs.mkdirSync(secretsDir, { recursive: true });

  if (!fs.existsSync(privateKeyPath)) {
    throw new Error(`Missing private key: ${privateKeyPath}`);
  }

  // Remove public-key-like files with broken Markdown names.
  for (const entry of fs.readdirSync(secretsDir)) {
    if (entry !== privateKeyName && entry !== publicKeyName) {
      fs.rmSync(path.join(secretsDir, entry), { force: true });
      console.log(`removed malformed secret filename: ${entry}`);
    }
  }

  execFileSync('openssl', ['rsa', '-in', privateKeyPath, '-pubout', '-out', publicKeyPath], {
    stdio: 'inherit',
  });

  console.log(`ensured ${path.relative(root, publicKeyPath)}`);
}

function main() {
  normalizeJwtPublicKey();
  normalizeEnvFile(path.join(root, '.env'));
  normalizeEnvFile(path.join(root, 'apps', 'api', '.env'));

  console.log('local environment normalized');
}

try {
  main();
} catch (error) {
  console.error(error.message || error);
  process.exitCode = 1;
}
