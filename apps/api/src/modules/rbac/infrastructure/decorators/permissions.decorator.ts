import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'xennic_permissions';

/**
 * @RequirePermissions('projects.read', 'projects.create')
 * روی controller یا method استفاده می‌شود
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
