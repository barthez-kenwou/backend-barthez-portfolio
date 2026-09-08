import { Router } from 'express';

import {
  authenticate,
  requireActive,
  requirePermission,
  requireVerified,
} from '@/app/middleware/authenticate.middleware';
import { validationErrorHandler } from '@/app/middleware/validation-error.middleware';

import type { ServiceController } from '../controllers/service.controller';
import { serviceSchemas } from '../schemas/service.schemas';

/**
 * Service HTTP routes — mounted at `/api/v1/services`.
 * Public portfolio reads: GET / and GET /:serviceId.
 */
export function createServiceRoutes(controller: ServiceController): Router {
  const router = Router();

  /** GET / — Public paginated list. */
  router.get('/', serviceSchemas.list, validationErrorHandler, controller.list);

  /** GET /:serviceId — Public detail. */
  router.get('/:serviceId', serviceSchemas.byId, validationErrorHandler, controller.getById);

  /** POST / — Create (`service:create`). */
  router.post(
    '/',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('service:create'),
    serviceSchemas.create,
    validationErrorHandler,
    controller.create,
  );

  /** PUT /:serviceId — Update (`service:update:own`; admins elevate). */
  router.put(
    '/:serviceId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('service:update:own'),
    serviceSchemas.update,
    validationErrorHandler,
    controller.update,
  );

  /** DELETE /:serviceId — Soft-delete (`service:delete:own`; admins elevate). */
  router.delete(
    '/:serviceId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('service:delete:own'),
    serviceSchemas.byId,
    validationErrorHandler,
    controller.remove,
  );

  return router;
}
