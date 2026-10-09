import {
  NewsletterCampaignNotCancellableError,
  NewsletterCampaignNotFoundError,
} from '../../domain/errors/newsletter.errors';
import type { NewsletterCampaignRepositoryPort } from '../../domain/repositories/newsletter.repository';

export type CancelNewsletterCampaignCommandDeps = {
  campaignRepository: NewsletterCampaignRepositoryPort;
};

/**
 * Cancel a campaign that has not started sending yet.
 */
export class CancelNewsletterCampaignCommand {
  constructor(private readonly deps: CancelNewsletterCampaignCommandDeps) {}

  async execute(input: { campaignId: string }) {
    const campaign = await this.deps.campaignRepository.findById(input.campaignId);
    if (!campaign) throw new NewsletterCampaignNotFoundError();

    if (campaign.status !== 'queued') {
      throw new NewsletterCampaignNotCancellableError();
    }

    return this.deps.campaignRepository.update(campaign.id, {
      status: 'cancelled',
      completedAt: new Date(),
    });
  }
}
