import { Injectable, Logger } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { JwtPayloadVO } from '../../domain/value-objects/jwt-payload.vo.js';

function resolveKey(envPathKey: string, envInlineKey: string): string {
  const logger = new Logger('JwtService');
  const inline = process.env[envInlineKey];
  if (inline && inline.includes('BEGIN')) {
    logger.log(`Using ${envInlineKey} from env inline`);
    return inline.replace(/\\n/g, '\n');
  }

  const configuredPath = process.env[envPathKey];
  if (!configuredPath) {
    throw new Error(`${envPathKey} not set and ${envInlineKey} inline not provided`);
  }

  const candidates = [
    configuredPath,
    resolve(process.cwd(), configuredPath),
    resolve(process.cwd(), '..', '..', configuredPath),
    resolve(__dirname, '..', '..', '..', '..', '..', '..', configuredPath),
    // safe fallbacks
    'infrastructure/docker/secrets/jwtRS256.key',
    'infrastructure/docker/secrets/jwt-private.key',
    'infrastructure/docker/secrets/jwtRS256.key.pub',
    'infrastructure/docker/secrets/jwt-public.key',
    resolve(process.cwd(), 'infrastructure/docker/secrets/jwtRS256.key'),
    resolve(process.cwd(), 'infrastructure/docker/secrets/jwt-private.key'),
    resolve(process.cwd(), 'infrastructure/docker/secrets/jwt-public.key'),
  ];

  const unique = [...new Set(candidates)];
  for (const p of unique) {
    try {
      if (existsSync(p)) {
        logger.log(`Reading ${envPathKey} from: ${p}`);
        return readFileSync(p, 'utf8');
      }
    } catch {
      // ignore
    }
  }

  throw new Error(
    `JWT key not found for ${envPathKey}. Tried: ${unique.join(', ')}. cwd=${process.cwd()}`,
  );
}

@Injectable()
export class JwtService {
  private privateKey: string;
  private publicKey: string;

  constructor(private readonly jwtService: NestJwtService) {
    this.privateKey = resolveKey('JWT_PRIVATE_KEY_PATH', 'JWT_PRIVATE_KEY');
    this.publicKey = resolveKey('JWT_PUBLIC_KEY_PATH', 'JWT_PUBLIC_KEY');
  }

  async sign(payload: JwtPayloadVO): Promise<string> {
    const jwtPayload = payload.toJSON();
    return this.jwtService.sign(jwtPayload, {
      privateKey: this.privateKey,
      algorithm: 'RS256',
      expiresIn: parseInt(process.env.JWT_ACCESS_TOKEN_TTL || '900', 10),
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });
  }

  async verify(token: string): Promise<any> {
    return this.jwtService.verify(token, {
      publicKey: this.publicKey,
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });
  }
}
