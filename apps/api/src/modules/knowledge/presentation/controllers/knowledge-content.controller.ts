import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { KnowledgeContentService } from '../../application/services/knowledge-content.service.js';
import { SUPPORTED_KNOWLEDGE_LOCALES } from '../../domain/value-objects/knowledge-locale.vo.js';
import {
  UpsertTranslationDto,
  TranslationResponseDto,
  CreateMediaDto,
  UpdateMediaDto,
  MediaResponseDto,
  CreateFormulaDto,
  UpdateFormulaDto,
  FormulaResponseDto,
  CreateExampleDto,
  UpdateExampleDto,
  ExampleResponseDto,
  CommentLikeResponseDto,
  LocalizedKnowledgeDto,
} from '../dtos/knowledge-content.dto.js';

/**
 * Rich-content endpoints for a knowledge article: translations, media,
 * formulas, worked examples and comment reactions.
 */
@ApiTags('knowledge')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
@Controller('knowledge')
export class KnowledgeContentController {
  constructor(private readonly contentService: KnowledgeContentService) {}

  // ─── Translations ──────────────────────────────────────────────────────────

  @Get(':id/translations')
  @RequirePermissions('knowledge.read')
  @ApiOperation({
    summary: 'List article translations',
    description: 'Returns every stored translation of the article.',
  })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Translations retrieved' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async listTranslations(@Param('id') id: string, @Req() req: any) {
    const records = await this.contentService.listTranslations(id, req.workspaceId);
    return { success: true, data: TranslationResponseDto.fromRecords(records) };
  }

  @Get(':id/translations/:language')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'Get one translation by language' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiParam({ name: 'language', enum: SUPPORTED_KNOWLEDGE_LOCALES })
  @ApiResponse({ status: 200, description: 'Translation found' })
  @ApiResponse({ status: 404, description: 'Translation not found' })
  async getTranslation(
    @Param('id') id: string,
    @Param('language') language: string,
    @Req() req: any,
  ) {
    const record = await this.contentService.getTranslation(id, req.workspaceId, language);
    return { success: true, data: TranslationResponseDto.fromRecord(record) };
  }

  @Put(':id/translations')
  @RequirePermissions('knowledge.update')
  @ApiOperation({
    summary: 'Create or update a translation',
    description: 'Upserts the translation for the given language.',
  })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiBody({ type: UpsertTranslationDto })
  @ApiResponse({ status: 200, description: 'Translation saved', type: TranslationResponseDto })
  @ApiResponse({ status: 400, description: 'Unsupported locale' })
  async upsertTranslation(
    @Param('id') id: string,
    @Body() dto: UpsertTranslationDto,
    @Req() req: any,
  ) {
    const record = await this.contentService.upsertTranslation(id, req.workspaceId, dto);
    return { success: true, data: TranslationResponseDto.fromRecord(record) };
  }

  @Delete(':id/translations/:language')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('knowledge.update')
  @ApiOperation({
    summary: 'Delete a translation',
    description: 'The primary language of the article cannot be deleted.',
  })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiParam({ name: 'language', enum: SUPPORTED_KNOWLEDGE_LOCALES })
  @ApiResponse({ status: 204, description: 'Translation deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete the primary language' })
  async deleteTranslation(
    @Param('id') id: string,
    @Param('language') language: string,
    @Req() req: any,
  ) {
    await this.contentService.deleteTranslation(id, req.workspaceId, language);
  }

  @Get(':id/localized')
  @RequirePermissions('knowledge.read')
  @ApiOperation({
    summary: 'Get article in a locale',
    description: 'Resolves the article content for a locale, falling back when missing.',
  })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiQuery({ name: 'locale', required: false, enum: SUPPORTED_KNOWLEDGE_LOCALES })
  @ApiResponse({ status: 200, description: 'Localized article', type: LocalizedKnowledgeDto })
  async getLocalized(@Param('id') id: string, @Req() req: any, @Query('locale') locale?: string) {
    const view = await this.contentService.getLocalized(id, req.workspaceId, locale);
    return { success: true, data: view };
  }

  // ─── Media ─────────────────────────────────────────────────────────────────

  @Get(':id/media')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'List article media' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Media retrieved' })
  async listMedia(@Param('id') id: string, @Req() req: any) {
    const records = await this.contentService.listMedia(id, req.workspaceId);
    return { success: true, data: MediaResponseDto.fromRecords(records) };
  }

  @Post(':id/media')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Attach media to an article' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiBody({ type: CreateMediaDto })
  @ApiResponse({ status: 201, description: 'Media attached', type: MediaResponseDto })
  async addMedia(@Param('id') id: string, @Body() dto: CreateMediaDto, @Req() req: any) {
    const record = await this.contentService.addMedia(id, req.workspaceId, dto);
    return { success: true, data: MediaResponseDto.fromRecord(record) };
  }

  @Patch(':id/media/:mediaId')
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Update an attached media item' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiParam({ name: 'mediaId', description: 'Media UUID' })
  @ApiBody({ type: UpdateMediaDto })
  @ApiResponse({ status: 200, description: 'Media updated', type: MediaResponseDto })
  @ApiResponse({ status: 404, description: 'Media not found for this article' })
  async updateMedia(
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
    @Body() dto: UpdateMediaDto,
    @Req() req: any,
  ) {
    const record = await this.contentService.updateMedia(id, mediaId, req.workspaceId, dto);
    return { success: true, data: MediaResponseDto.fromRecord(record) };
  }

  @Delete(':id/media/:mediaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Detach a media item' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiParam({ name: 'mediaId', description: 'Media UUID' })
  @ApiResponse({ status: 204, description: 'Media detached' })
  async removeMedia(@Param('id') id: string, @Param('mediaId') mediaId: string, @Req() req: any) {
    await this.contentService.removeMedia(id, mediaId, req.workspaceId);
  }

  // ─── Formulas ──────────────────────────────────────────────────────────────

  @Get(':id/formulas')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'List article formulas' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Formulas retrieved' })
  async listFormulas(@Param('id') id: string, @Req() req: any) {
    const records = await this.contentService.listFormulas(id, req.workspaceId);
    return { success: true, data: FormulaResponseDto.fromRecords(records) };
  }

  @Post(':id/formulas')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('knowledge.update')
  @ApiOperation({
    summary: 'Add a formula',
    description: 'Adds a LaTeX formula and reindexes the article search text.',
  })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiBody({ type: CreateFormulaDto })
  @ApiResponse({ status: 201, description: 'Formula added', type: FormulaResponseDto })
  async addFormula(@Param('id') id: string, @Body() dto: CreateFormulaDto, @Req() req: any) {
    const record = await this.contentService.addFormula(id, req.workspaceId, dto);
    return { success: true, data: FormulaResponseDto.fromRecord(record) };
  }

  @Patch(':id/formulas/:formulaId')
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Update a formula' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiParam({ name: 'formulaId', description: 'Formula UUID' })
  @ApiBody({ type: UpdateFormulaDto })
  @ApiResponse({ status: 200, description: 'Formula updated', type: FormulaResponseDto })
  @ApiResponse({ status: 404, description: 'Formula not found for this article' })
  async updateFormula(
    @Param('id') id: string,
    @Param('formulaId') formulaId: string,
    @Body() dto: UpdateFormulaDto,
    @Req() req: any,
  ) {
    const record = await this.contentService.updateFormula(id, formulaId, req.workspaceId, dto);
    return { success: true, data: FormulaResponseDto.fromRecord(record) };
  }

  @Delete(':id/formulas/:formulaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Delete a formula' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiParam({ name: 'formulaId', description: 'Formula UUID' })
  @ApiResponse({ status: 204, description: 'Formula deleted' })
  async removeFormula(
    @Param('id') id: string,
    @Param('formulaId') formulaId: string,
    @Req() req: any,
  ) {
    await this.contentService.removeFormula(id, formulaId, req.workspaceId);
  }

  // ─── Examples ──────────────────────────────────────────────────────────────

  @Get(':id/examples')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'List worked examples' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Examples retrieved' })
  async listExamples(@Param('id') id: string, @Req() req: any) {
    const records = await this.contentService.listExamples(id, req.workspaceId);
    return { success: true, data: ExampleResponseDto.fromRecords(records) };
  }

  @Post(':id/examples')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('knowledge.update')
  @ApiOperation({
    summary: 'Add a worked example',
    description: 'Adds a step-by-step example and reindexes the article search text.',
  })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiBody({ type: CreateExampleDto })
  @ApiResponse({ status: 201, description: 'Example added', type: ExampleResponseDto })
  async addExample(@Param('id') id: string, @Body() dto: CreateExampleDto, @Req() req: any) {
    const record = await this.contentService.addExample(id, req.workspaceId, dto);
    return { success: true, data: ExampleResponseDto.fromRecord(record) };
  }

  @Patch(':id/examples/:exampleId')
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Update a worked example' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiParam({ name: 'exampleId', description: 'Example UUID' })
  @ApiBody({ type: UpdateExampleDto })
  @ApiResponse({ status: 200, description: 'Example updated', type: ExampleResponseDto })
  @ApiResponse({ status: 404, description: 'Example not found for this article' })
  async updateExample(
    @Param('id') id: string,
    @Param('exampleId') exampleId: string,
    @Body() dto: UpdateExampleDto,
    @Req() req: any,
  ) {
    const record = await this.contentService.updateExample(id, exampleId, req.workspaceId, dto);
    return { success: true, data: ExampleResponseDto.fromRecord(record) };
  }

  @Delete(':id/examples/:exampleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Delete a worked example' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiParam({ name: 'exampleId', description: 'Example UUID' })
  @ApiResponse({ status: 204, description: 'Example deleted' })
  async removeExample(
    @Param('id') id: string,
    @Param('exampleId') exampleId: string,
    @Req() req: any,
  ) {
    await this.contentService.removeExample(id, exampleId, req.workspaceId);
  }

  // ─── Comment reactions ─────────────────────────────────────────────────────

  @Post(':id/comments/:commentId/like')
  @RequirePermissions('knowledge.read')
  @ApiOperation({
    summary: 'Like a comment',
    description: 'Idempotent — liking an already-liked comment does not change the count.',
  })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiParam({ name: 'commentId', description: 'Comment UUID' })
  @ApiResponse({ status: 200, description: 'Comment liked', type: CommentLikeResponseDto })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async likeComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const record = await this.contentService.likeComment(id, commentId, req.workspaceId, userId);
    return { success: true, data: CommentLikeResponseDto.fromRecord(record, userId) };
  }

  @Delete(':id/comments/:commentId/like')
  @RequirePermissions('knowledge.read')
  @ApiOperation({
    summary: 'Remove a like from a comment',
    description: 'Idempotent — removing a like that was never given is a no-op.',
  })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiParam({ name: 'commentId', description: 'Comment UUID' })
  @ApiResponse({ status: 200, description: 'Like removed', type: CommentLikeResponseDto })
  async unlikeComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const record = await this.contentService.unlikeComment(id, commentId, req.workspaceId, userId);
    return { success: true, data: CommentLikeResponseDto.fromRecord(record, userId) };
  }
}
