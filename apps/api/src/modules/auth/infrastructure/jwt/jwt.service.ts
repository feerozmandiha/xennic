import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { readFileSync } from 'fs';
import { JwtPayloadVO } from '../../domain/value-objects/jwt-payload.vo.js';

@Injectable()
export class JwtService {
  private privateKey: string;
  private publicKey: string;

  constructor(private readonly jwtService: NestJwtService) {
    this.privateKey = readFileSync(process.env.JWT_PRIVATE_KEY_PATH!, 'utf8');
    this.publicKey = readFileSync(process.env.JWT_PUBLIC_KEY_PATH!, 'utf8');
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