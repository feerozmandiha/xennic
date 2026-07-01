export enum EncryptionAlgorithm {
  AES_256_GCM = 'aes-256-gcm',
  AES_256_CBC = 'aes-256-cbc',
  CHACHA20_POLY1305 = 'chacha20-poly1305',
}

export interface EncryptedData {
  iv: string;
  ciphertext: string;
  tag: string;
  algorithm: EncryptionAlgorithm;
  keyId: string;
}

export interface SecretEntry {
  key: string;
  value: string;
  version: number;
  rotationDate: Date;
  environment: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actorId: string;
  actorType: 'user' | 'api_key' | 'system';
  resourceType: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  workspaceId?: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface AuditLogQuery {
  actorId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  severity?: AuditLogEntry['severity'];
  workspaceId?: string;
  fromDate?: Date;
  toDate?: Date;
  page: number;
  limit: number;
}

export interface SignedUrlRequest {
  operation: 'upload' | 'download' | 'delete';
  bucket: string;
  path: string;
  expiresIn: number;
  maxSizeBytes?: number;
  allowedContentTypes?: string[];
}

export interface SignedUrlResult {
  url: string;
  token: string;
  expiresAt: Date;
  method: 'GET' | 'PUT' | 'DELETE';
}

export interface SecurityHeadersConfig {
  contentSecurityPolicy: Record<string, string[]>;
  strictTransportSecurity: string;
  xContentTypeOptions: string;
  xFrameOptions: string;
  referrerPolicy: string;
  permissionsPolicy: Record<string, string[]>;
}

export enum DdosProtectionLevel {
  OFF = 'off',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
