import { Router } from 'express';

import {
  authenticate,
  requireActive,
  requirePermission,
  requireVerified,
} from '@/app/middleware/authenticate.middleware';
import { validationErrorHandler } from '@/app/middleware/validation-error.middleware';

import type { NewsletterController } from '../controllers/newsletter.controller';
import { newsletterSchemas } from '../schemas/newsletter.schemas';

/**
 * Newsletter routes — mounted at `/api/v1/newsletter`.
 */
export function createNewsletterRoutes(controller: NewsletterController): Router {
  const router = Router();

  /** POST /subscribe — Public double opt-in. */
  router.post(
    '/subscribe',
    newsletterSchemas.subscribe,
    validationErrorHandler,
    controller.subscribe,
  );

  /** GET /confirm?token= — Confirm + redirect to frontend. */
  router.get('/confirm', newsletterSchemas.tokenQuery, validationErrorHandler, controller.confirm);

  /** GET /unsubscribe?token= — One-click unsubscribe. */
  router.get(
    '/unsubscribe',
    newsletterSchemas.tokenQuery,
    validationErrorHandler,
    controller.unsubscribeGet,
  );

  /** POST /unsubscribe — JSON unsubscribe. */
  router.post(
    '/unsubscribe',
    newsletterSchemas.unsubscribeBody,
    validationErrorHandler,
    controller.unsubscribePost,
  );

  /** GET /stats — Admin KPIs. */
  router.get(
    '/stats',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('newsletter:read'),
    controller.stats,
  );

  /** GET /subscribers — Admin list. */
  router.get(
    '/subscribers',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('newsletter:read'),
    newsletterSchemas.listSubscribers,
    validationErrorHandler,
    controller.list,
  );

  /** GET /subscribers/:id */
  router.get(
    '/subscribers/:subscriberId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('newsletter:read'),
    newsletterSchemas.byId,
    validationErrorHandler,
    controller.getById,
  );

  /** DELETE /subscribers/:id — Soft-delete. */
  router.delete(
    '/subscribers/:subscriberId',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('newsletter:delete'),
    newsletterSchemas.byId,
    validationErrorHandler,
    controller.remove,
  );

  /** GET /campaigns */
  router.get(
    '/campaigns',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('newsletter:read'),
    newsletterSchemas.listCampaigns,
    validationErrorHandler,
    controller.campaigns,
  );

  /** POST /campaigns/broadcast — Admin custom blast. */
  router.post(
    '/campaigns/broadcast',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('newsletter:broadcast'),
    newsletterSchemas.broadcast,
    validationErrorHandler,
    controller.broadcast,
  );

  return router;
}
