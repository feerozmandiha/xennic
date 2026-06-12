import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      service: 'xennic-api',
      timestamp: new Date(),
    };
  }
}