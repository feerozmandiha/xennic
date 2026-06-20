import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { FeatureFlagService } from '../../application/services/feature-flag.service.js';

@ApiTags('feature-flags')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('feature-flags')
export class FeatureFlagController {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  @Get('enabled')
  @ApiOperation({ summary: 'Get all enabled features for the current workspace' })
  async getEnabledFeatures(@Req() req: any) {
    const features = await this.featureFlagService.getEnabledFeatures({
      workspaceId: req.workspaceId,
      planId: req.planId,
    });
    return { success: true, data: { features } };
  }
}
