import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { DashboardService } from '../../application/services/dashboard.service.js';
import { WorkspaceDashboardResponseDto } from '../dtos/dashboard.dto.js';

@ApiTags('Workspace Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('workspaces/:workspaceId/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @RequirePermissions('workspace.read')
  @ApiOperation({ summary: 'Get aggregated workspace dashboard data' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace UUID' })
  async getDashboard(
    @Param('workspaceId') workspaceId: string,
  ): Promise<{ success: boolean; data: WorkspaceDashboardResponseDto }> {
    const data = await this.dashboardService.getDashboard(workspaceId);
    return { success: true, data: data as any };
  }
}
