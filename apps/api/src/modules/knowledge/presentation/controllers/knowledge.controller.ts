import {
  Controller,
  Get,
  Post,
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
import { KnowledgeService } from '../../application/services/knowledge.service.js';
import {
  CreateKnowledgeDto,
  UpdateKnowledgeDto,
  KnowledgeSearchQueryDto,
  AssignReviewerDto,
  AddTaxonomyDto,
  KnowledgeResponseDto,
  KnowledgeVersionDto,
  CreateCommentDto,
  UpdateCommentDto,
  CommentResponseDto,
  CreateWorkflowCommentDto,
  WorkflowResponseDto,
  KnowledgeAnalyticsDto,
  KnowledgeDashboardStatsDto,
  RelatedCalculationDto,
} from '../dtos/knowledge.dto.js';

@ApiTags('knowledge')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  // ─── GET /knowledge ────────────────────────────────────────────────────────

  @Get()
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'List knowledge articles', description: 'Returns paginated list of knowledge articles in the workspace.' })
  @ApiQuery({ name: 'page',   required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit',  required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'review', 'published', 'archived'] })
  @ApiResponse({ status: 200, description: 'Articles retrieved successfully' })
  async findAll(
    @Req() req: any,
    @Query('page')   page?: string,
    @Query('limit')  limit?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.knowledgeService.findAll(
      req.workspaceId,
      page  ? parseInt(page,  10) : 1,
      limit ? parseInt(limit, 10) : 20,
      status,
    );
    return {
      success: true,
      data: KnowledgeResponseDto.fromEntities(result.data),
      meta: result.meta,
    };
  }

  // ─── POST /knowledge ───────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('knowledge.create')
  @ApiOperation({ summary: 'Create knowledge article', description: 'Creates a new knowledge article in the workspace.' })
  @ApiBody({ type: CreateKnowledgeDto })
  @ApiResponse({ status: 201, description: 'Article created', type: KnowledgeResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(@Body() dto: CreateKnowledgeDto, @Req() req: any) {
    const entity = await this.knowledgeService.create(
      dto,
      req.workspaceId,
      req.user.userId,
    );
    return { success: true, data: KnowledgeResponseDto.fromEntity(entity) };
  }

  // ─── SEARCH /knowledge/search ──────────────────────────────────────────────

  @Get('search')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'Search knowledge articles', description: 'Full-text search with taxonomy and status filters.' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(@Req() req: any, @Query() query: KnowledgeSearchQueryDto) {
    const result = await this.knowledgeService.search(req.workspaceId, query);
    return {
      success: true,
      data: KnowledgeResponseDto.fromEntities(result.data),
      meta: result.meta,
    };
  }

  // ─── GET /knowledge/slug/:slug ─────────────────────────────────────────────

  @Get('slug/:slug')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'Get article by slug', description: 'Returns a knowledge article by its slug.' })
  @ApiParam({ name: 'slug', description: 'Article slug' })
  @ApiResponse({ status: 200, description: 'Article found', type: KnowledgeResponseDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async findBySlug(@Param('slug') slug: string, @Req() req: any) {
    const entity = await this.knowledgeService.findBySlug(req.workspaceId, slug);
    return { success: true, data: KnowledgeResponseDto.fromEntity(entity) };
  }

  // ─── GET /knowledge/:id ────────────────────────────────────────────────────

  @Get(':id')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'Get article by ID', description: 'Returns a specific knowledge article by ID.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Article found', type: KnowledgeResponseDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const entity = await this.knowledgeService.findOne(id, req.workspaceId);
    return { success: true, data: KnowledgeResponseDto.fromEntity(entity) };
  }

  // ─── PATCH /knowledge/:id ──────────────────────────────────────────────────

  @Patch(':id')
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Update article', description: 'Updates knowledge article details.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiBody({ type: UpdateKnowledgeDto })
  @ApiResponse({ status: 200, description: 'Article updated', type: KnowledgeResponseDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateKnowledgeDto,
    @Req() req: any,
  ) {
    const entity = await this.knowledgeService.update(id, req.workspaceId, dto);
    return { success: true, data: KnowledgeResponseDto.fromEntity(entity) };
  }

  // ─── DELETE /knowledge/:id ─────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('knowledge.delete')
  @ApiOperation({ summary: 'Soft delete article', description: 'Marks article as deleted (recoverable).' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 204, description: 'Article deleted' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.knowledgeService.remove(id, req.workspaceId);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // WORKFLOW
  // ══════════════════════════════════════════════════════════════════════════

  // ─── POST /knowledge/:id/review ────────────────────────────────────────────

  @Post(':id/review')
  @RequirePermissions('knowledge.review')
  @ApiOperation({ summary: 'Request review', description: 'Sends article to review workflow.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiBody({ type: AssignReviewerDto })
  @ApiResponse({ status: 200, description: 'Review requested' })
  async requestReview(
    @Param('id') id: string,
    @Body() dto: AssignReviewerDto,
    @Req() req: any,
  ) {
    const entity = await this.knowledgeService.requestReview(
      id,
      req.workspaceId,
      dto.reviewerId,
    );
    return { success: true, data: KnowledgeResponseDto.fromEntity(entity) };
  }

  // ─── POST /knowledge/:id/publish ───────────────────────────────────────────

  @Post(':id/publish')
  @RequirePermissions('knowledge.publish')
  @ApiOperation({ summary: 'Publish article', description: 'Publishes the article and creates a version snapshot.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Article published' })
  async publish(@Param('id') id: string, @Req() req: any) {
    const entity = await this.knowledgeService.publish(id, req.workspaceId);
    return { success: true, data: KnowledgeResponseDto.fromEntity(entity) };
  }

  // ─── POST /knowledge/:id/reject ────────────────────────────────────────────

  @Post(':id/reject')
  @RequirePermissions('knowledge.review')
  @ApiOperation({ summary: 'Reject review', description: 'Sends article back to draft from review.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Review rejected' })
  async rejectReview(@Param('id') id: string, @Req() req: any) {
    const entity = await this.knowledgeService.rejectReview(id, req.workspaceId);
    return { success: true, data: KnowledgeResponseDto.fromEntity(entity) };
  }

  // ─── POST /knowledge/:id/archive ───────────────────────────────────────────

  @Post(':id/archive')
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Archive article', description: 'Archives a published article.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Article archived' })
  async archive(@Param('id') id: string, @Req() req: any) {
    const entity = await this.knowledgeService.archive(id, req.workspaceId);
    return { success: true, data: KnowledgeResponseDto.fromEntity(entity) };
  }

  // ─── POST /knowledge/:id/restore ───────────────────────────────────────────

  @Post(':id/restore')
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Restore from archive', description: 'Restores an archived article back to draft.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Article restored' })
  async restoreFromArchive(@Param('id') id: string, @Req() req: any) {
    const entity = await this.knowledgeService.restoreFromArchive(id, req.workspaceId);
    return { success: true, data: KnowledgeResponseDto.fromEntity(entity) };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAXONOMY
  // ══════════════════════════════════════════════════════════════════════════

  // ─── GET /knowledge/:id/taxonomy ───────────────────────────────────────────

  @Get(':id/taxonomy')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'Get taxonomy', description: 'Returns all taxonomy assignments for an article.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Taxonomy retrieved' })
  async getTaxonomy(@Param('id') id: string, @Req() req: any) {
    const taxonomy = await this.knowledgeService.getTaxonomy(id, req.workspaceId);
    return { success: true, data: taxonomy };
  }

  // ─── POST /knowledge/:id/taxonomy ──────────────────────────────────────────

  @Post(':id/taxonomy')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Add taxonomy', description: 'Assigns a taxonomy entry to the article.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiBody({ type: AddTaxonomyDto })
  @ApiResponse({ status: 201, description: 'Taxonomy added' })
  @ApiResponse({ status: 409, description: 'Already assigned' })
  async addTaxonomy(
    @Param('id') id: string,
    @Body() dto: AddTaxonomyDto,
    @Req() req: any,
  ) {
    await this.knowledgeService.addTaxonomy(id, req.workspaceId, dto);
    return { success: true, message: 'Taxonomy assigned' };
  }

  // ─── DELETE /knowledge/:id/taxonomy/:taxonomyId ────────────────────────────

  @Delete(':id/taxonomy/:taxonomyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Remove taxonomy', description: 'Removes a taxonomy assignment.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiParam({ name: 'taxonomyId', description: 'Taxonomy assignment UUID' })
  @ApiResponse({ status: 204, description: 'Taxonomy removed' })
  async removeTaxonomy(
    @Param('id') id: string,
    @Param('taxonomyId') taxonomyId: string,
    @Req() req: any,
  ) {
    await this.knowledgeService.removeTaxonomy(id, req.workspaceId, taxonomyId);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VERSIONS
  // ══════════════════════════════════════════════════════════════════════════

  // ─── GET /knowledge/:id/versions ─────────────────────────────────────────

  @Get(':id/versions')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'List versions', description: 'Returns all version snapshots for an article.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Versions retrieved' })
  async getVersions(@Param('id') id: string, @Req() req: any) {
    const versions = await this.knowledgeService.getVersions(id, req.workspaceId);
    return { success: true, data: versions };
  }

  // ─── GET /knowledge/:id/versions/:versionId ───────────────────────────────

  @Get(':id/versions/:versionId')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'Get version', description: 'Returns a specific version snapshot.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiParam({ name: 'versionId', description: 'Version UUID' })
  @ApiResponse({ status: 200, description: 'Version retrieved' })
  @ApiResponse({ status: 404, description: 'Version not found' })
  async getVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Req() req: any,
  ) {
    const version = await this.knowledgeService.getVersion(id, versionId, req.workspaceId);
    return { success: true, data: version };
  }

  // ─── POST /knowledge/:id/versions/:versionId/restore ─────────────────────

  @Post(':id/versions/:versionId/restore')
  @RequirePermissions('knowledge.publish')
  @ApiOperation({ summary: 'Restore version', description: 'Restores content from a previous version (creates a new version).' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiParam({ name: 'versionId', description: 'Version UUID' })
  @ApiResponse({ status: 200, description: 'Version restored' })
  async restoreVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Req() req: any,
  ) {
    const entity = await this.knowledgeService.restoreVersion(
      id, versionId, req.workspaceId, req.user.userId,
    );
    return { success: true, data: KnowledgeResponseDto.fromEntity(entity) };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // COMMENTS
  // ══════════════════════════════════════════════════════════════════════════

  // ─── GET /knowledge/:id/comments ──────────────────────────────────────────

  @Get(':id/comments')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'List comments', description: 'Returns all comments (top-level + replies) for an article.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Comments retrieved' })
  async getComments(@Param('id') id: string, @Req() req: any) {
    const comments = await this.knowledgeService.getComments(id, req.workspaceId);
    return { success: true, data: comments };
  }

  // ─── POST /knowledge/:id/comments ────────────────────────────────────────

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('knowledge.create')
  @ApiOperation({ summary: 'Add comment', description: 'Adds a comment to the article. Use parentId for replies.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, description: 'Comment created' })
  async createComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @Req() req: any,
  ) {
    const comment = await this.knowledgeService.createComment(
      id, req.workspaceId, req.user.userId, dto,
    );
    return { success: true, data: comment };
  }

  // ─── PATCH /knowledge/:id/comments/:commentId ────────────────────────────

  @Patch(':id/comments/:commentId')
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Edit comment', description: 'Edits your own comment.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiParam({ name: 'commentId', description: 'Comment UUID' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({ status: 200, description: 'Comment updated' })
  async updateComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: any,
  ) {
    const comment = await this.knowledgeService.updateComment(
      id, commentId, req.workspaceId, req.user.userId, dto,
    );
    return { success: true, data: comment };
  }

  // ─── DELETE /knowledge/:id/comments/:commentId ───────────────────────────

  @Delete(':id/comments/:commentId')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('knowledge.delete')
  @ApiOperation({ summary: 'Delete comment', description: 'Soft-deletes your own comment.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiParam({ name: 'commentId', description: 'Comment UUID' })
  @ApiResponse({ status: 200, description: 'Comment deleted' })
  async deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Req() req: any,
  ) {
    await this.knowledgeService.deleteComment(
      id, commentId, req.workspaceId, req.user.userId,
    );
    return { success: true, message: 'Comment deleted' };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // WORKFLOW
  // ══════════════════════════════════════════════════════════════════════════

  // ─── GET /knowledge/:id/workflow ──────────────────────────────────────────

  @Get(':id/workflow')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'Get workflow', description: 'Returns the workflow (review/publish/reject history) for an article.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Workflow retrieved' })
  async getWorkflow(@Param('id') id: string, @Req() req: any) {
    const workflow = await this.knowledgeService.getWorkflow(id, req.workspaceId);
    return { success: true, data: workflow };
  }

  // ─── POST /knowledge/:id/workflow/submit ─────────────────────────────────

  @Post(':id/workflow/submit')
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Submit for review', description: 'Submits the article for review via workflow.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiBody({ type: CreateWorkflowCommentDto })
  @ApiResponse({ status: 201, description: 'Submitted for review' })
  @HttpCode(HttpStatus.CREATED)
  async submitWorkflow(
    @Param('id') id: string,
    @Body() dto: CreateWorkflowCommentDto,
    @Req() req: any,
  ) {
    const workflow = await this.knowledgeService.submitWorkflow(
      id, req.workspaceId, req.user.userId, dto,
    );
    return { success: true, data: workflow };
  }

  // ─── POST /knowledge/:id/workflow/approve ────────────────────────────────

  @Post(':id/workflow/approve')
  @RequirePermissions('knowledge.review')
  @ApiOperation({ summary: 'Approve review', description: 'Approves the review, publishes the article via workflow.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiBody({ type: CreateWorkflowCommentDto })
  @ApiResponse({ status: 200, description: 'Workflow approved' })
  async approveWorkflow(
    @Param('id') id: string,
    @Body() dto: CreateWorkflowCommentDto,
    @Req() req: any,
  ) {
    const workflow = await this.knowledgeService.approveWorkflow(
      id, req.workspaceId, req.user.userId, dto,
    );
    return { success: true, data: workflow };
  }

  // ─── POST /knowledge/:id/workflow/reject ─────────────────────────────────

  @Post(':id/workflow/reject')
  @RequirePermissions('knowledge.review')
  @ApiOperation({ summary: 'Reject review', description: 'Rejects the review, returns article to draft via workflow.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiBody({ type: CreateWorkflowCommentDto })
  @ApiResponse({ status: 200, description: 'Workflow rejected' })
  async rejectWorkflow(
    @Param('id') id: string,
    @Body() dto: CreateWorkflowCommentDto,
    @Req() req: any,
  ) {
    const workflow = await this.knowledgeService.rejectWorkflow(
      id, req.workspaceId, req.user.userId, dto,
    );
    return { success: true, data: workflow };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ENGINEERING INTEGRATION
  // ══════════════════════════════════════════════════════════════════════════

  // ─── GET /knowledge/by-calculator/:calculatorType ─────────────────────────

  @Get('by-calculator/:calculatorType')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'Find articles by calculator type', description: 'Returns knowledge articles that reference a specific calculation type (e.g. BASIC-001).' })
  @ApiParam({ name: 'calculatorType', description: 'Calculation type code (e.g. BASIC-001, CABLE-003)' })
  @ApiResponse({ status: 200, description: 'Articles found' })
  async findByCalculatorType(
    @Param('calculatorType') calculatorType: string,
    @Req() req: any,
  ) {
    const entities = await this.knowledgeService.findByCalculatorType(
      calculatorType, req.workspaceId,
    );
    return {
      success: true,
      data: KnowledgeResponseDto.fromEntities(entities),
    };
  }

  // ─── GET /knowledge/:id/related-calculations ──────────────────────────────

  @Get(':id/related-calculations')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'Get related calculations', description: 'Returns calculations that match the calculator types referenced by this article.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Related calculations' })
  async getRelatedCalculations(@Param('id') id: string, @Req() req: any) {
    const calculations = await this.knowledgeService.getRelatedCalculations(
      id, req.workspaceId,
    );
    return { success: true, data: calculations };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ANALYTICS
  // ══════════════════════════════════════════════════════════════════════════

  // ─── GET /knowledge/analytics/dashboard ────────────────────────────────────

  @Get('analytics/dashboard')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'Dashboard analytics', description: 'Returns aggregate analytics for the workspace.' })
  @ApiResponse({ status: 200, description: 'Dashboard stats' })
  async getDashboardAnalytics(@Req() req: any) {
    const stats = await this.knowledgeService.getDashboardAnalytics(req.workspaceId);
    return { success: true, data: stats };
  }

  // ─── GET /knowledge/:id/analytics ─────────────────────────────────────────

  @Get(':id/analytics')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'Get analytics', description: 'Returns analytics for a specific article.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved' })
  async getAnalytics(@Param('id') id: string, @Req() req: any) {
    const analytics = await this.knowledgeService.getAnalytics(id, req.workspaceId);
    return { success: true, data: analytics };
  }

  // ─── POST /knowledge/:id/view ──────────────────────────────────────────────

  @Post(':id/view')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'Record view', description: 'Increments the view counter for an article.' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'View recorded' })
  async recordView(@Param('id') id: string, @Req() req: any) {
    await this.knowledgeService.recordView(id, req.workspaceId);
    return { success: true, message: 'View recorded' };
  }
}
