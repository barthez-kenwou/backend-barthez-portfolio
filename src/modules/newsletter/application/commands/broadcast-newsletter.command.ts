import type {
  NewsletterCampaignRepositoryPort,
  NewsletterSubscriberRepositoryPort,
} from '../../domain/repositories/newsletter.repository';
import type { BroadcastNewsletterDto } from '../dto/newsletter.dto';
import type { NewsletterQueuePort } from '../services/newsletter.ports';

export type BroadcastNewsletterCommandDeps = {
  subscriberRepository: NewsletterSubscriberRepositoryPort;
  campaignRepository: NewsletterCampaignRepositoryPort;
  queue: NewsletterQueuePort;
};

/**
 * Admin-triggered custom broadcast to all active subscribers.
 */
export class BroadcastNewsletterCommand {
  constructor(private readonly deps: BroadcastNewsletterCommandDeps) {}

  async execute(input: BroadcastNewsletterDto): Promise<{ campaignId: string }> {
    const activeCount = await this.deps.subscriberRepository.countActive();

    const campaign = await this.deps.campaignRepository.create({
      type: 'broadcast',
      status: 'queued',
      subjectFr: input.subjectFr.trim(),
      subjectEn: input.subjectEn.trim(),
      previewFr: input.previewFr?.trim() || null,
      previewEn: input.previewEn?.trim() || null,
      template: 'newsletter-broadcast',
      createdById: input.actorId,
      totalRecipients: activeCount,
      payload: {
        headlineFr: input.headlineFr.trim(),
        headlineEn: input.headlineEn.trim(),
        bodyFr: input.bodyFr.trim(),
        bodyEn: input.bodyEn.trim(),
        ctaUrl: input.ctaUrl?.trim() || null,
        ctaLabelFr: input.ctaLabelFr?.trim() || 'Lire la suite',
        ctaLabelEn: input.ctaLabelEn?.trim() || 'Read more',
      },
    });

    if (activeCount > 0) {
      await this.deps.queue.enqueueFanout(campaign.id);
    } else {
      await this.deps.campaignRepository.update(campaign.id, {
        status: 'sent',
        completedAt: new Date(),
      });
    }

    return { campaignId: campaign.id };
  }
}
