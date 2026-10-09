import type {
  NewsletterLocale,
  NewsletterStatus,
  NewsletterSubscriberEntity,
} from '../../domain/entities/newsletter.entity';
import type {
  NewsletterCampaignRepositoryPort,
  NewsletterSubscriberRepositoryPort,
} from '../../domain/repositories/newsletter.repository';
import type { SubscribeNewsletterDto } from '../dto/newsletter.dto';
import { createSecureToken, normalizeEmail } from '../services/newsletter-links';
import type { NewsletterMailerPort } from '../services/newsletter.ports';
import { sendWelcomeIfNeeded } from '../services/send-welcome-email';

export type SubscribeNewsletterCommandDeps = {
  subscriberRepository: NewsletterSubscriberRepositoryPort;
  campaignRepository: NewsletterCampaignRepositoryPort;
  mailer: NewsletterMailerPort;
};

/**
 * Public blog CTA subscribe — single opt-in.
 * Subscriber becomes `active` immediately; welcome email once (no confirm/pending).
 * Response stays opaque (anti-enumeration).
 */
export class SubscribeNewsletterCommand {
  constructor(private readonly deps: SubscribeNewsletterCommandDeps) {}

  async execute(input: SubscribeNewsletterDto): Promise<{ ok: true }> {
    const email = normalizeEmail(input.email);
    const locale = (input.locale === 'en' ? 'en' : 'fr') as NewsletterLocale;
    const source = (input.source?.trim() || 'blog').slice(0, 64);

    const existing = await this.deps.subscriberRepository.findByEmail(email);
    const unsubscribeToken = existing?.unsubscribeToken || createSecureToken();
    const now = new Date();

    let subscriber: NewsletterSubscriberEntity;

    if (!existing) {
      subscriber = await this.deps.subscriberRepository.create({
        email,
        locale,
        source,
        status: 'active',
        confirmToken: null,
        confirmTokenExpiresAt: null,
        unsubscribeToken,
        confirmedAt: now,
      });
    } else if (existing.status === 'active' && !existing.deletedAt) {
      return { ok: true };
    } else {
      // pending / unsubscribed / bounced / soft-deleted → activate immediately
      subscriber = await this.deps.subscriberRepository.update(existing.id, {
        locale,
        source,
        status: 'active',
        confirmToken: null,
        confirmTokenExpiresAt: null,
        unsubscribeToken,
        unsubscribedAt: null,
        confirmedAt: existing.confirmedAt ?? now,
        deletedAt: null,
      });
    }

    await sendWelcomeIfNeeded(this.deps, subscriber);

    return { ok: true };
  }
}

export type { NewsletterStatus };
