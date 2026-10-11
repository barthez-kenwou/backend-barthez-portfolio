import { Router } from 'express';

import {
  authenticate,
  requireActive,
  requirePermission,
  requireVerified,
} from '@/app/middleware/authenticate.middleware';
import { validationErrorHandler } from '@/app/middleware/validation-error.middleware';

import type { PartnerController } from '../controllers/partner.controller';
import { partnerSchemas } from '../schemas/partner.schemas';

/**
 * Partner HTTP routes — mounted at `/api/v1/partners`.
 * Public portfolio reads: GET / and GET /:partnerId.
 */
export function createPartnerRoutes(controller: PartnerController): Router {
  const router = Router();

  /** GET / — Public paginated list (published by default). */
  router.get('/', partnerSchemas.list, validationErrorHandler, controller.list);

  /** GET /:partnerId — Public detail. */
  router.get('/:partnerId', partnerSchemas.byId, validationErrorHandler, controller.getById);

  /** POST / — Create (`partner:create`). */
  router.post(
    '/',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('partner:create'),
    partnerSchemas.create,
    validationErrorHandler,
    controller.create,
  );

  /** PUT /:partnerId — Update (`partner:update:own`; admins elevate). */
  router.put(
    '/:partnerId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('partner:update:own'),
    partnerSchemas.update,
    validationErrorHandler,
    controller.update,
  );

  /** DELETE /:partnerId — Soft-delete (`partner:delete:own`; admins elevate). */
  router.delete(
    '/:partnerId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('partner:delete:own'),
    partnerSchemas.byId,
    validationErrorHandler,
    controller.remove,
  );

  return router;
}
