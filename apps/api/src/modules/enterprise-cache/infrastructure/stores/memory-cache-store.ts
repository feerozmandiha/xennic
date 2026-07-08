import { Injectable } from '@nestjs/common';
import { CacheManagerService } from '../../application/services/cache-manager.service.js';

@Injectable()
export class MemoryCacheStore {
  constructor(public readonly delegate: CacheManagerService) {}
}
