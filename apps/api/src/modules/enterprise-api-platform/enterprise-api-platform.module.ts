import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ApiDiscoveryService } from './application/services/api-discovery.service.js';
import { TokenBucketRateLimiter } from './infrastructure/rate-limit/token-bucket-rate-limiter.js';

@Module({
  providers: [ApiDiscoveryService, TokenBucketRateLimiter],
  exports: [ApiDiscoveryService, TokenBucketRateLimiter],
})
export class EnterpriseApiPlatformModule implements OnModuleInit {
  private readonly logger = new Logger(EnterpriseApiPlatformModule.name);

  onModuleInit(): void {
    this.logger.log(
      'Enterprise API Platform Module initialized: API discovery + rate limiting ready',
    );
  }
}
