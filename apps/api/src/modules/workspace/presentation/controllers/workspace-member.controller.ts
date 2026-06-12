import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceService } from '../../application/services/workspace.service.js';
import {
  AddMemberDto,
  UpdateMemberRoleDto,
  InviteMemberDto,
  AcceptInvitationDto,
  WorkspaceMemberResponseDto,
  WorkspaceInvitationResponseDto,
} from '../dtos/workspace-member.dto.js';

@ApiTags('workspaces')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId')
export class WorkspaceMemberController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  // ══════════════════════════════════════════════════════════════════════════
  // MEMBERS
  // ══════════════════════════════════════════════════════════════════════════

  // ─── GET /workspaces/:workspaceId/members ─────────────────────────────────

  @Get('members')
  @ApiOperation({ summary: 'List members', description: 'Returns all members of a workspace.' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace UUID' })
  @ApiResponse({ status: 200, description: 'Members retrieved', type: [WorkspaceMemberResponseDto] })
  async getMembers(@Param('workspaceId') workspaceId: string) {
    const members = await this.workspaceService.getMembers(workspaceId);
    return {
      success: true,
      data: members.map((m) => WorkspaceMemberResponseDto.fromEntity(m)),
    };
  }

  // ─── POST /workspaces/:workspaceId/members ────────────────────────────────

  @Post('members')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add member', description: 'Directly adds a user to the workspace (requires OWNER or ADMIN).' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace UUID' })
  @ApiBody({ type: AddMemberDto })
  @ApiResponse({ status: 201, description: 'Member added', type: WorkspaceMemberResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden — only OWNER or ADMIN' })
  @ApiResponse({ status: 409, description: 'User already a member' })
  async addMember(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: AddMemberDto,
    @Req() req: any,
  ) {
    const member = await this.workspaceService.addMember(
      workspaceId,
      dto.userId,
      dto.role,
      req.user.userId,
    );
    return { success: true, data: WorkspaceMemberResponseDto.fromEntity(member) };
  }

  // ─── PATCH /workspaces/:workspaceId/members/:userId ───────────────────────

  @Patch('members/:userId')
  @ApiOperation({ summary: 'Update member role', description: 'Changes the role of a workspace member.' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace UUID' })
  @ApiParam({ name: 'userId',      description: 'User UUID' })
  @ApiBody({ type: UpdateMemberRoleDto })
  @ApiResponse({ status: 200, description: 'Role updated', type: WorkspaceMemberResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateMemberRole(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
    @Req() req: any,
  ) {
    const member = await this.workspaceService.updateMemberRole(
      workspaceId,
      userId,
      dto.role,
      req.user.userId,
    );
    return { success: true, data: WorkspaceMemberResponseDto.fromEntity(member) };
  }

  // ─── DELETE /workspaces/:workspaceId/members/:userId ──────────────────────

  @Delete('members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove member', description: 'Removes a user from the workspace.' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace UUID' })
  @ApiParam({ name: 'userId',      description: 'User UUID' })
  @ApiResponse({ status: 204, description: 'Member removed' })
  @ApiResponse({ status: 403, description: 'Cannot remove OWNER' })
  async removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    await this.workspaceService.removeMember(workspaceId, userId, req.user.userId);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INVITATIONS
  // ══════════════════════════════════════════════════════════════════════════

  // ─── GET /workspaces/:workspaceId/invitations ─────────────────────────────

  @Get('invitations')
  @ApiOperation({ summary: 'List invitations', description: 'Returns all invitations for the workspace.' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace UUID' })
  @ApiResponse({ status: 200, description: 'Invitations retrieved', type: [WorkspaceInvitationResponseDto] })
  async getInvitations(@Param('workspaceId') workspaceId: string) {
    const invitations = await this.workspaceService.getInvitations(workspaceId);
    return {
      success: true,
      data: invitations.map((i) => WorkspaceInvitationResponseDto.fromEntity(i)),
    };
  }

  // ─── POST /workspaces/:workspaceId/invitations ────────────────────────────

  @Post('invitations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Invite member', description: 'Sends an invitation to join the workspace by email.' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace UUID' })
  @ApiBody({ type: InviteMemberDto })
  @ApiResponse({ status: 201, description: 'Invitation created', type: WorkspaceInvitationResponseDto })
  @ApiResponse({ status: 409, description: 'Pending invitation already exists' })
  async inviteMember(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: InviteMemberDto,
    @Req() req: any,
  ) {
    const invitation = await this.workspaceService.inviteMember(
      workspaceId,
      dto.email,
      dto.role,
      req.user.userId,
    );
    return {
      success: true,
      data: WorkspaceInvitationResponseDto.fromEntity(invitation),
    };
  }

  // ─── DELETE /workspaces/:workspaceId/invitations/:id ─────────────────────

  @Delete('invitations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel invitation', description: 'Cancels a pending workspace invitation.' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace UUID' })
  @ApiParam({ name: 'id',          description: 'Invitation UUID' })
  @ApiResponse({ status: 204, description: 'Invitation cancelled' })
  async cancelInvitation(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    await this.workspaceService.cancelInvitation(workspaceId, id, req.user.userId);
  }
}

// ══════════════════════════════════════════════════════════════════════════
// ACCEPT INVITATION — Public endpoint (no workspace context needed)
// ══════════════════════════════════════════════════════════════════════════

@ApiTags('workspaces')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('workspaces/invitations')
export class InvitationAcceptController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post('accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept invitation', description: 'Accepts a workspace invitation using a token.' })
  @ApiBody({ type: AcceptInvitationDto })
  @ApiResponse({ status: 200, description: 'Invitation accepted', type: WorkspaceMemberResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async acceptInvitation(@Body() dto: AcceptInvitationDto, @Req() req: any) {
    const member = await this.workspaceService.acceptInvitation(
      dto.token,
      req.user.userId,
    );
    return { success: true, data: WorkspaceMemberResponseDto.fromEntity(member) };
  }
}
