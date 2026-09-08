import type { Request, Response } from 'express';

import { envs } from '@/app/config';
import { asyncHandler, response } from '@/shared/utils/http/responses/helpers';

import type { BroadcastNewsletterCommand } from '../../application/commands/broadcast-newsletter.command';
import type { ConfirmNewsletterCommand } from '../../application/commands/confirm-newsletter.command';
import type { DeleteNewsletterSubscriberCommand } from '../../application/commands/delete-newsletter-subscriber.command';
import type { SubscribeNewsletterCommand } from '../../application/commands/subscribe-newsletter.command';
import type { UnsubscribeNewsletterCommand } from '../../application/commands/unsubscribe-newsletter.command';
import type {
  GetNewsletterStatsQuery,
  GetNewsletterSubscriberQuery,
  ListNewsletterCampaignsQuery,
  ListNewsletterSubscribersQuery,
} from '../../application/queries/newsletter.queries';
import { NewsletterSerializer } from '../serializers/newsletter.serializer';

type AuthRequest = Request & { user?: { id: string } };

export type NewsletterControllerDeps = {
  subscribe: SubscribeNewsletterCommand;
  confirm: ConfirmNewsletterCommand;
  unsubscribe: UnsubscribeNewsletterCommand;
  deleteSubscriber: DeleteNewsletterSubscriberCommand;
  broadcast: BroadcastNewsletterCommand;
  getSubscriber: GetNewsletterSubscriberQuery;
  listSubscribers: ListNewsletterSubscribersQuery;
  stats: GetNewsletterStatsQuery;
  listCampaigns: ListNewsletterCampaignsQuery;
};

const frontendRedirect = (path: string): string => {
  const base = (envs.CLIENT_URL || 'https://barthez-kenwou.dev').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

export function createNewsletterController(deps: NewsletterControllerDeps) {
  const subscribe = asyncHandler(async (req: Request, res: Response) => {
    await deps.subscribe.execute({
      email: String(req.body.email),
      locale: req.body.locale,
      source: req.body.source,
    });
    return response.created(
      req,
      res,
      { ok: true },
      'If this email is valid, a confirmation message is on its way.',
    );
  });

  const confirm = asyncHandler(async (req: Request, res: Response) => {
    const token = String(req.query.token || '');
    await deps.confirm.execute({ token });
    if (req.accepts('html')) {
      res.redirect(302, frontendRedirect('/blog?newsletter=confirmed'));
      return;
    }
    return response.ok(req, res, { ok: true }, 'Subscription confirmed');
  });

  const unsubscribeGet = asyncHandler(async (req: Request, res: Response) => {
    const token = String(req.query.token || '');
    await deps.unsubscribe.execute({ token });
    if (req.accepts('html')) {
      res.redirect(302, frontendRedirect('/blog?newsletter=unsubscribed'));
      return;
    }
    return response.ok(req, res, { ok: true }, 'Unsubscribed');
  });

  const unsubscribePost = asyncHandler(async (req: Request, res: Response) => {
    await deps.unsubscribe.execute({ token: String(req.body.token) });
    return response.ok(req, res, { ok: true }, 'Unsubscribed');
  });

  const list = asyncHandler(async (req: Request, res: Response) => {
    const result = await deps.listSubscribers.execute({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      status: req.query.status ? String(req.query.status) : undefined,
      locale: req.query.locale ? String(req.query.locale) : undefined,
      q: req.query.q ? String(req.query.q) : undefined,
    });
    return response.ok(req, res, NewsletterSerializer.list(result), 'Subscribers retrieved');
  });

  const getById = asyncHandler(async (req: Request, res: Response) => {
    const row = await deps.getSubscriber.execute(req.params.subscriberId);
    return response.ok(req, res, NewsletterSerializer.subscriber(row), 'Subscriber retrieved');
  });

  const stats = asyncHandler(async (req: Request, res: Response) => {
    const data = await deps.stats.execute();
    return response.ok(req, res, NewsletterSerializer.stats(data), 'Newsletter stats');
  });

  const remove = asyncHandler(async (req: Request, res: Response) => {
    await deps.deleteSubscriber.execute({ id: req.params.subscriberId });
    return response.ok(req, res, null, 'Subscriber deleted');
  });

  const campaigns = asyncHandler(async (req: Request, res: Response) => {
    const result = await deps.listCampaigns.execute({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      type: req.query.type ? String(req.query.type) : undefined,
      status: req.query.status ? String(req.query.status) : undefined,
    });
    return response.ok(req, res, NewsletterSerializer.campaigns(result), 'Campaigns retrieved');
  });

  const broadcast = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await deps.broadcast.execute({
      actorId: req.user!.id,
      subjectFr: req.body.subjectFr,
      subjectEn: req.body.subjectEn,
      previewFr: req.body.previewFr,
      previewEn: req.body.previewEn,
      headlineFr: req.body.headlineFr,
      headlineEn: req.body.headlineEn,
      bodyFr: req.body.bodyFr,
      bodyEn: req.body.bodyEn,
      ctaUrl: req.body.ctaUrl,
      ctaLabelFr: req.body.ctaLabelFr,
      ctaLabelEn: req.body.ctaLabelEn,
    });
    return response.created(req, res, result, 'Broadcast queued');
  });

  return {
    subscribe,
    confirm,
    unsubscribeGet,
    unsubscribePost,
    list,
    getById,
    stats,
    remove,
    campaigns,
    broadcast,
  };
}

export type NewsletterController = ReturnType<typeof createNewsletterController>;
