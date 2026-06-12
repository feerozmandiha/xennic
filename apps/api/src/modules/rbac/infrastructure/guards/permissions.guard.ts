import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Inject,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { AuthorizationService } from '../../application/services/authorization.service.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(AuthorizationService)
    private readonly authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ── خواندن permissions از decorator ──────────────────────────────
    const required = this.reflector.getAllAndMerge<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // اگر هیچ permission لازم نیست، عبور کن
    if (!required || required.length === 0) return true;

    const request     = context.switchToHttp().getRequest();
    const user        = request.user;
    const workspaceId = request.workspaceId as string | undefined;

    if (!user?.userId) {
      throw new ForbiddenException('User not authenticated');
    }

    // ── اگر workspaceId نیست، اجازه بده (global endpoints) ──────────
    if (!workspaceId) {
      this.logger.debug(
        `PermissionsGuard: no workspaceId — allowing (global endpoint)`,
      );
      return true;
    }

    // ── بررسی permissions ────────────────────────────────────────────
    try {
      const hasAll = await this.authorizationService.hasPermissions(
        user.userId,
        workspaceId,
        required,
      );

      if (!hasAll) {
        this.logger.warn(
          `PermissionsGuard: user ${user.userId} missing permissions [${required.join(',')}] in workspace ${workspaceId}`,
        );
        throw new ForbiddenException(
          `Missing required permissions: ${required.join(', ')}`,
        );
      }

      this.logger.debug(
        `PermissionsGuard: ✅ user ${user.userId} has [${required.join(',')}]`,
      );
      return true;
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      this.logger.error('PermissionsGuard error:', err);
      // در صورت خطای غیرمنتظره، اجازه بده (fail-open برای availability)
      return true;
    }
  }
}
