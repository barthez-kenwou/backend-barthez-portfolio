import { Router } from 'express';

import {
  authenticate,
  requireActive,
  requirePermission,
  requireVerified,
} from '@/app/middleware/authenticate.middleware';
import { validationErrorHandler } from '@/app/middleware/validation-error.middleware';

import type { ReferenceController } from '../controllers/reference.controller';
import { referenceSchemas } from '../schemas/reference.schemas';

/**
 * Reference HTTP routes — mounted at `/api/v1/references`.
 * PII: list and get require authentication + permission.
 */
export function createReferenceRoutes(controller: ReferenceController): Router {
  const router = Router();

  /** GET / — Paginated list (`reference:read`, PII). */
  router.get(
    '/',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('reference:read'),
    referenceSchemas.list,
    validationErrorHandler,
    controller.list,
  );

  /** GET /:referenceId — Detail (`reference:read`, PII). */
  router.get(
    '/:referenceId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('reference:read'),
    referenceSchemas.byId,
    validationErrorHandler,
    controller.getById,
  );

  /** POST / — Create (`reference:create`). */
  router.post(
    '/',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('reference:create'),
    referenceSchemas.create,
    validationErrorHandler,
    controller.create,
  );

  /** PUT /:referenceId — Update (`reference:update:own`; admins elevate). */
  router.put(
    '/:referenceId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('reference:update:own'),
    referenceSchemas.update,
    validationErrorHandler,
    controller.update,
  );

  /** DELETE /:referenceId — Soft-delete (`reference:delete:own`; admins elevate). */
  router.delete(
    '/:referenceId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('reference:delete:own'),
    referenceSchemas.byId,
    validationErrorHandler,
    controller.remove,
  );

  return router;
}
