<<<<<<< HEAD
import { Module, OnModuleInit } from '@nestjs/common';
=======
import { Module } from '@nestjs/common';
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

@Module({
  controllers: [HealthController],
<<<<<<< HEAD
  providers: [HealthService],
})
export class HealthModule implements OnModuleInit {
  constructor(private readonly healthService: HealthService) {}

  onModuleInit() {
    this.healthService.startupComplete = true;
  }
}
=======
  providers: [HealthService]
})
export class HealthModule {}
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
