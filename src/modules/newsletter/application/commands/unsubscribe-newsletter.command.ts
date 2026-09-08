import { NewsletterTokenInvalidError } from '../../domain/errors/newsletter.errors';
import type { NewsletterSubscriberRepositoryPort } from '../../domain/repositories/newsletter.repository';
import type { UnsubscribeNewsletterDto } from '../dto/newsletter.dto';
import { buildBlogIndexUrl } from '../services/newsletter-links';
import type { NewsletterMailerPort } from '../services/newsletter.ports';

export type UnsubscribeNewsletterCommandDeps = {
  subscriberRepository: NewsletterSubscriberRepositoryPort;
  mailer: NewsletterMailerPort;
};

/**
 * One-click unsubscribe via secure token (CAN-SPAM / GDPR friendly).
 */
export class UnsubscribeNewsletterCommand {
  constructor(private readonly deps: UnsubscribeNewsletterCommandDeps) {}

  async execute(input: UnsubscribeNewsletterDto): Promise<{ ok: true }> {
    const token = input.token?.trim();
    if (!token) throw new NewsletterTokenInvalidError();

    const subscriber = await this.deps.subscriberRepository.findByUnsubscribeToken(token);
    if (!subscriber) throw new NewsletterTokenInvalidError();

    if (subscriber.status !== 'unsubscribed') {
      await this.deps.subscriberRepository.update(subscriber.id, {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
        confirmToken: null,
        confirmTokenExpiresAt: null,
      });

      await this.deps.mailer.send({
        to: subscriber.email,
        subject:
          subscriber.locale === 'fr'
            ? 'Désabonnement confirmé — Barthez Kenwou'
            : 'Unsubscribed — Barthez Kenwou',
        template: 'newsletter-unsubscribed',
        data: {
          name: subscriber.email.split('@')[0],
          locale: subscriber.locale,
          blogUrl: buildBlogIndexUrl(),
        },
        priority: 4,
      });
    }

    return { ok: true };
  }
}
