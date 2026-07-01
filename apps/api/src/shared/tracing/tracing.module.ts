import { Global, Module, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TracingService } from './tracing.service.js';
import { TracingInterceptor } from './tracing.interceptor.js';

@Global()
@Module({
  providers: [
    TracingService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TracingInterceptor,
    },
  ],
  exports: [TracingService],
})
export class TracingModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly tracingService: TracingService) {}

  async onModuleInit(): Promise<void> {
    await this.tracingService.init();
  }

  async onModuleDestroy(): Promise<void> {
    await this.tracingService.shutdown();
  }
}
