import { Router } from 'express';

import {
  authenticate,
  requireActive,
  requirePermission,
  requireVerified,
} from '@/app/middleware/authenticate.middleware';
import { validationErrorHandler } from '@/app/middleware/validation-error.middleware';

import type { ContactInfoController } from '../controllers/contact-info.controller';
import { contactInfoSchemas } from '../schemas/contact-info.schemas';

/**
 * Contact Info HTTP routes — mounted at `/api/v1/contact-infos`.
 * Singleton profile: public GET, admin PUT/DELETE.
 */
export function createContactInfoRoutes(controller: ContactInfoController): Router {
  const router = Router();

  /** GET / — Public singleton (`?key=` optional, default "default"). */
  router.get('/', contactInfoSchemas.get, validationErrorHandler, controller.get);

  /** PUT / — Admin upsert (`contact_info:update:own` / `:any`). */
  router.put(
    '/',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('contact_info:update:own'),
    contactInfoSchemas.upsert,
    validationErrorHandler,
    controller.upsert,
  );

  /** DELETE / — Admin soft-delete (`contact_info:delete:own` / `:any`). */
  router.delete(
    '/',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('contact_info:delete:own'),
    contactInfoSchemas.remove,
    validationErrorHandler,
    controller.remove,
  );

  return router;
}
