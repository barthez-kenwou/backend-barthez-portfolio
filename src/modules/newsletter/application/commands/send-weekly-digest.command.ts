import type { BlogEntity } from '@/modules/blog/domain/entities/blog.entity';

import type {
  NewsletterCampaignRepositoryPort,
  NewsletterSubscriberRepositoryPort,
} from '../../domain/repositories/newsletter.repository';
import { buildBlogIndexUrl, buildBlogPostUrl } from '../services/newsletter-links';
import type { NewsletterQueuePort } from '../services/newsletter.ports';

export type BlogDigestSourcePort = {
  listPublishedSince(since: Date, limit: number): Promise<BlogEntity[]>;
};

export type SendWeeklyDigestCommandDeps = {
  subscriberRepository: NewsletterSubscriberRepositoryPort;
  campaignRepository: NewsletterCampaignRepositoryPort;
  blogSource: BlogDigestSourcePort;
  queue: NewsletterQueuePort;
};

/**
 * Weekly digest: posts published in the last 7 days → one campaign to actives.
 * No-op when there are zero posts or zero subscribers.
 */
export class SendWeeklyDigestCommand {
  constructor(private readonly deps: SendWeeklyDigestCommandDeps) {}

  async execute(): Promise<{ campaignId: string | null; postCount: number }> {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const posts = await this.deps.blogSource.listPublishedSince(since, 12);
    if (posts.length === 0) {
      return { campaignId: null, postCount: 0 };
    }

    const activeCount = await this.deps.subscriberRepository.countActive();
    if (activeCount === 0) {
      return { campaignId: null, postCount: posts.length };
    }

    const items = posts.map((p) => ({
      slug: p.slug,
      titleFr: p.titleFr,
      titleEn: p.titleEn,
      excerptFr: p.excerptFr,
      excerptEn: p.excerptEn,
      image: p.image,
      category: p.category,
      readTime: p.readTime,
      postUrl: buildBlogPostUrl(p.slug),
    }));

    const campaign = await this.deps.campaignRepository.create({
      type: 'digest',
      status: 'queued',
      subjectFr: `Ta dose de la semaine — ${posts.length} article${posts.length > 1 ? 's' : ''}`,
      subjectEn: `This week’s drop — ${posts.length} article${posts.length > 1 ? 's' : ''}`,
      previewFr: posts[0]?.excerptFr.slice(0, 120) ?? null,
      previewEn: posts[0]?.excerptEn.slice(0, 120) ?? null,
      template: 'newsletter-digest',
      totalRecipients: activeCount,
      payload: {
        blogIndexUrl: buildBlogIndexUrl(),
        items,
      },
    });

    await this.deps.queue.enqueueFanout(campaign.id);
    return { campaignId: campaign.id, postCount: posts.length };
  }
}
