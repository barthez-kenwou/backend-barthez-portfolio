import { createDefaultNewsletterDeps, createNewsletterModule } from '@/modules/newsletter';
import { sendWelcomeStep } from '@/modules/newsletter/application/services/send-welcome-email';
import log from '@/shared/infrastructure/logging/logger';

/**
 * Delayed welcome drip (steps 2–3). Skips if subscriber left the list.
 */
export async function runNewsletterWelcomeDrip(subscriberId: string, step: number): Promise<void> {
  const dripStep = step === 3 ? 3 : 2;
  const module = createNewsletterModule(createDefaultNewsletterDeps());
  const subscriber = await module.deps.subscriberRepository.findById(subscriberId);

  if (!subscriber) {
    log.info('newsletter-welcome-drip: subscriber missing', { subscriberId, step: dripStep });
    return;
  }

  const sent = await sendWelcomeStep(
    {
      subscriberRepository: module.deps.subscriberRepository,
      campaignRepository: module.deps.campaignRepository,
      mailer: module.deps.mailer,
      blogSource: module.deps.blogSource,
    },
    subscriber,
    dripStep,
  );

  log.info('newsletter-welcome-drip completed', {
    subscriberId,
    step: dripStep,
    sent,
  });
}
