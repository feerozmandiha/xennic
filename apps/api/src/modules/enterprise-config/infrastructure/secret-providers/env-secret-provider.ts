import { Injectable } from '@nestjs/common';
import { ISecretProvider } from '../../domain/interfaces/secret-provider.interface.js';

@Injectable()
export class EnvSecretProvider implements ISecretProvider {
  async get(key: string): Promise<string | null> {
    return process.env[key] ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    process.env[key] = value;
  }

  async delete(key: string): Promise<void> {
    delete process.env[key];
  }

  async list(): Promise<string[]> {
    return Object.keys(process.env).filter(
      k => k.startsWith('SECRET_') || k.startsWith('AI_') || k.startsWith('DB_'),
    );
  }
}
