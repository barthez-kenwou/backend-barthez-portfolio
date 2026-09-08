import { createDefaultNewsletterDeps, createNewsletterModule } from '@/modules/newsletter';
import log from '@/shared/infrastructure/logging/logger';

/** Cron entrypoint: weekly digest of posts published in the last 7 days. */
export async function runNewsletterWeeklyDigest(): Promise<void> {
  const module = createNewsletterModule(createDefaultNewsletterDeps());
  const result = await module.useCases.sendWeeklyDigest.execute();
  log.info('newsletter-weekly-digest completed', result);
}
