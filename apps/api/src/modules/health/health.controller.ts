import { Controller, Get, Inject } from '@nestjs/common';
import { HealthService } from './health.service.js';

@Controller('health')
export class HealthController {

  constructor(
    @Inject(HealthService)
    private readonly healthService: HealthService,
  ) {}

  @Get()
<<<<<<< HEAD
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
=======
  getHealth() {
    return this.healthService.getHealth();
  }
}
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
