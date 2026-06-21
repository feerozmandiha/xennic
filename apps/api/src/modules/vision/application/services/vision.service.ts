import { Injectable } from '@nestjs/common';
import { VisionClientService } from '../../infrastructure/http/vision-client.service.js';

@Injectable()
export class VisionService {
  constructor(private readonly client: VisionClientService) {}

  async analyzeNameplate(imageBuffer: Uint8Array, mode: 'read' | 'analyze' = 'read') {
    return this.client.analyzeNameplate(imageBuffer, mode);
  }

  async analyzeBill(imageBuffer: Uint8Array, mode: 'read' | 'analyze' = 'read') {
    return this.client.analyzeBill(imageBuffer, mode);
  }

  async genericOcr(imageBuffer: Uint8Array) {
    return this.client.genericOcr(imageBuffer);
  }

  async health() {
    return this.client.health();
  }
}
