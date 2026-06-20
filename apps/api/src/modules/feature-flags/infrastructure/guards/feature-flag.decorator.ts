import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { ApiForbiddenResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { FeatureFlagGuard } from './feature-flag.guard.js';

export const FEATURE_FLAG_KEY = 'featureFlag';

export function RequireFeature(featureName: string) {
  return applyDecorators(
    SetMetadata(FEATURE_FLAG_KEY, featureName),
    UseGuards(JwtAuthGuard, FeatureFlagGuard),
    ApiForbiddenResponse({ description: `Feature "${featureName}" is not enabled` }),
  );
}
