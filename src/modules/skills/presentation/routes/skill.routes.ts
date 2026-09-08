import { Router } from 'express';

import {
  authenticate,
  requireActive,
  requirePermission,
  requireVerified,
} from '@/app/middleware/authenticate.middleware';
import { validationErrorHandler } from '@/app/middleware/validation-error.middleware';

import type { SkillController } from '../controllers/skill.controller';
import { skillSchemas } from '../schemas/skill.schemas';

/**
 * Skill HTTP routes — mounted at `/api/v1/skills`.
 * Public portfolio reads: GET / and GET /:skillId.
 */
export function createSkillRoutes(controller: SkillController): Router {
  const router = Router();

  /** GET / — Public paginated list. */
  router.get('/', skillSchemas.list, validationErrorHandler, controller.list);

  /** GET /:skillId — Public detail. */
  router.get('/:skillId', skillSchemas.byId, validationErrorHandler, controller.getById);

  /** POST / — Create (`skill:create`). */
  router.post(
    '/',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('skill:create'),
    skillSchemas.create,
    validationErrorHandler,
    controller.create,
  );

  /** PUT /:skillId — Update (`skill:update:own`; admins elevate). */
  router.put(
    '/:skillId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('skill:update:own'),
    skillSchemas.update,
    validationErrorHandler,
    controller.update,
  );

  /** DELETE /:skillId — Soft-delete (`skill:delete:own`; admins elevate). */
  router.delete(
    '/:skillId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('skill:delete:own'),
    skillSchemas.byId,
    validationErrorHandler,
    controller.remove,
  );

  return router;
}
