import { Module, OnModuleInit } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule implements OnModuleInit {
  constructor(private readonly healthService: HealthService) {}

  onModuleInit() {
    this.healthService.startupComplete = true;
  }
}
