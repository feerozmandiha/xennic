import { Injectable, Logger } from '@nestjs/common';
import type { ApiEndpoint, ApiVersion, IApiContractRegistry } from '../../domain/interfaces/api-contract.interface.js';

@Injectable()
export class ApiDiscoveryService implements IApiContractRegistry {
  private readonly logger = new Logger(ApiDiscoveryService.name);
  private readonly endpoints: ApiEndpoint[] = [];
  private readonly versions: Map<string, ApiVersion> = new Map();

  constructor() {
    this.versions.set('v1', {
      version: 'v1',
      status: 'active',
      releasedAt: '2025-01-01T00:00:00Z',
      changelog: ['Initial release'],
    });
  }

  registerEndpoint(endpoint: ApiEndpoint): void {
    this.endpoints.push(endpoint);
    this.logger.log(`Registered endpoint: ${endpoint.method} ${endpoint.path} (${endpoint.version})`);
  }

  getEndpoints(version?: string, module?: string): ApiEndpoint[] {
    let filtered = this.endpoints;
    if (version) filtered = filtered.filter(e => e.version === version);
    if (module) filtered = filtered.filter(e => e.module === module);
    return filtered;
  }

  getVersion(version: string): ApiVersion | undefined {
    return this.versions.get(version);
  }

  getActiveVersions(): ApiVersion[] {
    return Array.from(this.versions.values()).filter(v => v.status === 'active');
  }

  deprecateEndpoint(path: string, message: string, sunsetAt: string): void {
    const endpoint = this.endpoints.find(e => e.path === path);
    if (endpoint) {
      endpoint.deprecated = true;
      endpoint.deprecationMessage = message;
      endpoint.sunsetAt = sunsetAt;
      this.logger.warn(`Endpoint ${path} deprecated: ${message} (sunset: ${sunsetAt})`);
    }
  }
}
