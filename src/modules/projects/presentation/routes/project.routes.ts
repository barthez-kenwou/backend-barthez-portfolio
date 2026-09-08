import { Router } from 'express';

import {
  authenticate,
  optionalAuthenticate,
  requireActive,
  requirePermission,
  requireVerified,
} from '@/app/middleware/authenticate.middleware';
import { validationErrorHandler } from '@/app/middleware/validation-error.middleware';

import {
  type ProjectController,
  requireAuthForUnpublishedList,
} from '../controllers/project.controller';
import { projectSchemas } from '../schemas/project.schemas';

/**
 * Project HTTP routes — mounted at `/api/v1/projects`.
 */
export function createProjectRoutes(controller: ProjectController): Router {
  const router = Router();

  /** GET / — Public published list; `?includeUnpublished=true` requires project:read. */
  router.get(
    '/',
    projectSchemas.list,
    validationErrorHandler,
    requireAuthForUnpublishedList,
    controller.list,
  );

  /** GET /:projectId — Public detail for published projects (confidential fields redacted). */
  router.get(
    '/:projectId',
    optionalAuthenticate,
    projectSchemas.byId,
    validationErrorHandler,
    controller.getById,
  );

  /** POST / — Create (`project:create`). */
  router.post(
    '/',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('project:create'),
    projectSchemas.create,
    validationErrorHandler,
    controller.create,
  );

  /** PUT /:projectId — Update (`project:update:own`). */
  router.put(
    '/:projectId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('project:update:own'),
    projectSchemas.update,
    validationErrorHandler,
    controller.update,
  );

  /** DELETE /:projectId — Soft-delete (`project:delete:own`). */
  router.delete(
    '/:projectId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('project:delete:own'),
    projectSchemas.byId,
    validationErrorHandler,
    controller.remove,
  );

  return router;
}
