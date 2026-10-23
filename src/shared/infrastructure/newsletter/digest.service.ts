import { createDefaultNewsletterDeps, createNewsletterModule } from '@/modules/newsletter';
import log from '@/shared/infrastructure/logging/logger';

/** Cron entrypoint: monthly digest of posts published in the last 30 days. */
export async function runNewsletterWeeklyDigest(): Promise<void> {
  const module = createNewsletterModule(createDefaultNewsletterDeps());
  const result = await module.useCases.sendWeeklyDigest.execute();
  log.info('newsletter-monthly-digest completed', result);
}

/** @deprecated Alias kept for older job names in flight. */
export const runNewsletterMonthlyDigest = runNewsletterWeeklyDigest;
