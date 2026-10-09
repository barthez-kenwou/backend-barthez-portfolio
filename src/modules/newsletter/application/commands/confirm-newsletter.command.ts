import { NewsletterTokenInvalidError } from '../../domain/errors/newsletter.errors';
import type {
  NewsletterCampaignRepositoryPort,
  NewsletterSubscriberRepositoryPort,
} from '../../domain/repositories/newsletter.repository';
import type { ConfirmNewsletterDto } from '../dto/newsletter.dto';
import type { NewsletterMailerPort } from '../services/newsletter.ports';
import { sendWelcomeIfNeeded } from '../services/send-welcome-email';

export type ConfirmNewsletterCommandDeps = {
  subscriberRepository: NewsletterSubscriberRepositoryPort;
  campaignRepository: NewsletterCampaignRepositoryPort;
  mailer: NewsletterMailerPort;
};

/**
 * Legacy double-opt-in confirmation link.
 * Still activates old `pending` rows and sends welcome once if needed.
 */
export class ConfirmNewsletterCommand {
  constructor(private readonly deps: ConfirmNewsletterCommandDeps) {}

  async execute(input: ConfirmNewsletterDto): Promise<{ ok: true; locale: string }> {
    const token = input.token?.trim();
    if (!token) throw new NewsletterTokenInvalidError();

    const subscriber = await this.deps.subscriberRepository.findByConfirmToken(token);
    if (!subscriber) throw new NewsletterTokenInvalidError();

    if (
      subscriber.confirmTokenExpiresAt &&
      subscriber.confirmTokenExpiresAt.getTime() < Date.now()
    ) {
      throw new NewsletterTokenInvalidError('Confirmation link has expired — subscribe again');
    }

    const alreadyActive = subscriber.status === 'active';

    const updated = alreadyActive
      ? subscriber
      : await this.deps.subscriberRepository.update(subscriber.id, {
          status: 'active',
          confirmedAt: new Date(),
          confirmToken: null,
          confirmTokenExpiresAt: null,
          unsubscribedAt: null,
        });

    await sendWelcomeIfNeeded(this.deps, updated);

    return { ok: true, locale: updated.locale };
  }
}
