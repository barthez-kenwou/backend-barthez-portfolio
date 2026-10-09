import type { NextFunction, Response } from 'express';
import { Router } from 'express';

import {
  authenticate,
  requireActive,
  requireVerified,
} from '@/app/middleware/authenticate.middleware';
import type { AuthenticatedRequest } from '@/modules/auth/presentation/types/authenticated-request';
import { permissionSatisfied } from '@/modules/rbac/domain/permission-match';
import { SYSTEM_ROLES } from '@/shared/constants/app.constants';
import { AppError } from '@/shared/domain/errors/app-error';
import { asyncHandler } from '@/shared/utils/http/responses/helpers';

import { createAnalyticsController } from '../controllers/analytics.controller';

const requireAdminOrAuditRead = asyncHandler(
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    const roles = req.user.roles ?? [];
    const permissions = req.user.permissions ?? [];
    const isAdmin = roles.includes(SYSTEM_ROLES.ADMIN) || roles.includes(SYSTEM_ROLES.SUPER_ADMIN);
    const hasAuditRead =
      roles.includes(SYSTEM_ROLES.SUPER_ADMIN) || permissionSatisfied(permissions, 'audit:read');

    if (!isAdmin && !hasAuditRead) {
      throw AppError.forbidden('Admin role or audit:read permission required');
    }

    next();
  },
);

/**
 * Admin analytics — mounted at `/api/v1/admin/analytics`.
 */
export function createAnalyticsRoutes(): Router {
  const analytics = Router();
  const controller = createAnalyticsController();

  analytics.get(
    '/status',
    authenticate,
    requireVerified,
    requireActive,
    requireAdminOrAuditRead,
    controller.status,
  );

  analytics.get(
    '/overview',
    authenticate,
    requireVerified,
    requireActive,
    requireAdminOrAuditRead,
    controller.overview,
  );

  analytics.get(
    '/top-pages',
    authenticate,
    requireVerified,
    requireActive,
    requireAdminOrAuditRead,
    controller.topPages,
  );

  analytics.get(
    '/top-entries',
    authenticate,
    requireVerified,
    requireActive,
    requireAdminOrAuditRead,
    controller.topEntries,
  );

  analytics.get(
    '/events',
    authenticate,
    requireVerified,
    requireActive,
    requireAdminOrAuditRead,
    controller.events,
  );

  return analytics;
}
