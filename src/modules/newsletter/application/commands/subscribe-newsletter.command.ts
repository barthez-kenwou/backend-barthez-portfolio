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
import {
  buildConfirmUrl,
  buildUnsubscribeUrl,
  confirmTokenExpiry,
  createSecureToken,
  normalizeEmail,
} from '../services/newsletter-links';
import type { NewsletterMailerPort } from '../services/newsletter.ports';

export type SubscribeNewsletterCommandDeps = {
  subscriberRepository: NewsletterSubscriberRepositoryPort;
  campaignRepository: NewsletterCampaignRepositoryPort;
  mailer: NewsletterMailerPort;
};

/**
 * Public blog CTA subscribe — always double opt-in.
 * Response is intentionally opaque (anti-enumeration).
 */
export class SubscribeNewsletterCommand {
  constructor(private readonly deps: SubscribeNewsletterCommandDeps) {}

  async execute(input: SubscribeNewsletterDto): Promise<{ ok: true }> {
    const email = normalizeEmail(input.email);
    const locale = (input.locale === 'en' ? 'en' : 'fr') as NewsletterLocale;
    const source = (input.source?.trim() || 'blog').slice(0, 64);

    const existing = await this.deps.subscriberRepository.findByEmail(email);
    const confirmToken = createSecureToken();
    const confirmTokenExpiresAt = confirmTokenExpiry();
    const unsubscribeToken = existing?.unsubscribeToken || createSecureToken();

    let subscriber: NewsletterSubscriberEntity;

    if (!existing) {
      subscriber = await this.deps.subscriberRepository.create({
        email,
        locale,
        source,
        status: 'pending',
        confirmToken,
        confirmTokenExpiresAt,
        unsubscribeToken,
      });
    } else if (existing.status === 'active') {
      // Already confirmed — soft acknowledgement email optional; stay quiet.
      return { ok: true };
    } else {
      // pending / unsubscribed / bounced / soft-deleted → restart confirmation
      subscriber = await this.deps.subscriberRepository.update(existing.id, {
        locale,
        source,
        status: 'pending',
        confirmToken,
        confirmTokenExpiresAt,
        unsubscribeToken,
        unsubscribedAt: null,
        confirmedAt: null,
        deletedAt: null,
      });
    }

    const confirmUrl = buildConfirmUrl(confirmToken);
    const unsubscribeUrl = buildUnsubscribeUrl(subscriber.unsubscribeToken);

    await this.deps.mailer.send({
      to: email,
      subject:
        locale === 'fr'
          ? 'Confirme ton abonnement — Barthez Kenwou'
          : 'Confirm your subscription — Barthez Kenwou',
      template: 'newsletter-confirm',
      data: {
        name: email.split('@')[0],
        locale,
        confirmUrl,
        unsubscribeUrl,
      },
      priority: 2,
    });

    await this.deps.campaignRepository.create({
      type: 'confirm',
      status: 'sent',
      subjectFr: 'Confirme ton abonnement — Barthez Kenwou',
      subjectEn: 'Confirm your subscription — Barthez Kenwou',
      template: 'newsletter-confirm',
      payload: { email, locale },
      totalRecipients: 1,
      createdById: null,
    });

    return { ok: true };
  }
}

export type { NewsletterStatus };
