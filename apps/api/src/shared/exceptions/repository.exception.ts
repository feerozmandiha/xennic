import { InternalServerErrorException } from '@nestjs/common';

export function throwRepositoryError(operation: string, cause: unknown): never {
  const message = cause instanceof Error ? cause.message : String(cause);
  console.error(`${operation} failed:`, message);
  throw new InternalServerErrorException(`${operation} failed: ${message}`);
}
