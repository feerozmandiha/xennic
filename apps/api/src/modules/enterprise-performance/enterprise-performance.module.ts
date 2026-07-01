import { Module } from '@nestjs/common';
import { BatchProcessorService } from './application/services/batch-processor.service.js';
import { LazyLoaderService } from './application/services/lazy-loader.service.js';
import { QueryOptimizerService } from './application/services/query-optimizer.service.js';

@Module({
  providers: [
    BatchProcessorService,
    LazyLoaderService,
    QueryOptimizerService,
  ],
  exports: [
    BatchProcessorService,
    LazyLoaderService,
    QueryOptimizerService,
  ],
})
export class EnterprisePerformanceModule {}
