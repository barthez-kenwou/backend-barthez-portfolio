import { Router } from 'express';

import {
  authenticate,
  optionalAuthenticate,
  requireActive,
  requirePermission,
  requireVerified,
} from '@/app/middleware/authenticate.middleware';
import { validationErrorHandler } from '@/app/middleware/validation-error.middleware';

import type { TestimonialController } from '../controllers/testimonial.controller';
import { testimonialSchemas } from '../schemas/testimonial.schemas';

/**
 * Testimonial HTTP routes — mounted at `/api/v1/testimonials`.
 */
export function createTestimonialRoutes(controller: TestimonialController): Router {
  const router = Router();

  /** GET / — Public approved/published list (admins see all when authenticated). */
  router.get(
    '/',
    optionalAuthenticate,
    testimonialSchemas.list,
    validationErrorHandler,
    controller.list,
  );

  /** POST /public | /feedback — Unauthenticated public form submit. */
  router.post(
    '/public',
    testimonialSchemas.publicSubmit,
    validationErrorHandler,
    controller.submitPublic,
  );
  router.post(
    '/feedback',
    testimonialSchemas.publicSubmit,
    validationErrorHandler,
    controller.submitPublic,
  );

  /** GET /:testimonialId — Detail (`testimonial:read`). */
  router.get(
    '/:testimonialId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('testimonial:read'),
    testimonialSchemas.byId,
    validationErrorHandler,
    controller.getById,
  );

  /** POST / — Admin create (`testimonial:create`). */
  router.post(
    '/',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('testimonial:create'),
    testimonialSchemas.create,
    validationErrorHandler,
    controller.create,
  );

  /** PUT /:testimonialId — Update (`testimonial:update:own`). */
  router.put(
    '/:testimonialId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('testimonial:update:own'),
    testimonialSchemas.update,
    validationErrorHandler,
    controller.update,
  );

  /** PATCH /:testimonialId/approve */
  router.patch(
    '/:testimonialId/approve',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('testimonial:update:any'),
    testimonialSchemas.byId,
    validationErrorHandler,
    controller.approve,
  );

  /** PATCH /:testimonialId/reject */
  router.patch(
    '/:testimonialId/reject',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('testimonial:update:any'),
    testimonialSchemas.byId,
    validationErrorHandler,
    controller.reject,
  );

  /** DELETE /:testimonialId — Soft-delete (`testimonial:delete:own`). */
  router.delete(
    '/:testimonialId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('testimonial:delete:own'),
    testimonialSchemas.byId,
    validationErrorHandler,
    controller.remove,
  );

  return router;
}
