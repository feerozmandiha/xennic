import { Module } from '@nestjs/common';
import { SemanticCacheService } from './application/services/semantic-cache.service.js';
import { EmbeddingCacheService } from './application/services/embedding-cache.service.js';
import { QueryCacheService } from './application/services/query-cache.service.js';
import { OntologyCacheService } from './application/services/ontology-cache.service.js';
import { MetadataCacheService } from './application/services/metadata-cache.service.js';
import { ResponseCacheService } from './application/services/response-cache.service.js';

@Module({
  providers: [
    SemanticCacheService,
    EmbeddingCacheService,
    QueryCacheService,
    OntologyCacheService,
    MetadataCacheService,
    ResponseCacheService,
  ],
  exports: [
    SemanticCacheService,
    EmbeddingCacheService,
    QueryCacheService,
    OntologyCacheService,
    MetadataCacheService,
    ResponseCacheService,
  ],
})
export class EnterpriseCacheModule {}
