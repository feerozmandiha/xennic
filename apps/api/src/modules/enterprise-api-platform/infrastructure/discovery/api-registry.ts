import { Injectable } from '@nestjs/common';
import { ApiDiscoveryService } from '../../application/services/api-discovery.service.js';

@Injectable()
export class ApiRegistry {
  constructor(public readonly delegate: ApiDiscoveryService) {}
}
