import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_FLAG_KEY } from './feature-flag.decorator.js';
import { FeatureFlagService } from '../../application/services/feature-flag.service.js';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  private readonly logger = new Logger(FeatureFlagGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const featureName = this.reflector.getAllAndOverride<string>(FEATURE_FLAG_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!featureName) return true;

    const request = context.switchToHttp().getRequest();
    const workspaceId = request.workspaceId as string | undefined;
    const planId = request.planId as string | undefined;

    const enabled = await this.featureFlagService.isEnabled(featureName, { workspaceId, planId });

    if (!enabled) {
      this.logger.warn(`FeatureGuard: "${featureName}" blocked for workspace=${workspaceId}`);
      throw new ForbiddenException(`Feature "${featureName}" is not available`);
    }

    return true;
  }
}
