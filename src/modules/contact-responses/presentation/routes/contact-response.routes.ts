import { Router } from 'express';

import {
  authenticate,
  requireActive,
  requirePermission,
  requireVerified,
} from '@/app/middleware/authenticate.middleware';
import { validationErrorHandler } from '@/app/middleware/validation-error.middleware';

import type { ContactResponseController } from '../controllers/contact-response.controller';
import { contactResponseSchemas } from '../schemas/contact-response.schemas';

/**
 * Contact Response HTTP routes — mounted at `/api/v1/contact-responses`.
 */
export function createContactResponseRoutes(controller: ContactResponseController): Router {
  const router = Router();

  /** POST / — Public contact form (no auth). */
  router.post('/', contactResponseSchemas.submit, validationErrorHandler, controller.submit);

  /** GET / — Admin list (`contact_response:read`). */
  router.get(
    '/',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('contact_response:read'),
    contactResponseSchemas.list,
    validationErrorHandler,
    controller.list,
  );

  /** GET /:contactResponseId — Detail; auto-marks `new` → `read`. */
  router.get(
    '/:contactResponseId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('contact_response:read'),
    contactResponseSchemas.byId,
    validationErrorHandler,
    controller.getById,
  );

  /** PATCH /:contactResponseId — Update status/notes/fields. */
  router.patch(
    '/:contactResponseId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('contact_response:update:own'),
    contactResponseSchemas.update,
    validationErrorHandler,
    controller.update,
  );

  /** PUT /:contactResponseId — Same as PATCH (scaffold compatibility). */
  router.put(
    '/:contactResponseId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('contact_response:update:own'),
    contactResponseSchemas.update,
    validationErrorHandler,
    controller.update,
  );

  /** DELETE /:contactResponseId — Soft-delete. */
  router.delete(
    '/:contactResponseId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('contact_response:delete:own'),
    contactResponseSchemas.byId,
    validationErrorHandler,
    controller.remove,
  );

  return router;
}
