import type { Router } from 'express';

import type { BlogEntity } from '@/modules/blog/domain/entities/blog.entity';
import { type AuditPort, auditRepository } from '@/shared/infrastructure/audit';

import { BroadcastNewsletterCommand } from './application/commands/broadcast-newsletter.command';
import { ConfirmNewsletterCommand } from './application/commands/confirm-newsletter.command';
import { DeleteNewsletterSubscriberCommand } from './application/commands/delete-newsletter-subscriber.command';
import { NotifyBlogPublishedCommand } from './application/commands/notify-blog-published.command';
import { SendWeeklyDigestCommand } from './application/commands/send-weekly-digest.command';
import type { BlogDigestSourcePort } from './application/commands/send-weekly-digest.command';
import { SubscribeNewsletterCommand } from './application/commands/subscribe-newsletter.command';
import { UnsubscribeNewsletterCommand } from './application/commands/unsubscribe-newsletter.command';
import {
  GetNewsletterStatsQuery,
  GetNewsletterSubscriberQuery,
  ListNewsletterCampaignsQuery,
  ListNewsletterSubscribersQuery,
} from './application/queries/newsletter.queries';
import type {
  NewsletterMailerPort,
  NewsletterQueuePort,
  NewsletterRbacPort,
} from './application/services/newsletter.ports';
import type {
  NewsletterCampaignRepositoryPort,
  NewsletterSubscriberRepositoryPort,
} from './domain/repositories/newsletter.repository';
import {
  createBlogDigestSourceAdapter,
  createNewsletterMailerAdapter,
  createNewsletterQueueAdapter,
  createNewsletterRbacAdapter,
} from './infrastructure/providers/legacy-adapters';
import { PrismaNewsletterCampaignRepository } from './infrastructure/repositories/prisma-newsletter-campaign.repository';
import { PrismaNewsletterSubscriberRepository } from './infrastructure/repositories/prisma-newsletter-subscriber.repository';
import {
  type NewsletterController,
  createNewsletterController,
} from './presentation/controllers/newsletter.controller';
import { createNewsletterRoutes } from './presentation/routes/newsletter.routes';

export type NewsletterModuleDeps = {
  subscriberRepository: NewsletterSubscriberRepositoryPort;
  campaignRepository: NewsletterCampaignRepositoryPort;
  mailer: NewsletterMailerPort;
  queue: NewsletterQueuePort;
  blogSource: BlogDigestSourcePort;
  rbac: NewsletterRbacPort;
  audit?: AuditPort;
};

export type NewsletterModule = {
  deps: NewsletterModuleDeps;
  useCases: {
    subscribeNewsletter: SubscribeNewsletterCommand;
    confirmNewsletter: ConfirmNewsletterCommand;
    unsubscribeNewsletter: UnsubscribeNewsletterCommand;
    deleteNewsletterSubscriber: DeleteNewsletterSubscriberCommand;
    broadcastNewsletter: BroadcastNewsletterCommand;
    notifyBlogPublished: NotifyBlogPublishedCommand;
    sendWeeklyDigest: SendWeeklyDigestCommand;
    getNewsletterSubscriber: GetNewsletterSubscriberQuery;
    listNewsletterSubscribers: ListNewsletterSubscribersQuery;
    getNewsletterStats: GetNewsletterStatsQuery;
    listNewsletterCampaigns: ListNewsletterCampaignsQuery;
  };
  controller: NewsletterController;
  router: Router;
  /** Port for blog publish / create hooks. */
  onBlogPublished: (blog: BlogEntity) => Promise<void>;
};

export function createDefaultNewsletterDeps(
  overrides: Partial<NewsletterModuleDeps> = {},
): NewsletterModuleDeps {
  return {
    subscriberRepository:
      overrides.subscriberRepository ?? new PrismaNewsletterSubscriberRepository(),
    campaignRepository: overrides.campaignRepository ?? new PrismaNewsletterCampaignRepository(),
    mailer: overrides.mailer ?? createNewsletterMailerAdapter(),
    queue: overrides.queue ?? createNewsletterQueueAdapter(),
    blogSource: overrides.blogSource ?? createBlogDigestSourceAdapter(),
    rbac: overrides.rbac ?? createNewsletterRbacAdapter(),
    audit: overrides.audit ?? auditRepository,
  };
}

export function createNewsletterModule(deps: NewsletterModuleDeps): NewsletterModule {
  const useCases = {
    subscribeNewsletter: new SubscribeNewsletterCommand(deps),
    confirmNewsletter: new ConfirmNewsletterCommand(deps),
    unsubscribeNewsletter: new UnsubscribeNewsletterCommand(deps),
    deleteNewsletterSubscriber: new DeleteNewsletterSubscriberCommand(deps),
    broadcastNewsletter: new BroadcastNewsletterCommand(deps),
    notifyBlogPublished: new NotifyBlogPublishedCommand(deps),
    sendWeeklyDigest: new SendWeeklyDigestCommand(deps),
    getNewsletterSubscriber: new GetNewsletterSubscriberQuery(deps),
    listNewsletterSubscribers: new ListNewsletterSubscribersQuery(deps),
    getNewsletterStats: new GetNewsletterStatsQuery(deps),
    listNewsletterCampaigns: new ListNewsletterCampaignsQuery(deps),
  };

  const controller = createNewsletterController({
    subscribe: useCases.subscribeNewsletter,
    confirm: useCases.confirmNewsletter,
    unsubscribe: useCases.unsubscribeNewsletter,
    deleteSubscriber: useCases.deleteNewsletterSubscriber,
    broadcast: useCases.broadcastNewsletter,
    getSubscriber: useCases.getNewsletterSubscriber,
    listSubscribers: useCases.listNewsletterSubscribers,
    stats: useCases.getNewsletterStats,
    listCampaigns: useCases.listNewsletterCampaigns,
  });

  const router = createNewsletterRoutes(controller);

  const onBlogPublished = async (blog: BlogEntity): Promise<void> => {
    if (!blog.isPublished) return;
    await useCases.notifyBlogPublished.execute({
      blogId: blog.id,
      slug: blog.slug,
      titleFr: blog.titleFr,
      titleEn: blog.titleEn,
      excerptFr: blog.excerptFr,
      excerptEn: blog.excerptEn,
      image: blog.image,
      category: blog.category,
      readTime: blog.readTime,
      tags: blog.tags,
      author: blog.author,
    });
  };

  return { deps, useCases, controller, router, onBlogPublished };
}

export function createNewsletterRouter(overrides: Partial<NewsletterModuleDeps> = {}): Router {
  return createNewsletterModule(createDefaultNewsletterDeps(overrides)).router;
}

export type { NewsletterSubscriberEntity } from './domain/entities/newsletter.entity';
export { newsletterSchemas } from './presentation/schemas/newsletter.schemas';
export { NewsletterSerializer } from './presentation/serializers/newsletter.serializer';
