import { BadRequestException } from '@nestjs/common';

// ── Mock external dependency chains (guards/services pull in @xennic/database ESM) ──
jest.mock('../../../auth/infrastructure/guards/jwt-auth.guard.js', () => ({
  JwtAuthGuard: class JwtAuthGuard {},
}));
jest.mock('../../../rbac/infrastructure/guards/permissions.guard.js', () => ({
  PermissionsGuard: class PermissionsGuard {},
}));
jest.mock('../../../rbac/infrastructure/guards/workspace.guard.js', () => ({
  WorkspaceGuard: class WorkspaceGuard {},
}));
jest.mock('../../../rbac/infrastructure/decorators/permissions.decorator.js', () => ({
  RequirePermissions: () => () => undefined,
}));
jest.mock('../../application/services/document-intake.service.js', () => ({
  DocumentIntakeService: class DocumentIntakeService {},
}));
jest.mock('../../application/services/pipeline-orchestrator.service.js', () => ({
  PipelineOrchestratorService: class PipelineOrchestratorService {},
}));
jest.mock('../../application/services/publishing.service.js', () => ({
  PublishingService: class PublishingService {},
}));

import { DocumentsController } from './documents.controller.js';

describe('DocumentsController (Fastify multipart)', () => {
  const intake = { registerDocument: jest.fn(), deleteDocument: jest.fn() } as any;
  const orchestrator = { runPipeline: jest.fn() } as any;
  const publishing = { publishDocument: jest.fn() } as any;

  const controller = new DocumentsController(intake, orchestrator, publishing);

  beforeEach(() => jest.clearAllMocks());

  describe('uploadDocument', () => {
    it('reads the file via req.file() (Fastify API) and forwards fields.metadata', async () => {
      intake.registerDocument.mockResolvedValue({
        id: 'doc-1',
        workspaceId: 'ws-1',
        status: 'intake',
      });

      const req = {
        user: { userId: 'user-1' },
        workspaceId: 'ws-1',
        file: jest.fn().mockResolvedValue({
          filename: 'report.pdf',
          mimetype: 'application/pdf',
          toBuffer: jest.fn().mockResolvedValue(Buffer.from('pdf-data')),
          fields: { metadata: { value: '{"author":"xennic"}' } },
        }),
      };

      const result = await controller.uploadDocument(req);

      expect(req.file).toHaveBeenCalledTimes(1);
      expect(intake.registerDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: 'ws-1',
          filename: 'report.pdf',
          originalName: 'report.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 8,
          contentType: 'application/pdf',
          createdBy: 'user-1',
          metadata: { author: 'xennic' },
        }),
      );
      expect(result.data.status).toBe('intake');
    });

    it('accepts uploads without a metadata field', async () => {
      intake.registerDocument.mockResolvedValue({
        id: 'doc-2',
        workspaceId: 'ws-1',
        status: 'intake',
      });

      const req = {
        user: { userId: 'user-1' },
        workspaceId: 'ws-1',
        file: jest.fn().mockResolvedValue({
          filename: 'plain.txt',
          mimetype: 'text/plain',
          toBuffer: jest.fn().mockResolvedValue(Buffer.from('hello')),
          fields: {},
        }),
      };

      await controller.uploadDocument(req);

      expect(intake.registerDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'plain.txt',
          sizeBytes: 5,
          metadata: undefined,
        }),
      );
    });

    it('throws BadRequestException when no file is present', async () => {
      const req = {
        user: { userId: 'user-1' },
        workspaceId: 'ws-1',
        file: jest.fn().mockResolvedValue(undefined),
      };

      await expect(controller.uploadDocument(req)).rejects.toThrow(BadRequestException);
      expect(intake.registerDocument).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when workspaceId is missing', async () => {
      const req = {
        user: { sub: 'user-1' },
        file: jest.fn().mockResolvedValue({
          filename: 'a.pdf',
          mimetype: 'application/pdf',
          toBuffer: jest.fn().mockResolvedValue(Buffer.from('x')),
          fields: {},
        }),
      };

      await expect(controller.uploadDocument(req)).rejects.toThrow(BadRequestException);
      expect(intake.registerDocument).not.toHaveBeenCalled();
    });
  });

  describe('deleteDocument', () => {
    it('deletes through the intake service', async () => {
      intake.deleteDocument.mockResolvedValue(undefined);

      const result = await controller.deleteDocument('doc-9');

      expect(intake.deleteDocument).toHaveBeenCalledWith('doc-9');
      expect(result.data.deleted).toBe(true);
    });
  });
});
