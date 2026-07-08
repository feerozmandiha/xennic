import { Injectable } from '@nestjs/common';
import { ConfigManagerService } from '../../application/services/config-manager.service.js';

@Injectable()
export class FeatureFlagStore {
  constructor(public readonly delegate: ConfigManagerService) {}
}
