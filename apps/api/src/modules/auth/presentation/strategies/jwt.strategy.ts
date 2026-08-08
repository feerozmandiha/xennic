import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../domain/value-objects/jwt-payload.vo.js';
import { loadJwtKeyFile } from '../../infrastructure/jwt/jwt-key-resolver.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const publicKey = loadJwtKeyFile(process.env.JWT_PUBLIC_KEY_PATH, 'JWT_PUBLIC_KEY_PATH');

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
