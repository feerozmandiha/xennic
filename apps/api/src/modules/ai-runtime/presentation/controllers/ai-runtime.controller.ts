import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { ExecutionPipelineService } from '../../application/services/execution-pipeline.service.js';
import { ToolRegistryService } from '../../application/services/tool-registry.service.js';
import { PromptRegistryService } from '../../application/services/prompt-registry.service.js';
import { AgentSessionManagerService } from '../../application/services/agent-session-manager.service.js';
import { StreamingResponseManagerService } from '../../application/services/streaming-response-manager.service.js';
import { ExecuteDto, ExecutionResultDto, RuntimeInfoDto } from '../dtos/runtime.dto.js';
import { RegisterToolDto, ToolResponseDto } from '../dtos/tool.dto.js';
import { ExecutionContext } from '../../domain/types/execution.types.js';
import { ToolDefinition } from '../../domain/types/tool.types.js';
import type { ToolParameter } from '../../domain/types/tool.types.js';

const moduleStartTime = Date.now();

@ApiTags('ai-runtime')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('ai-runtime')
export class AiRuntimeController {
  constructor(
    private readonly pipeline: ExecutionPipelineService,
    private readonly toolRegistry: ToolRegistryService,
    private readonly promptRegistry: PromptRegistryService,
    private readonly sessionManager: AgentSessionManagerService,
    private readonly streaming: StreamingResponseManagerService,
  ) {}

  @Get('info')
  @ApiOperation({ summary: 'AI Runtime information and stats' })
  @ApiResponse({ status: 200, description: 'Runtime info' })
  async getInfo(): Promise<{ success: true; data: RuntimeInfoDto }> {
    const info = RuntimeInfoDto.create({
      version: '1.0.0',
      sessionCount: 0,
      toolCount: this.toolRegistry.getAll().length,
      templateCount: (await this.promptRegistry.getAll()).length,
      uptimeMs: Date.now() - moduleStartTime,
    });
    return { success: true, data: info };
  }

  @Post('execute')
  @ApiOperation({ summary: 'Execute a request through the AI pipeline' })
  @ApiBody({ type: ExecuteDto })
  @ApiResponse({ status: 200, description: 'Execution result' })
  async execute(
    @Req() req: any,
    @Body() dto: ExecuteDto,
  ): Promise<{ success: true; data: ExecutionResultDto }> {
    const session = await this.sessionManager.create(
      req.workspaceId,
      req.workspaceId,
      req.user.userId,
    );

    const context = new ExecutionContext(
      crypto.randomUUID(),
      req.workspaceId,
      req.user.userId,
      session.agentId,
      dto.input,
      dto.metadata,
    );

    const result = await this.pipeline.execute(context, [], async (messages) => {
      const last = messages[messages.length - 1]!;
      return { content: last.content };
    });

    return { success: true, data: ExecutionResultDto.fromResult(result) };
  }

  @Get('tools')
  @ApiOperation({ summary: 'List all registered tools' })
  @ApiResponse({ status: 200, description: 'Tools list' })
  async listTools(): Promise<{ success: true; data: ToolResponseDto[] }> {
    const tools = this.toolRegistry.getAll();
    return { success: true, data: ToolResponseDto.fromList(tools) };
  }

  @Post('tools')
  @ApiOperation({ summary: 'Register a new tool' })
  @ApiBody({ type: RegisterToolDto })
  @ApiResponse({ status: 201, description: 'Tool registered' })
  async registerTool(
    @Body() dto: RegisterToolDto,
  ): Promise<{ success: true; data: ToolResponseDto }> {
    const params: ToolParameter[] = (dto.parameters ?? []).map((p) => ({
      name: p.name,
      type: p.type as ToolParameter['type'],
      description: p.description,
      required: p.required,
    }));

    const tool = new ToolDefinition(
      dto.name,
      dto.description,
      params,
      dto.name,
      'available',
      dto.tags ?? [],
    );

    this.toolRegistry.register(tool);
    return { success: true, data: ToolResponseDto.fromDefinition(tool) };
  }
}
