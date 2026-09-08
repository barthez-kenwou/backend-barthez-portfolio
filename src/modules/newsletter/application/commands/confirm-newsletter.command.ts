import { NewsletterTokenInvalidError } from '../../domain/errors/newsletter.errors';
import type {
  NewsletterCampaignRepositoryPort,
  NewsletterSubscriberRepositoryPort,
} from '../../domain/repositories/newsletter.repository';
import type { ConfirmNewsletterDto } from '../dto/newsletter.dto';
import { buildBlogIndexUrl, buildUnsubscribeUrl } from '../services/newsletter-links';
import type { NewsletterMailerPort } from '../services/newsletter.ports';

export type ConfirmNewsletterCommandDeps = {
  subscriberRepository: NewsletterSubscriberRepositoryPort;
  campaignRepository: NewsletterCampaignRepositoryPort;
  mailer: NewsletterMailerPort;
};

/**
 * Activates a pending subscriber and sends the welcome email once.
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

    if (!updated.welcomeSentAt) {
      const unsubscribeUrl = buildUnsubscribeUrl(updated.unsubscribeToken);
      const blogUrl = buildBlogIndexUrl();
      const locale = updated.locale;

      await this.deps.mailer.send({
        to: updated.email,
        subject:
          locale === 'fr'
            ? 'Bienvenue dans le cercle — Barthez Kenwou'
            : "You're in — Barthez Kenwou Newsletter",
        template: 'newsletter-welcome',
        data: {
          name: updated.email.split('@')[0],
          locale,
          blogUrl,
          unsubscribeUrl,
        },
        priority: 3,
      });

      await this.deps.subscriberRepository.update(updated.id, {
        welcomeSentAt: new Date(),
        lastEmailedAt: new Date(),
      });

      await this.deps.campaignRepository.create({
        type: 'welcome',
        status: 'sent',
        subjectFr: 'Bienvenue dans le cercle — Barthez Kenwou',
        subjectEn: "You're in — Barthez Kenwou Newsletter",
        template: 'newsletter-welcome',
        payload: { email: updated.email },
        totalRecipients: 1,
      });
    }

    return { ok: true, locale: updated.locale };
  }
}
