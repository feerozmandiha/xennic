import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { JwtPayload } from '../../domain/value-objects/jwt-payload.vo.js';

function resolvePublicKey(): string {
  const logger = new Logger('JwtStrategy');
  // 1. Direct inline key from env (for production secrets)
  if (process.env.JWT_PUBLIC_KEY && process.env.JWT_PUBLIC_KEY.includes('BEGIN PUBLIC KEY')) {
    logger.log('Using JWT_PUBLIC_KEY from env inline content');
    return process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
  }

  const configuredPath = process.env.JWT_PUBLIC_KEY_PATH;
  if (!configuredPath) {
    throw new Error('JWT_PUBLIC_KEY_PATH not set and JWT_PUBLIC_KEY inline not provided');
  }

  // List of candidate paths to try
  const candidates = [
    configuredPath,
    resolve(process.cwd(), configuredPath),
    resolve(process.cwd(), '..', '..', configuredPath),
    resolve(__dirname, '..', '..', '..', '..', '..', '..', configuredPath),
    resolve(__dirname, '..', '..', '..', '..', '..', '..', '..', configuredPath),
    // Fallback to old names and new safe names
    'infrastructure/docker/secrets/jwtRS256.key.pub',
    'infrastructure/docker/secrets/jwt-public.key',
    'infrastructure/docker/secrets/jwtRS256.key',
    resolve(process.cwd(), 'infrastructure/docker/secrets/jwtRS256.key.pub'),
    resolve(process.cwd(), 'infrastructure/docker/secrets/jwt-public.key'),
    resolve(process.cwd(), 'infrastructure/docker/secrets/jwtRS256.key'),
  ];

  // Deduplicate
  const unique = [...new Set(candidates)];

  for (const p of unique) {
    try {
      if (existsSync(p)) {
        logger.log(`Reading JWT public key from: ${p}`);
        return readFileSync(p, 'utf8');
      }
    } catch {
      // ignore
    }
  }

  // If still not found, throw informative error
  throw new Error(
    `JWT public key not found. Tried: ${unique.join(', ')}. ` +
      `Please ensure file exists or set JWT_PUBLIC_KEY env. Current JWT_PUBLIC_KEY_PATH=${configuredPath}, cwd=${process.cwd()}`,
  );
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const publicKey = resolvePublicKey();

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      workspaceId: payload.workspaceId,
      roles: payload.roles,
    };
  }
}
