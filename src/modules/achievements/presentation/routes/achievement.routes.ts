import { Router } from 'express';

import {
  authenticate,
  requireActive,
  requirePermission,
  requireVerified,
} from '@/app/middleware/authenticate.middleware';
import { validationErrorHandler } from '@/app/middleware/validation-error.middleware';

import type { AchievementController } from '../controllers/achievement.controller';
import { achievementSchemas } from '../schemas/achievement.schemas';

/**
 * Achievement HTTP routes — mounted at `/api/v1/achievements`.
 * Public portfolio reads: GET / and GET /:achievementId.
 */
export function createAchievementRoutes(controller: AchievementController): Router {
  const router = Router();

  /** GET / — Public paginated list. */
  router.get('/', achievementSchemas.list, validationErrorHandler, controller.list);

  /** GET /:achievementId — Public detail. */
  router.get(
    '/:achievementId',
    achievementSchemas.byId,
    validationErrorHandler,
    controller.getById,
  );

  /** POST / — Create (`achievement:create`). */
  router.post(
    '/',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('achievement:create'),
    achievementSchemas.create,
    validationErrorHandler,
    controller.create,
  );

  /** PUT /:achievementId — Update (`achievement:update:own`; admins elevate). */
  router.put(
    '/:achievementId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('achievement:update:own'),
    achievementSchemas.update,
    validationErrorHandler,
    controller.update,
  );

  /** DELETE /:achievementId — Soft-delete (`achievement:delete:own`; admins elevate). */
  router.delete(
    '/:achievementId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('achievement:delete:own'),
    achievementSchemas.byId,
    validationErrorHandler,
    controller.remove,
  );

  return router;
}
