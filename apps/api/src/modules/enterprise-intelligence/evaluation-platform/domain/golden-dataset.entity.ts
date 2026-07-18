import { randomUUID } from 'node:crypto';
import type { Named } from '../../shared/types/index.js';

export interface GoldenItem {
  id: string;
  input: Record<string, unknown>;
  expectedOutput: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface GoldenDatasetData {
  name: string;
  description: string;
  items: Omit<GoldenItem, 'id'>[];
  tags: string[];
  metadata?: Record<string, unknown>;
}

export class GoldenDataset implements Named {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly version: number;
  public readonly items: GoldenItem[];
  public readonly tags: string[];
  public readonly metadata: Record<string, unknown>;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    name: string,
    description: string,
    version: number,
    items: GoldenItem[],
    tags: string[],
    metadata: Record<string, unknown>,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.version = version;
    this.items = items;
    this.tags = tags;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(data: GoldenDatasetData): GoldenDataset {
    const now = new Date();
    const items: GoldenItem[] = data.items.map((item) => ({
      ...item,
      id: randomUUID(),
    }));
    return new GoldenDataset(
      randomUUID(),
      data.name,
      data.description,
      1,
      items,
      data.tags,
      data.metadata ?? {},
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    name: string,
    description: string,
    version: number,
    items: GoldenItem[],
    tags: string[],
    metadata: Record<string, unknown>,
    createdAt: Date,
    updatedAt: Date,
  ): GoldenDataset {
    return new GoldenDataset(
      id,
      name,
      description,
      version,
      items,
      tags,
      metadata,
      createdAt,
      updatedAt,
    );
  }
}
