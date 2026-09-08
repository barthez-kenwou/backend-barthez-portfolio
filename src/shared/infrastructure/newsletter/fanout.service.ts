import { buildUnsubscribeUrl } from '@/modules/newsletter/application/services/newsletter-links';
import type { NewsletterCampaignEntity } from '@/modules/newsletter/domain/entities/newsletter.entity';
import { PrismaNewsletterCampaignRepository } from '@/modules/newsletter/infrastructure/repositories/prisma-newsletter-campaign.repository';
import { PrismaNewsletterSubscriberRepository } from '@/modules/newsletter/infrastructure/repositories/prisma-newsletter-subscriber.repository';
import log from '@/shared/infrastructure/logging/logger';
import { queueMail } from '@/shared/infrastructure/mail/mail.service';
import type { MailTemplateName } from '@/shared/infrastructure/mail/mail.types';

const BATCH = 75;

/**
 * Fan-out a queued campaign to all active subscribers (locale-aware subjects).
 * Sequential batches keep SMTP/queue pressure predictable.
 */
/* eslint-disable no-await-in-loop */
export async function runNewsletterFanout(campaignId: string): Promise<void> {
  const campaigns = new PrismaNewsletterCampaignRepository();
  const subscribers = new PrismaNewsletterSubscriberRepository();

  const campaign = await campaigns.findById(campaignId);
  if (!campaign) {
    log.warn('newsletter-fanout: campaign missing', { campaignId });
    return;
  }

  if (campaign.status === 'sent' || campaign.status === 'cancelled') {
    return;
  }

  await campaigns.update(campaignId, {
    status: 'sending',
    startedAt: campaign.startedAt ?? new Date(),
  });

  const template = campaign.template as MailTemplateName;
  const payload = campaign.payload ?? {};
  let skip = 0;
  let sent = 0;
  let fail = 0;

  for (;;) {
    const batch = await subscribers.listActive({ skip, take: BATCH });
    if (batch.length === 0) break;

    for (const sub of batch) {
      try {
        const subject = sub.locale === 'en' ? campaign.subjectEn : campaign.subjectFr;
        await queueMail({
          to: sub.email,
          subject,
          template,
          data: {
            ...payload,
            name: sub.email.split('@')[0],
            locale: sub.locale,
            unsubscribeUrl: buildUnsubscribeUrl(sub.unsubscribeToken),
            previewText:
              sub.locale === 'en'
                ? campaign.previewEn || campaign.previewFr
                : campaign.previewFr || campaign.previewEn,
          },
          priority: 6,
        });
        await subscribers.update(sub.id, { lastEmailedAt: new Date() });
        sent += 1;
      } catch (error) {
        fail += 1;
        log.error('newsletter-fanout: enqueue failed', {
          campaignId,
          email: sub.email,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    skip += batch.length;
    if (batch.length < BATCH) break;
  }

  await campaigns.update(campaignId, {
    status: fail > 0 && sent === 0 ? 'failed' : 'sent',
    sentCount: (campaign.sentCount || 0) + sent,
    failCount: (campaign.failCount || 0) + fail,
    totalRecipients: Math.max(campaign.totalRecipients, sent + fail),
    completedAt: new Date(),
  });

  log.info('newsletter-fanout completed', { campaignId, sent, fail, type: campaign.type });
}

export type { NewsletterCampaignEntity };
