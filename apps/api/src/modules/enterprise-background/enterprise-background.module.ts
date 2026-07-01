import { Module } from '@nestjs/common';
import { JobSchedulerService } from './application/services/job-scheduler.service.js';
import { CronService } from './application/services/cron.service.js';
import { WorkerPoolService } from './application/services/worker-pool.service.js';

@Module({
  providers: [
    JobSchedulerService,
    CronService,
    WorkerPoolService,
  ],
  exports: [
    JobSchedulerService,
    CronService,
    WorkerPoolService,
  ],
})
export class EnterpriseBackgroundModule {}
