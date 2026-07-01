import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

@Injectable()
export class FingerprintService {
  computeChecksum(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }
}
