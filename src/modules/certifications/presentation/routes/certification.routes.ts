import { Router } from 'express';

import {
  authenticate,
  requireActive,
  requirePermission,
  requireVerified,
} from '@/app/middleware/authenticate.middleware';
import { validationErrorHandler } from '@/app/middleware/validation-error.middleware';

import type { CertificationController } from '../controllers/certification.controller';
import { certificationSchemas } from '../schemas/certification.schemas';

/**
 * Certification HTTP routes — mounted at `/api/v1/certifications`.
 * Public portfolio reads: GET / and GET /:certificationId.
 */
export function createCertificationRoutes(controller: CertificationController): Router {
  const router = Router();

  /** GET / — Public paginated list. */
  router.get('/', certificationSchemas.list, validationErrorHandler, controller.list);

  /** GET /:certificationId — Public detail. */
  router.get(
    '/:certificationId',
    certificationSchemas.byId,
    validationErrorHandler,
    controller.getById,
  );

  /** POST / — Create (`certification:create`). */
  router.post(
    '/',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('certification:create'),
    certificationSchemas.create,
    validationErrorHandler,
    controller.create,
  );

  /** PUT /:certificationId — Update (`certification:update:own`; admins elevate). */
  router.put(
    '/:certificationId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('certification:update:own'),
    certificationSchemas.update,
    validationErrorHandler,
    controller.update,
  );

  /** DELETE /:certificationId — Soft-delete (`certification:delete:own`; admins elevate). */
  router.delete(
    '/:certificationId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('certification:delete:own'),
    certificationSchemas.byId,
    validationErrorHandler,
    controller.remove,
  );

  return router;
}
