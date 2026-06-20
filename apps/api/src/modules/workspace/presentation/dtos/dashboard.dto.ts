import { ApiProperty } from '@nestjs/swagger';

class DashboardMemberItem {
  @ApiProperty() id!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() role!: string;
  @ApiProperty() joinedAt!: Date;
}

class DashboardProjectItem {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() status!: string;
  @ApiProperty() createdAt!: Date;
}

class DashboardMembersStats {
  @ApiProperty() total!: number;
  @ApiProperty({ type: [DashboardMemberItem] }) items!: DashboardMemberItem[];
}

class DashboardProjectsStats {
  @ApiProperty() total!: number;
  @ApiProperty({ type: [DashboardProjectItem] }) items!: DashboardProjectItem[];
}

class DashboardCalculationsStats {
  @ApiProperty() used!: number;
  @ApiProperty() limit!: number;
}

class DashboardStorageStats {
  @ApiProperty() totalFiles!: number;
  @ApiProperty() totalSizeBytes!: string;
}

class DashboardStats {
  @ApiProperty({ type: DashboardMembersStats }) members!: DashboardMembersStats;
  @ApiProperty({ type: DashboardProjectsStats }) projects!: DashboardProjectsStats;
  @ApiProperty({ type: DashboardCalculationsStats }) calculations!: DashboardCalculationsStats;
  @ApiProperty({ type: DashboardStorageStats }) storage!: DashboardStorageStats;
}

class DashboardWorkspaceInfo {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() code!: string | null;
}

export class WorkspaceDashboardResponseDto {
  @ApiProperty({ type: DashboardWorkspaceInfo }) workspace!: DashboardWorkspaceInfo;
  @ApiProperty({ type: DashboardStats }) stats!: DashboardStats;
}
