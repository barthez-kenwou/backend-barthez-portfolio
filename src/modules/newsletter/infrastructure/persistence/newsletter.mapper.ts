import type {
  NewsletterCampaignEntity,
  NewsletterCampaignStatus,
  NewsletterCampaignType,
  NewsletterLocale,
  NewsletterStatus,
  NewsletterSubscriberEntity,
} from '../../domain/entities/newsletter.entity';

type SubscriberRow = {
  id: string;
  email: string;
  locale: string;
  status: string;
  source: string;
  confirmToken: string | null;
  confirmTokenExpiresAt: Date | null;
  unsubscribeToken: string;
  confirmedAt: Date | null;
  unsubscribedAt: Date | null;
  lastEmailedAt: Date | null;
  welcomeSentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

type CampaignRow = {
  id: string;
  type: string;
  status: string;
  subjectFr: string;
  subjectEn: string;
  previewFr: string | null;
  previewEn: string | null;
  template: string;
  payload: unknown;
  blogId: string | null;
  createdById: string | null;
  totalRecipients: number;
  sentCount: number;
  failCount: number;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export const NewsletterMapper = {
  subscriberToDomain(row: SubscriberRow): NewsletterSubscriberEntity {
    return {
      id: row.id,
      email: row.email,
      locale: row.locale as NewsletterLocale,
      status: row.status as NewsletterStatus,
      source: row.source,
      confirmToken: row.confirmToken,
      confirmTokenExpiresAt: row.confirmTokenExpiresAt,
      unsubscribeToken: row.unsubscribeToken,
      confirmedAt: row.confirmedAt,
      unsubscribedAt: row.unsubscribedAt,
      lastEmailedAt: row.lastEmailedAt,
      welcomeSentAt: row.welcomeSentAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  },

  campaignToDomain(row: CampaignRow): NewsletterCampaignEntity {
    const payload =
      row.payload && typeof row.payload === 'object' && !Array.isArray(row.payload)
        ? (row.payload as Record<string, unknown>)
        : null;

    return {
      id: row.id,
      type: row.type as NewsletterCampaignType,
      status: row.status as NewsletterCampaignStatus,
      subjectFr: row.subjectFr,
      subjectEn: row.subjectEn,
      previewFr: row.previewFr,
      previewEn: row.previewEn,
      template: row.template,
      payload,
      blogId: row.blogId,
      createdById: row.createdById,
      totalRecipients: row.totalRecipients,
      sentCount: row.sentCount,
      failCount: row.failCount,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  },
};
