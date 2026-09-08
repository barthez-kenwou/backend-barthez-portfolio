/**
 * Newsletter domain entities — no Prisma types.
 */

export type NewsletterStatus = 'pending' | 'active' | 'unsubscribed' | 'bounced';
export type NewsletterLocale = 'fr' | 'en';
export type NewsletterCampaignType =
  | 'confirm'
  | 'welcome'
  | 'blog_publish'
  | 'digest'
  | 'broadcast';
export type NewsletterCampaignStatus = 'queued' | 'sending' | 'sent' | 'failed' | 'cancelled';

export type NewsletterSubscriberEntity = {
  id: string;
  email: string;
  locale: NewsletterLocale;
  status: NewsletterStatus;
  source: string;
  confirmToken?: string | null;
  confirmTokenExpiresAt?: Date | null;
  unsubscribeToken: string;
  confirmedAt?: Date | null;
  unsubscribedAt?: Date | null;
  lastEmailedAt?: Date | null;
  welcomeSentAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export type CreateNewsletterSubscriberInput = {
  email: string;
  locale: NewsletterLocale;
  source: string;
  status: NewsletterStatus;
  confirmToken: string;
  confirmTokenExpiresAt: Date;
  unsubscribeToken: string;
};

export type UpdateNewsletterSubscriberInput = Partial<{
  locale: NewsletterLocale;
  status: NewsletterStatus;
  source: string;
  confirmToken: string | null;
  confirmTokenExpiresAt: Date | null;
  unsubscribeToken: string;
  confirmedAt: Date | null;
  unsubscribedAt: Date | null;
  lastEmailedAt: Date | null;
  welcomeSentAt: Date | null;
  deletedAt: Date | null;
}>;

export type NewsletterSubscriberListResult = {
  items: NewsletterSubscriberEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type NewsletterStats = {
  total: number;
  pending: number;
  active: number;
  unsubscribed: number;
  bounced: number;
};

export type NewsletterCampaignEntity = {
  id: string;
  type: NewsletterCampaignType;
  status: NewsletterCampaignStatus;
  subjectFr: string;
  subjectEn: string;
  previewFr?: string | null;
  previewEn?: string | null;
  template: string;
  payload?: Record<string, unknown> | null;
  blogId?: string | null;
  createdById?: string | null;
  totalRecipients: number;
  sentCount: number;
  failCount: number;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export type CreateNewsletterCampaignInput = {
  type: NewsletterCampaignType;
  status?: NewsletterCampaignStatus;
  subjectFr: string;
  subjectEn: string;
  previewFr?: string | null;
  previewEn?: string | null;
  template: string;
  payload?: Record<string, unknown> | null;
  blogId?: string | null;
  createdById?: string | null;
  totalRecipients?: number;
};

export type UpdateNewsletterCampaignInput = Partial<{
  status: NewsletterCampaignStatus;
  totalRecipients: number;
  sentCount: number;
  failCount: number;
  startedAt: Date | null;
  completedAt: Date | null;
  deletedAt: Date | null;
  payload: Record<string, unknown> | null;
}>;

export type NewsletterCampaignListResult = {
  items: NewsletterCampaignEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
