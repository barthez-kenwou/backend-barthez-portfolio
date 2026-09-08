import { Router } from 'express';

import {
  authenticate,
  requireActive,
  requirePermission,
  requireVerified,
} from '@/app/middleware/authenticate.middleware';
import { validationErrorHandler } from '@/app/middleware/validation-error.middleware';

import type { EducationController } from '../controllers/education.controller';
import { educationSchemas } from '../schemas/education.schemas';

/**
 * Education HTTP routes — mounted at `/api/v1/education`.
 * Public portfolio reads: GET / and GET /:educationId.
 */
export function createEducationRoutes(controller: EducationController): Router {
  const router = Router();

  /** GET / — Public paginated list. */
  router.get('/', educationSchemas.list, validationErrorHandler, controller.list);

  /** GET /:educationId — Public detail. */
  router.get('/:educationId', educationSchemas.byId, validationErrorHandler, controller.getById);

  /** POST / — Create (`education:create`). */
  router.post(
    '/',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('education:create'),
    educationSchemas.create,
    validationErrorHandler,
    controller.create,
  );

  /** PUT /:educationId — Update (`education:update:own`; admins elevate). */
  router.put(
    '/:educationId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('education:update:own'),
    educationSchemas.update,
    validationErrorHandler,
    controller.update,
  );

  /** DELETE /:educationId — Soft-delete (`education:delete:own`; admins elevate). */
  router.delete(
    '/:educationId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('education:delete:own'),
    educationSchemas.byId,
    validationErrorHandler,
    controller.remove,
  );

  return router;
}
