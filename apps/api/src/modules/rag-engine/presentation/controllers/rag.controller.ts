import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { RagOrchestratorService } from '../../application/services/rag-orchestrator.service.js';
import { RagQueryDto, RagResponseDto, RagErrorDto } from '../dtos/rag-query.dto.js';
import type { RagQuery } from '../../domain/types/rag.types.js';

@ApiTags('rag-engine')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('rag')
export class RagController {
  constructor(private readonly orchestrator: RagOrchestratorService) {}

  @Post('query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Query the Engineering RAG Engine',
    description: 'Retrieves relevant engineering knowledge, builds context, generates evidence-backed answers.',
  })
  @ApiResponse({ status: 200, description: 'RAG response with citations', type: RagResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid query', type: RagErrorDto })
  async query(@Req() req: any, @Body() dto: RagQueryDto) {
    const query: RagQuery = {
      question: dto.question,
      workspaceId: req.workspaceId,
      filters: {
        tiers: dto.tiers as any,
        languages: dto.languages,
        categoryIds: dto.categoryIds,
        ontologyEntityIds: dto.ontologyEntityIds,
        versionStatus: dto.versionStatus as any,
        minAuthorityScore: dto.minAuthorityScore,
      },
      options: {
        maxTokens: dto.maxTokens ?? 4000,
        topK: dto.topK ?? 10,
        includeEvidenceChain: dto.includeEvidenceChain ?? false,
      },
    };

    const result = await this.orchestrator.query(query);
    return RagResponseDto.fromDomain(result);
  }
}
