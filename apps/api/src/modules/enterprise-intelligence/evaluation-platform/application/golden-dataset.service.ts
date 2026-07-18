import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type {
  IEvaluationRepository,
  ListOptions,
} from '../domain/evaluation-repository.interface.js';
import { GoldenDataset } from '../domain/golden-dataset.entity.js';
import type { GoldenItem, GoldenDatasetData } from '../domain/golden-dataset.entity.js';
import type { PaginatedResult } from '../../shared/types/index.js';

@Injectable()
export class GoldenDatasetService {
  private readonly logger = new Logger(GoldenDatasetService.name);

  constructor(@Inject('IEvaluationRepository') private readonly repo: IEvaluationRepository) {}

  async create(data: GoldenDatasetData): Promise<GoldenDataset> {
    const dataset = GoldenDataset.create(data);
    await this.repo.saveDataset(dataset);
    this.logger.log(
      `Created golden dataset "${data.name}" (${dataset.id}) with ${dataset.items.length} items`,
    );
    return dataset;
  }

  async get(id: string): Promise<GoldenDataset | null> {
    return this.repo.getDataset(id);
  }

  async list(options?: ListOptions): Promise<PaginatedResult<GoldenDataset>> {
    return this.repo.listDatasets(options);
  }

  async addItem(datasetId: string, item: Omit<GoldenItem, 'id'>): Promise<GoldenDataset> {
    const dataset = await this.repo.getDataset(datasetId);
    if (!dataset) throw new NotFoundException(`Dataset ${datasetId} not found`);

    const newItem: GoldenItem = { ...item, id: randomUUID() };
    const updated = GoldenDataset.reconstitute(
      dataset.id,
      dataset.name,
      dataset.description,
      dataset.version + 1,
      [...dataset.items, newItem],
      dataset.tags,
      dataset.metadata,
      dataset.createdAt,
      new Date(),
    );
    await this.repo.saveDataset(updated);
    return updated;
  }

  async removeItem(datasetId: string, itemId: string): Promise<GoldenDataset> {
    const dataset = await this.repo.getDataset(datasetId);
    if (!dataset) throw new NotFoundException(`Dataset ${datasetId} not found`);

    const filtered = dataset.items.filter((i) => i.id !== itemId);
    const updated = GoldenDataset.reconstitute(
      dataset.id,
      dataset.name,
      dataset.description,
      dataset.version + 1,
      filtered,
      dataset.tags,
      dataset.metadata,
      dataset.createdAt,
      new Date(),
    );
    await this.repo.saveDataset(updated);
    return updated;
  }

  async getItems(
    datasetId: string,
    options?: { offset?: number; limit?: number },
  ): Promise<PaginatedResult<GoldenItem>> {
    const dataset = await this.repo.getDataset(datasetId);
    if (!dataset) throw new NotFoundException(`Dataset ${datasetId} not found`);

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? dataset.items.length;
    return {
      items: dataset.items.slice(offset, offset + limit),
      total: dataset.items.length,
      offset,
      limit,
    };
  }

  async delete(id: string): Promise<void> {
    await this.repo.deleteDataset(id);
    this.logger.log(`Deleted golden dataset ${id}`);
  }
}
