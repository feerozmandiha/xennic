import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface QueueOptions {
  name: string;
  attempts: number;
  backoff: {
    type: 'exponential';
    delay: number;
  };
  removeOnComplete: { count: number; age: number };
  removeOnFail: { count: number; age: number };
  stalledInterval: number;
  maxStalledCount: number;
  defaultJobOptions: {
    attempts: number;
    backoff: {
      type: 'exponential';
      delay: number;
    };
    removeOnComplete: { count: number; age: number };
    removeOnFail: { count: number; age: number };
    stallTimeout: number;
  };
}

@Injectable()
export class QueueConfigService {
  private readonly logger = new Logger(QueueConfigService.name);

  constructor(private readonly config: ConfigService) {}

  getQueueOptions(stage: string): QueueOptions {
    const maxCompleted = this.config.get<number>('KF_QUEUE_MAX_COMPLETED', 1000);
    const maxFailed = this.config.get<number>('KF_QUEUE_MAX_FAILED', 500);
    const stalledInterval = this.config.get<number>('KF_STALLED_INTERVAL_MS', 30000);
    const maxStalled = this.config.get<number>('KF_MAX_STALLED_COUNT', 3);

    const stageConfigs: Record<string, { attempts: number; delay: number; stallTimeout: number }> =
      {
        intake: { attempts: 3, delay: 2000, stallTimeout: 60000 },
        classify: { attempts: 3, delay: 1000, stallTimeout: 45000 },
        parse: { attempts: 3, delay: 2000, stallTimeout: 120000 },
        ocr: { attempts: 2, delay: 5000, stallTimeout: 180000 },
        normalize: { attempts: 3, delay: 1000, stallTimeout: 30000 },
        chunk: { attempts: 3, delay: 1000, stallTimeout: 60000 },
        embed: { attempts: 3, delay: 2000, stallTimeout: 90000 },
        publish: { attempts: 3, delay: 1000, stallTimeout: 45000 },
      };

    const config = stageConfigs[stage] || { attempts: 3, delay: 1000, stallTimeout: 60000 };

    return {
      name: `knowledge-factory:${stage}`,
      attempts: config.attempts,
      backoff: {
        type: 'exponential',
        delay: config.delay,
      },
      removeOnComplete: { count: maxCompleted, age: 24 * 3600 },
      removeOnFail: { count: maxFailed, age: 7 * 24 * 3600 },
      stalledInterval,
      maxStalledCount: maxStalled,
      defaultJobOptions: {
        attempts: config.attempts,
        backoff: {
          type: 'exponential',
          delay: config.delay,
        },
        removeOnComplete: { count: maxCompleted, age: 24 * 3600 },
        removeOnFail: { count: maxFailed, age: 7 * 24 * 3600 },
        stallTimeout: config.stallTimeout,
      },
    };
  }

  getWorkerOptions(): { stalledInterval: number; maxStalledCount: number } {
    return {
      stalledInterval: this.config.get<number>('KF_STALLED_INTERVAL_MS', 30000),
      maxStalledCount: this.config.get<number>('KF_MAX_STALLED_COUNT', 3),
    };
  }
}
