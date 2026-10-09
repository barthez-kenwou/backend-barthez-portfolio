import type { NewsletterSubscriberEntity } from '../../domain/entities/newsletter.entity';
import type {
  NewsletterCampaignRepositoryPort,
  NewsletterSubscriberRepositoryPort,
} from '../../domain/repositories/newsletter.repository';
import { buildBlogIndexUrl, buildUnsubscribeUrl } from './newsletter-links';
import type { NewsletterMailerPort } from './newsletter.ports';

type WelcomeDeps = {
  subscriberRepository: NewsletterSubscriberRepositoryPort;
  campaignRepository: NewsletterCampaignRepositoryPort;
  mailer: NewsletterMailerPort;
};

/**
 * Sends the one-shot welcome email when `welcomeSentAt` is still null.
 */
export async function sendWelcomeIfNeeded(
  deps: WelcomeDeps,
  subscriber: NewsletterSubscriberEntity,
): Promise<void> {
  if (subscriber.welcomeSentAt) return;

  const unsubscribeUrl = buildUnsubscribeUrl(subscriber.unsubscribeToken);
  const blogUrl = buildBlogIndexUrl();
  const locale = subscriber.locale;

  await deps.mailer.send({
    to: subscriber.email,
    subject:
      locale === 'fr'
        ? 'Bienvenue dans le cercle — Barthez Kenwou'
        : "You're in — Barthez Kenwou Newsletter",
    template: 'newsletter-welcome',
    data: {
      name: subscriber.email.split('@')[0],
      locale,
      blogUrl,
      unsubscribeUrl,
    },
    priority: 3,
  });

  await deps.subscriberRepository.update(subscriber.id, {
    welcomeSentAt: new Date(),
    lastEmailedAt: new Date(),
  });

  await deps.campaignRepository.create({
    type: 'welcome',
    status: 'sent',
    subjectFr: 'Bienvenue dans le cercle — Barthez Kenwou',
    subjectEn: "You're in — Barthez Kenwou Newsletter",
    template: 'newsletter-welcome',
    payload: { email: subscriber.email },
    totalRecipients: 1,
  });
}
