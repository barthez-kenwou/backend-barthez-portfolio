import log from '@/shared/infrastructure/logging/logger';

import type { NewsletterSubscriberEntity } from '../../domain/entities/newsletter.entity';
import type {
  NewsletterCampaignRepositoryPort,
  NewsletterSubscriberRepositoryPort,
} from '../../domain/repositories/newsletter.repository';
import {
  buildContactUrl,
  buildPortfolioUrl,
  buildServicesUrl,
  buildUnsubscribeUrl,
} from './newsletter-links';
import type { NewsletterMailerPort, NewsletterQueuePort } from './newsletter.ports';
import {
  type WelcomeBlogSourcePort,
  type WelcomeResource,
  buildWelcomeResourceUrl,
  resolveWelcomeResource,
} from './welcome-resource';

type WelcomeDeps = {
  subscriberRepository: NewsletterSubscriberRepositoryPort;
  campaignRepository: NewsletterCampaignRepositoryPort;
  mailer: NewsletterMailerPort;
  queue?: NewsletterQueuePort;
  blogSource?: WelcomeBlogSourcePort;
};

const WELCOME_SUBJECTS: Record<1 | 2 | 3, { fr: string; en: string }> = {
  1: {
    fr: 'Bienvenue — notes prod, une fois par mois',
    en: 'Welcome — production notes, once a month',
  },
  2: {
    fr: 'Pour qui sont ces notes',
    en: 'Who these notes are for',
  },
  3: {
    fr: 'Une erreur fréquente en production (et évitable)',
    en: 'A common production mistake (and how to avoid it)',
  },
};

function subjectsForStep(step: 1 | 2 | 3, resource: WelcomeResource) {
  if (step !== 3) return WELCOME_SUBJECTS[step];
  const shortFr =
    resource.titleFr.length > 60 ? `${resource.titleFr.slice(0, 57)}…` : resource.titleFr;
  const shortEn =
    resource.titleEn.length > 60 ? `${resource.titleEn.slice(0, 57)}…` : resource.titleEn;
  return {
    fr: `Approfondir : ${shortFr}`,
    en: `Go deeper: ${shortEn}`,
  };
}

/**
 * Sends welcome step 1 immediately when `welcomeSentAt` is still null,
 * then schedules steps 2 (J+3) and 3 (J+8) via the queue.
 */
export async function sendWelcomeIfNeeded(
  deps: WelcomeDeps,
  subscriber: NewsletterSubscriberEntity,
): Promise<void> {
  if (subscriber.welcomeSentAt) return;

  const sent = await sendWelcomeStep(deps, subscriber, 1);
  if (!sent) return;

  await deps.subscriberRepository.update(subscriber.id, {
    welcomeSentAt: new Date(),
    lastEmailedAt: new Date(),
  });

  if (deps.queue?.scheduleWelcomeStep) {
    const dayMs = 24 * 60 * 60 * 1000;
    await deps.queue.scheduleWelcomeStep(subscriber.id, 2, 3 * dayMs);
    await deps.queue.scheduleWelcomeStep(subscriber.id, 3, 8 * dayMs);
  }
}

/**
 * Delivers one welcome drip step if the subscriber is still active.
 * Resource = most-read in the category of the article they signed up from
 * (else global most-read, else flagship).
 */
export async function sendWelcomeStep(
  deps: WelcomeDeps,
  subscriber: NewsletterSubscriberEntity,
  step: 1 | 2 | 3,
): Promise<boolean> {
  if (subscriber.status !== 'active' || subscriber.deletedAt) {
    return false;
  }

  const resource = deps.blogSource
    ? await resolveWelcomeResource(subscriber.source, deps.blogSource)
    : await resolveWelcomeResource(subscriber.source, {
        findPublishedBySlug: async () => null,
        findTopViewedPublished: async () => null,
      });

  const locale = subscriber.locale;
  const subjects = subjectsForStep(step, resource);
  const campaign = `welcome-${step}`;
  const blogUrl = buildWelcomeResourceUrl(resource, {
    campaign,
    content: 'cta-blog',
  });
  const urls = {
    blogUrl,
    portfolioUrl: buildPortfolioUrl({ campaign, content: 'cta-projet' }),
    servicesUrl: buildServicesUrl({ campaign, content: 'cta-service' }),
    contactUrl: buildContactUrl({ campaign, content: 'cta-contact' }),
  };
  const unsubscribeUrl = buildUnsubscribeUrl(subscriber.unsubscribeToken);

  try {
    await deps.mailer.send({
      to: subscriber.email,
      subject: locale === 'fr' ? subjects.fr : subjects.en,
      template: 'newsletter-welcome',
      data: {
        name: subscriber.email.split('@')[0],
        locale,
        step,
        unsubscribeUrl,
        resourceTitleFr: resource.titleFr,
        resourceTitleEn: resource.titleEn,
        resourceCategory: resource.category,
        ...urls,
      },
      priority: 3,
      immediate: step === 1,
    });
  } catch (error) {
    log.error('newsletter welcome email failed', {
      subscriberId: subscriber.id,
      email: subscriber.email,
      step,
      resourceSlug: resource.slug,
      resolution: resource.resolution,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }

  const campaignRow = await deps.campaignRepository.create({
    type: 'welcome',
    status: 'sent',
    subjectFr: subjects.fr,
    subjectEn: subjects.en,
    template: 'newsletter-welcome',
    payload: {
      email: subscriber.email,
      step,
      source: subscriber.source,
      resourceSlug: resource.slug,
      resourceCategory: resource.category,
      resolution: resource.resolution,
    },
    totalRecipients: 1,
  });

  await deps.campaignRepository.update(campaignRow.id, {
    sentCount: 1,
    failCount: 0,
    startedAt: new Date(),
    completedAt: new Date(),
  });

  if (step > 1) {
    await deps.subscriberRepository.update(subscriber.id, {
      lastEmailedAt: new Date(),
    });
  }

  log.info('newsletter welcome step sent', {
    subscriberId: subscriber.id,
    step,
    source: subscriber.source,
    resourceSlug: resource.slug,
    resolution: resource.resolution,
  });

  return true;
}
