import {
  Controller, Get, Patch, Param, Body, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { CurrentUser } from '../../../rbac/infrastructure/decorators/current-user.decorator.js';
import { WorkspaceSettingsService } from '../../application/services/workspace-settings.service.js';
import {
  WorkspaceSettingsResponseDto,
  UpdateWorkspaceSettingsDto,
} from '../dtos/workspace-settings.dto.js';

@ApiTags('Workspace Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('workspaces/:workspaceId/settings')
export class WorkspaceSettingsController {
  constructor(private readonly settingsService: WorkspaceSettingsService) {}

  @Get()
  @RequirePermissions('workspace.settings.read')
  @ApiOperation({ summary: 'Get workspace settings' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace UUID' })
  async getSettings(
    @Param('workspaceId') workspaceId: string,
  ): Promise<WorkspaceSettingsResponseDto> {
    const entity = await this.settingsService.getSettings(workspaceId);
    return new WorkspaceSettingsResponseDto(
      entity.workspaceId,
      entity.settings as any,
      entity.updatedAt,
    );
  }

  @Patch()
  @RequirePermissions('workspace.settings.manage')
  @ApiOperation({ summary: 'Update workspace settings (partial)' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace UUID' })
  async updateSettings(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: UpdateWorkspaceSettingsDto,
  ): Promise<WorkspaceSettingsResponseDto> {
    const entity = await this.settingsService.updateSettings(workspaceId, dto);
    return new WorkspaceSettingsResponseDto(
      entity.workspaceId,
      entity.settings as any,
      entity.updatedAt,
    );
  }

  @Patch('reset')
  @RequirePermissions('workspace.settings.manage')
  @ApiOperation({ summary: 'Reset workspace settings to defaults' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace UUID' })
  async resetSettings(
    @Param('workspaceId') workspaceId: string,
  ): Promise<WorkspaceSettingsResponseDto> {
    const entity = await this.settingsService.resetSettings(workspaceId);
    return new WorkspaceSettingsResponseDto(
      entity.workspaceId,
      entity.settings as any,
      entity.updatedAt,
    );
  }
}
