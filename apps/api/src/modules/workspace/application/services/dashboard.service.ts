import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { WorkspaceService } from './workspace.service.js';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly workspaceService: WorkspaceService) {}

  async getDashboard(workspaceId: string) {
    const workspace = await this.workspaceService.findOne(workspaceId);

    const [memberRows, projectRows, usageResult, storageResult] = await Promise.all([
      prisma.$queryRaw<any[]>`
        SELECT wm.id, wm.user_id, wm.role, wm.joined_at
        FROM "workspace_members" wm
        WHERE wm.workspace_id = ${workspaceId}
        ORDER BY wm.joined_at DESC
        LIMIT 5
      `,
      prisma.$queryRaw<any[]>`
        SELECT p.id, p.name, p.status, p.created_at
        FROM "projects" p
        WHERE p.workspace_id = ${workspaceId}
          AND p.deleted_at IS NULL
        ORDER BY p.created_at DESC
        LIMIT 5
      `,
      prisma.$queryRaw<any[]>`
        SELECT
          COALESCE(SUM(ul.amount), 0)::text as used,
          COALESCE(p.features->>'calculations_month', '0') as limit,
          p.slug as plan_slug
        FROM "subscriptions" s
        JOIN "plans" p ON p.id = s.plan_id
        LEFT JOIN "usage_logs" ul ON ul.workspace_id = s.workspace_id
          AND ul.feature = 'calculations'
          AND ul.logged_at >= date_trunc('month', NOW())
        WHERE s.workspace_id = ${workspaceId}
          AND s.status = 'active'
          AND (s.ends_at IS NULL OR s.ends_at > NOW())
        GROUP BY p.features, p.slug
        LIMIT 1
      `,
      prisma.$queryRaw<any[]>`
        SELECT
          COUNT(*)::text as total_files,
          COALESCE(SUM(f.size), 0)::text as total_size
        FROM "files" f
        WHERE f.workspace_id = ${workspaceId}
          AND f.deleted_at IS NULL
      `,
    ]);

    const members = (memberRows ?? []).map(r => ({
      id: r.id,
      userId: r.user_id,
      role: r.role,
      joinedAt: r.joined_at,
    }));

    const projects = (projectRows ?? []).map(r => ({
      id: r.id,
      name: r.name,
      status: r.status,
      createdAt: r.created_at,
    }));

    const calcUsed = Number((usageResult[0] as any)?.used ?? 0);
    const calcLimit = Number((usageResult[0] as any)?.limit ?? -1);

    const totalFiles = Number((storageResult[0] as any)?.total_files ?? 0);
    const totalSize = (storageResult[0] as any)?.total_size ?? '0';

    const [memberTotal, projectTotal] = await Promise.all([
      prisma.$queryRaw<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM "workspace_members"
        WHERE workspace_id = ${workspaceId}
      `,
      prisma.$queryRaw<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM "projects"
        WHERE workspace_id = ${workspaceId} AND deleted_at IS NULL
      `,
    ]);

    return {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        code: workspace.code,
      },
      stats: {
        members: {
          total: Number(memberTotal[0]?.count ?? 0),
          items: members,
        },
        projects: {
          total: Number(projectTotal[0]?.count ?? 0),
          items: projects,
        },
        calculations: {
          used: calcUsed,
          limit: calcLimit,
        },
        storage: {
          totalFiles,
          totalSizeBytes: totalSize,
        },
      },
    };
  }
}
