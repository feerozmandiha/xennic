import {
  Controller, Get, Post, Delete,
  Body, Param, Query, Req,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
  ApiResponse, ApiParam, ApiQuery, ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard }   from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { AiService }      from '../../application/services/ai.service.js';
import {
  CreateConversationDto, SendMessageDto,
  AgentResponseDto, ConversationResponseDto,
  ValidateCalculationDto, ValidationResponseDto,
} from '../dtos/ai.dto.js';

@ApiTags('ai')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ── GET /ai/agents ────────────────────────────────────────────────────────

  @Get('agents')
  @ApiOperation({ summary: 'List active AI agents' })
  @ApiResponse({ status: 200, description: 'Agents retrieved' })
  async getAgents() {
    const agents = await this.aiService.getAgents();
    return { success: true, data: AgentResponseDto.fromEntities(agents) };
  }

  // ── GET /ai/conversations ─────────────────────────────────────────────────

  @Get('conversations')
  @ApiOperation({ summary: 'List conversations in workspace' })
  @ApiQuery({ name: 'page',  required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Conversations retrieved' })
  async listConversations(
    @Req() req: any,
    @Query('page')  page?:  string,
    @Query('limit') limit?: string,
  ) {
    const convs = await this.aiService.listConversations(
      req.workspaceId,
      page  ? parseInt(page,  10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
    return {
      success: true,
      data: convs.map(c => ConversationResponseDto.fromEntity(c)),
    };
  }

  // ── POST /ai/conversations ────────────────────────────────────────────────

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiBody({ type: CreateConversationDto })
  @ApiResponse({ status: 201, description: 'Conversation created' })
  async createConversation(
    @Req() req: any,
    @Body() dto: CreateConversationDto,
  ) {
    const conv = await this.aiService.createConversation(
      req.workspaceId, dto.agentSlug, dto.title,
    );
    return { success: true, data: ConversationResponseDto.fromEntity(conv) };
  }

  // ── GET /ai/conversations/:id ─────────────────────────────────────────────

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation with messages' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiResponse({ status: 200, description: 'Conversation retrieved' })
  async getConversation(@Param('id') id: string, @Req() req: any) {
    const conv = await this.aiService.getConversation(id, req.workspaceId);
    return { success: true, data: ConversationResponseDto.fromEntity(conv) };
  }

  // ── DELETE /ai/conversations/:id ──────────────────────────────────────────

  @Delete('conversations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete conversation' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  async deleteConversation(@Param('id') id: string, @Req() req: any) {
    await this.aiService.deleteConversation(id, req.workspaceId);
  }

  // ── POST /ai/conversations/:id/messages ───────────────────────────────────

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message and get AI response' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 200, description: 'AI response returned' })
  async sendMessage(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: SendMessageDto,
  ) {
    const result = await this.aiService.sendMessage(
      id, req.workspaceId, req.user.userId, dto.content,
    );
    return {
      success: true,
      data: {
        userMessageId:      result.userMsgId,
        assistantMessageId: result.assistantMsgId,
        reply:              result.reply,
        tokens:             result.tokens,
      },
    };
  }

  // ── POST /ai/validate ─────────────────────────────────────────────────────

  @Post('validate')
  @ApiOperation({ summary: 'Validate an engineering calculation using AI' })
  @ApiBody({ type: ValidateCalculationDto })
  @ApiResponse({ status: 200, description: 'Validation completed' })
  async validateCalculation(@Req() req: any, @Body() dto: ValidateCalculationDto) {
    const result = await this.aiService.validateCalculation(
      dto.type, dto.inputs, dto.result,
    );
    return { success: true, data: ValidationResponseDto.fromAiResponse(result.details, result) };
  }

  // ── GET /ai/usage ─────────────────────────────────────────────────────────

  @Get('usage')
  @ApiOperation({ summary: 'AI usage stats for current month' })
  @ApiResponse({ status: 200, description: 'Usage stats retrieved' })
  async getUsage(@Req() req: any) {
    const stats = await this.aiService.getUsageStats(req.workspaceId);
    return { success: true, data: stats };
  }
}
