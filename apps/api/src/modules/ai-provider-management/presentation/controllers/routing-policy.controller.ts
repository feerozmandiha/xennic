import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../../admin/infrastructure/guards/admin.guard.js';
import { RoutingPolicyService } from '../../application/services/routing-policy.service.js';
import { CreateRoutingPolicyDto } from '../dtos/routing-policy.dto.js';

@ApiTags('AI Provider Management - Routing Policies')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/ai/routing-policies')
export class RoutingPolicyController {
  constructor(private readonly policies: RoutingPolicyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a routing policy' })
  async create(@Body() dto: CreateRoutingPolicyDto, @Req() req: any) {
    const policy = await this.policies.create(dto, req.user.userId);

    return {
      success: true,
      data: policy,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List routing policies' })
  async findAll(
    @Query('workspaceId') workspaceId?: string,
    @Query('featureFlag') featureFlag?: string,
    @Query('enabled') enabled?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    const policies = await this.policies.findAll({
      workspaceId,
      featureFlag,
      enabled: enabled === undefined ? undefined : enabled === 'true',
      includeDeleted: includeDeleted === 'true',
    });

    return {
      success: true,
      data: policies,
    };
  }

  @Get('effective')
  @ApiOperation({ summary: 'Get effective routing policy' })
  async findEffective(
    @Query('workspaceId') workspaceId?: string,
    @Query('featureFlag') featureFlag?: string,
  ) {
    const policy = await this.policies.findEffective({
      workspaceId,
      featureFlag,
    });

    return {
      success: true,
      data: policy,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get routing policy by ID' })
  async findOne(@Param('id') id: string) {
    const policy = await this.policies.findById(id);

    return {
      success: true,
      data: policy,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update routing policy and rules' })
  async update(@Param('id') id: string, @Body() dto: CreateRoutingPolicyDto, @Req() req: any) {
    const policy = await this.policies.update(id, dto, req.user.userId);

    return {
      success: true,
      data: policy,
    };
  }

  @Put(':id/enable')
  @ApiOperation({ summary: 'Enable routing policy' })
  async enable(@Param('id') id: string, @Req() req: any) {
    const policy = await this.policies.setEnabled(id, true, req.user.userId);

    return {
      success: true,
      data: policy,
    };
  }

  @Put(':id/disable')
  @ApiOperation({ summary: 'Disable routing policy' })
  async disable(@Param('id') id: string, @Req() req: any) {
    const policy = await this.policies.setEnabled(id, false, req.user.userId);

    return {
      success: true,
      data: policy,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete routing policy' })
  async remove(@Param('id') id: string) {
    await this.policies.delete(id);
  }
}
