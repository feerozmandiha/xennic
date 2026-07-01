import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';

@Injectable()
export class TransactionService {
  async run<T>(fn: (tx: typeof prisma) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn as any) as Promise<T>;
  }
}
