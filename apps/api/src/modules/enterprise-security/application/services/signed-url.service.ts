import { Injectable, Logger } from '@nestjs/common';
import { createHmac, randomBytes } from 'node:crypto';
import type { ISignedUrlService } from '../../domain/interfaces/security-interfaces.js';
import type { SignedUrlRequest, SignedUrlResult } from '../../domain/types/security.types.js';

@Injectable()
export class SignedUrlService implements ISignedUrlService {
  private readonly logger = new Logger(SignedUrlService.name);
  private revokedTokens = new Set<string>();
  private readonly secret = process.env.SIGNED_URL_SECRET ?? randomBytes(32).toString('hex');

  async generate(request: SignedUrlRequest): Promise<SignedUrlResult> {
    const token = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + request.expiresIn * 1000);
    const method = request.operation === 'upload' ? 'PUT' : request.operation === 'delete' ? 'DELETE' : 'GET';
    const payload = `${request.operation}:${request.bucket}:${request.path}:${expiresAt.getTime()}:${token}`;
    const signature = createHmac('sha256', this.secret).update(payload).digest('hex').slice(0, 16);
    const url = `/api/v1/storage/${request.bucket}/${request.path}?token=${token}&expires=${expiresAt.getTime()}&sig=${signature}`;
    return { url, token, expiresAt, method };
  }

  async verify(token: string, url: string): Promise<boolean> {
    if (this.revokedTokens.has(token)) return false;
    const urlObj = new URL(url, 'http://localhost');
    const expires = parseInt(urlObj.searchParams.get('expires') ?? '0', 10);
    if (Date.now() > expires) return false;
    return true;
  }

  async revoke(token: string): Promise<void> {
    this.revokedTokens.add(token);
    this.logger.debug(`Signed URL revoked: ${token}`);
  }
}
