import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import type { ArtifactType } from '../domain/shared-artifact.entity.js';
import { SharedArtifact } from '../domain/shared-artifact.entity.js';
import type { IContextRepository } from '../domain/context-repository.interface.js';
import type { Metadata } from '../../shared/types/index.js';

@Injectable()
export class ArtifactService {
  private readonly logger = new Logger(ArtifactService.name);

  constructor(
    @Inject('IContextRepository')
    private readonly repository: IContextRepository,
  ) {}

  async store(
    executionId: string,
    name: string,
    content: unknown,
    type: ArtifactType,
    createdBy: string,
    mimeType?: string,
    size?: number,
  ): Promise<SharedArtifact> {
    const metadata: Metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      updatedBy: null,
    };

    const artifact = SharedArtifact.create({
      executionId,
      name,
      type,
      content,
      mimeType,
      size,
      metadata,
    });

    await this.repository.saveArtifact(artifact);
    this.logger.log(`Stored artifact ${artifact.id} (${name}) in execution ${executionId}`);
    return artifact;
  }

  async get(artifactId: string): Promise<SharedArtifact> {
    const artifact = await this.repository.getArtifact(artifactId);
    if (!artifact) {
      throw new NotFoundException(`SharedArtifact ${artifactId} not found`);
    }
    return artifact;
  }

  async list(executionId: string): Promise<SharedArtifact[]> {
    return this.repository.listArtifacts(executionId);
  }

  async delete(artifactId: string): Promise<void> {
    const artifact = await this.repository.getArtifact(artifactId);
    if (!artifact) {
      throw new NotFoundException(`SharedArtifact ${artifactId} not found`);
    }

    await this.repository.deleteArtifact(artifactId);
    this.logger.log(`Deleted artifact ${artifactId}`);
  }

  async share(
    targetExecutionId: string,
    artifactId: string,
    createdBy: string,
  ): Promise<SharedArtifact> {
    const source = await this.get(artifactId);

    const metadata: Metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      updatedBy: null,
    };

    const copy = SharedArtifact.create({
      executionId: targetExecutionId,
      name: source.name,
      type: source.type,
      content: source.content,
      mimeType: source.mimeType,
      size: source.size,
      metadata,
    });

    await this.repository.saveArtifact(copy);
    this.logger.log(`Shared artifact ${artifactId} to execution ${targetExecutionId} as ${copy.id}`);
    return copy;
  }
}
