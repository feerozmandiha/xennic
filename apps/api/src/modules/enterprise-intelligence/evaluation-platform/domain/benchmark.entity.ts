import { randomUUID } from 'node:crypto';
import type { Named } from '../../shared/types/index.js';

export enum BenchmarkMetrics {
  ACCURACY = 'accuracy',
  PRECISION = 'precision',
  RECALL = 'recall',
  F1 = 'f1',
  LATENCY = 'latency',
  COST = 'cost',
  COHERENCE = 'coherence',
  RELEVANCE = 'relevance',
}

export enum BenchmarkStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export interface BenchmarkData {
  name: string;
  description: string;
  datasetId: string;
  metrics: string[];
  tags: string[];
  metadata?: Record<string, unknown>;
}

export class BenchmarkEntity implements Named {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly datasetId: string;
  public readonly metrics: string[];
  public readonly tags: string[];
  public readonly version: number;
  public readonly status: BenchmarkStatus;
  public readonly metadata: Record<string, unknown>;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    name: string,
    description: string,
    datasetId: string,
    metrics: string[],
    tags: string[],
    version: number,
    status: BenchmarkStatus,
    metadata: Record<string, unknown>,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.datasetId = datasetId;
    this.metrics = metrics;
    this.tags = tags;
    this.version = version;
    this.status = status;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(data: BenchmarkData): BenchmarkEntity {
    const now = new Date();
    return new BenchmarkEntity(
      randomUUID(),
      data.name,
      data.description,
      data.datasetId,
      data.metrics,
      data.tags,
      1,
      BenchmarkStatus.DRAFT,
      data.metadata ?? {},
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    name: string,
    description: string,
    datasetId: string,
    metrics: string[],
    tags: string[],
    version: number,
    status: BenchmarkStatus,
    metadata: Record<string, unknown>,
    createdAt: Date,
    updatedAt: Date,
  ): BenchmarkEntity {
    return new BenchmarkEntity(
      id,
      name,
      description,
      datasetId,
      metrics,
      tags,
      version,
      status,
      metadata,
      createdAt,
      updatedAt,
    );
  }
}
