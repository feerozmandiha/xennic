import { Controller, Get, Inject } from '@nestjs/common';
import { HealthService } from './health.service.js';

@Controller('health')
export class HealthController {

  constructor(
    @Inject(HealthService)
    private readonly healthService: HealthService,
  ) {}

  @Get()
  async getHealth() {
    return this.healthService.getHealth();
  }

  @Get('live')
  checkLiveness() {
    return this.healthService.checkLiveness();
  }

  @Get('ready')
  async checkReadiness() {
    return this.healthService.checkReadiness();
  }

  @Get('startup')
  checkStartup() {
    return this.healthService.checkStartup();
  }
}
