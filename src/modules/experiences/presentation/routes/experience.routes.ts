import { Router } from 'express';

import {
  authenticate,
  requireActive,
  requirePermission,
  requireVerified,
} from '@/app/middleware/authenticate.middleware';
import { validationErrorHandler } from '@/app/middleware/validation-error.middleware';

import type { ExperienceController } from '../controllers/experience.controller';
import { experienceSchemas } from '../schemas/experience.schemas';

/**
 * Experience HTTP routes — mounted at `/api/v1/experiences`.
 * Public portfolio reads: GET / and GET /:experienceId.
 */
export function createExperienceRoutes(controller: ExperienceController): Router {
  const router = Router();

  /** GET / — Public paginated list. */
  router.get('/', experienceSchemas.list, validationErrorHandler, controller.list);

  /** GET /:experienceId — Public detail. */
  router.get('/:experienceId', experienceSchemas.byId, validationErrorHandler, controller.getById);

  /** POST / — Create (`experience:create`). */
  router.post(
    '/',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('experience:create'),
    experienceSchemas.create,
    validationErrorHandler,
    controller.create,
  );

  /** PUT /:experienceId — Update (`experience:update:own`; admins elevate). */
  router.put(
    '/:experienceId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('experience:update:own'),
    experienceSchemas.update,
    validationErrorHandler,
    controller.update,
  );

  /** DELETE /:experienceId — Soft-delete (`experience:delete:own`; admins elevate). */
  router.delete(
    '/:experienceId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('experience:delete:own'),
    experienceSchemas.byId,
    validationErrorHandler,
    controller.remove,
  );

  return router;
}
