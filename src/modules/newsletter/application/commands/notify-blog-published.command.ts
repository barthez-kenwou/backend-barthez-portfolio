import type {
  NewsletterCampaignRepositoryPort,
  NewsletterSubscriberRepositoryPort,
} from '../../domain/repositories/newsletter.repository';
import type { NotifyBlogPublishedDto } from '../dto/newsletter.dto';
import { buildBlogPostUrl } from '../services/newsletter-links';
import type { NewsletterQueuePort } from '../services/newsletter.ports';

export type NotifyBlogPublishedCommandDeps = {
  subscriberRepository: NewsletterSubscriberRepositoryPort;
  campaignRepository: NewsletterCampaignRepositoryPort;
  queue: NewsletterQueuePort;
};

/**
 * Creates a blog_publish campaign and enqueues fan-out to active subscribers.
 * Idempotent per blogId (skips if a campaign already exists for that post).
 */
export class NotifyBlogPublishedCommand {
  constructor(private readonly deps: NotifyBlogPublishedCommandDeps) {}

  async execute(input: NotifyBlogPublishedDto): Promise<{ campaignId: string | null }> {
    const existing = await this.deps.campaignRepository.findRecentByBlog(
      input.blogId,
      'blog_publish',
    );
    if (existing) {
      return { campaignId: existing.id };
    }

    const activeCount = await this.deps.subscriberRepository.countActive();
    if (activeCount === 0) {
      return { campaignId: null };
    }

    const postUrl = buildBlogPostUrl(input.slug);
    const subjectFr = `Nouveau sur le blog — ${input.titleFr}`;
    const subjectEn = `Just dropped — ${input.titleEn}`;

    const campaign = await this.deps.campaignRepository.create({
      type: 'blog_publish',
      status: 'queued',
      subjectFr,
      subjectEn,
      previewFr: input.excerptFr.slice(0, 140),
      previewEn: input.excerptEn.slice(0, 140),
      template: 'newsletter-blog-alert',
      blogId: input.blogId,
      totalRecipients: activeCount,
      payload: {
        blogId: input.blogId,
        slug: input.slug,
        titleFr: input.titleFr,
        titleEn: input.titleEn,
        excerptFr: input.excerptFr,
        excerptEn: input.excerptEn,
        image: input.image,
        category: input.category,
        readTime: input.readTime,
        tags: input.tags,
        author: input.author,
        postUrl,
      },
    });

    await this.deps.queue.enqueueFanout(campaign.id);
    return { campaignId: campaign.id };
  }
}
