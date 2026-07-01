import { Injectable, Inject, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { MinioService } from '../../../storage/infrastructure/minio/minio.service.js';
import { FingerprintService } from '../utils/fingerprint.service.js';
import { isAllowedMimeType, getExtension } from '../utils/mime-validator.js';
import { EkosEntity } from '../../domain/ekos.entity.js';
import { EKO_STATUS, ALLOWED_MIME_TYPES } from '../../domain/constants.js';
import type { IKnowledgeFactoryRepository } from '../../domain/interfaces/knowledge-factory.repository.interface.js';

@Injectable()
export class IntakeService {
  private readonly logger = new Logger(IntakeService.name);

  constructor(
    private readonly minioService: MinioService,
    private readonly fingerprintService: FingerprintService,
    @Inject('IKnowledgeFactoryRepository')
    private readonly ekoRepository: IKnowledgeFactoryRepository,
  ) {}

  async ingestDocument(
    workspaceId: string,
    userId: string,
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<EkosEntity> {
    if (!isAllowedMimeType(mimeType)) {
      throw new BadRequestException(
        `Unsupported MIME type: ${mimeType}. Allowed: ${Object.keys(ALLOWED_MIME_TYPES).join(', ')}`,
      );
    }

    const checksum = this.fingerprintService.computeChecksum(fileBuffer);

    const existing = await this.ekoRepository.findByChecksum(checksum);
    if (existing) {
      throw new ConflictException('Document with identical content already exists');
    }

    const ext = getExtension(mimeType);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const id = crypto.randomUUID();
    const objectKey = `${workspaceId}/${year}/${month}/${id}.${ext}`;

    await this.minioService.uploadBuffer(
      'documents',
      objectKey,
      fileBuffer,
      mimeType,
      fileBuffer.length,
    );

    const fileRecord = await prisma.files.create({
      data: {
        id: crypto.randomUUID(),
        workspace_id: workspaceId,
        bucket: 'documents',
        path: objectKey,
        filename: `${id}.${ext}`,
        original_name: originalName,
        extension: ext,
        mime_type: mimeType,
        size: fileBuffer.length,
        checksum,
        uploaded_by: userId,
      },
    });

    const entity = EkosEntity.reconstitute({
      id,
      documentId: fileRecord.id,
      workspaceId,
      sourceType: ext === 'txt' ? 'md' : (ext as any),
      content: '',
      metadata: { originalName, mimeType, fileSize: fileBuffer.length },
      checksum,
      status: EKO_STATUS.PENDING,
      createdAt: now,
      updatedAt: now,
    });

    await this.ekoRepository.save(entity);

    this.logger.log(`Ingested document ${originalName} as EKO ${entity.id}`);
    return entity;
  }
}
