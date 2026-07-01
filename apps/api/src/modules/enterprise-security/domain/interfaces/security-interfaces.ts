import type { EncryptedData, EncryptionAlgorithm, SecretEntry, AuditLogEntry, AuditLogQuery, SignedUrlRequest, SignedUrlResult } from '../types/security.types.js';

export interface IEncryptionService {
  encrypt(plaintext: string, context?: string): Promise<EncryptedData>;
  decrypt(data: EncryptedData, context?: string): Promise<string>;
  generateKey(): Promise<string>;
  rotateKey(keyId: string): Promise<void>;
}

export interface ISecretsManager {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  rotate(key: string): Promise<void>;
  list(environment?: string): Promise<SecretEntry[]>;
  delete(key: string): Promise<void>;
}

export interface IAuditLogService {
  record(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void>;
  query(query: AuditLogQuery): Promise<{ items: AuditLogEntry[]; total: number }>;
  getById(id: string): Promise<AuditLogEntry | null>;
  export(workspaceId: string, fromDate: Date, toDate: Date): Promise<AuditLogEntry[]>;
}

export interface ISignedUrlService {
  generate(request: SignedUrlRequest): Promise<SignedUrlResult>;
  verify(token: string, url: string): Promise<boolean>;
  revoke(token: string): Promise<void>;
}
