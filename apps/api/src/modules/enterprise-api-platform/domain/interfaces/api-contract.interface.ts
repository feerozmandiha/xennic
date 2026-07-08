export const IAPI_CONTRACT_REGISTRY = 'IApiContractRegistry' as const;

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  version: string;
  module: string;
  description: string;
  authRequired: boolean;
  rateLimitTier: 'free' | 'basic' | 'premium' | 'enterprise';
  deprecated?: boolean;
  deprecationMessage?: string;
  sunsetAt?: string;
}

export interface ApiVersion {
  version: string;
  status: 'active' | 'deprecated' | 'sunset';
  releasedAt: string;
  sunsetAt?: string;
  changelog: string[];
}

export interface IApiContractRegistry {
  registerEndpoint(endpoint: ApiEndpoint): void;
  getEndpoints(version?: string, module?: string): ApiEndpoint[];
  getVersion(version: string): ApiVersion | undefined;
  getActiveVersions(): ApiVersion[];
  deprecateEndpoint(path: string, message: string, sunsetAt: string): void;
}
