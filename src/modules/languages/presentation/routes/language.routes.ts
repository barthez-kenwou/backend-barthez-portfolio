import { Router } from 'express';

import {
  authenticate,
  requireActive,
  requirePermission,
  requireVerified,
} from '@/app/middleware/authenticate.middleware';
import { validationErrorHandler } from '@/app/middleware/validation-error.middleware';

import type { LanguageController } from '../controllers/language.controller';
import { languageSchemas } from '../schemas/language.schemas';

/**
 * Language HTTP routes — mounted at `/api/v1/languages`.
 * Public portfolio reads: GET / and GET /:languageId.
 */
export function createLanguageRoutes(controller: LanguageController): Router {
  const router = Router();

  /** GET / — Public paginated list. */
  router.get('/', languageSchemas.list, validationErrorHandler, controller.list);

  /** GET /:languageId — Public detail. */
  router.get('/:languageId', languageSchemas.byId, validationErrorHandler, controller.getById);

  /** POST / — Create (`language:create`). */
  router.post(
    '/',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('language:create'),
    languageSchemas.create,
    validationErrorHandler,
    controller.create,
  );

  /** PUT /:languageId — Update (`language:update:own`; admins elevate). */
  router.put(
    '/:languageId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('language:update:own'),
    languageSchemas.update,
    validationErrorHandler,
    controller.update,
  );

  /** DELETE /:languageId — Soft-delete (`language:delete:own`; admins elevate). */
  router.delete(
    '/:languageId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('language:delete:own'),
    languageSchemas.byId,
    validationErrorHandler,
    controller.remove,
  );

  return router;
}
