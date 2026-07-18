import { Injectable } from '@nestjs/common';
import { SagaInstanceEntity } from '../../domain/entities/saga-instance.entity.js';

@Injectable()
export class SagaInstanceRepository {
  private readonly store = new Map<string, SagaInstanceEntity>();

  save(instance: SagaInstanceEntity): void {
    this.store.set(instance.id, instance);
  }

  findById(id: string): SagaInstanceEntity | null {
    return this.store.get(id) ?? null;
  }

  findAll(limit = 50): SagaInstanceEntity[] {
    return Array.from(this.store.values()).slice(-limit).reverse();
  }

  findByStatus(status: string): SagaInstanceEntity[] {
    return Array.from(this.store.values()).filter((i) => i.status === status);
  }
}
