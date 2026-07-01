import { Injectable } from '@nestjs/common';
import { BaseCacheService } from './base-cache.service.js';
import type { IOntologyCache } from '../../domain/interfaces/cache-interfaces.js';

@Injectable()
export class OntologyCacheService extends BaseCacheService implements IOntologyCache {
  protected namespace = 'ontology';

  async getRelationships(concept: string): Promise<string[] | null> {
    const entry = await this.get<string[]>(concept);
    return entry;
  }

  async storeRelationships(concept: string, relationships: string[]): Promise<void> {
    await this.set(concept, relationships, 3600);
  }
}
