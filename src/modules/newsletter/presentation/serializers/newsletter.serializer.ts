import type {
  NewsletterCampaignEntity,
  NewsletterCampaignListResult,
  NewsletterStats,
  NewsletterSubscriberEntity,
  NewsletterSubscriberListResult,
} from '../../domain/entities/newsletter.entity';

/** Strip tokens from admin API responses. */
export const NewsletterSerializer = {
  subscriber(row: NewsletterSubscriberEntity) {
    return {
      id: row.id,
      email: row.email,
      locale: row.locale,
      status: row.status,
      source: row.source,
      confirmedAt: row.confirmedAt,
      unsubscribedAt: row.unsubscribedAt,
      lastEmailedAt: row.lastEmailedAt,
      welcomeSentAt: row.welcomeSentAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },

  list(result: NewsletterSubscriberListResult) {
    return {
      items: result.items.map(NewsletterSerializer.subscriber),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },

  stats(stats: NewsletterStats) {
    return stats;
  },

  campaign(row: NewsletterCampaignEntity) {
    return {
      id: row.id,
      type: row.type,
      status: row.status,
      subjectFr: row.subjectFr,
      subjectEn: row.subjectEn,
      previewFr: row.previewFr,
      previewEn: row.previewEn,
      template: row.template,
      blogId: row.blogId,
      createdById: row.createdById,
      totalRecipients: row.totalRecipients,
      sentCount: row.sentCount,
      failCount: row.failCount,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },

  campaigns(result: NewsletterCampaignListResult) {
    return {
      items: result.items.map(NewsletterSerializer.campaign),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },
};
