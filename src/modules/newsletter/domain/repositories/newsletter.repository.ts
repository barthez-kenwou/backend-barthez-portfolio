import type {
  CreateNewsletterCampaignInput,
  CreateNewsletterSubscriberInput,
  NewsletterCampaignEntity,
  NewsletterCampaignListResult,
  NewsletterCampaignStatus,
  NewsletterCampaignType,
  NewsletterLocale,
  NewsletterStats,
  NewsletterStatus,
  NewsletterSubscriberEntity,
  NewsletterSubscriberListResult,
  UpdateNewsletterCampaignInput,
  UpdateNewsletterSubscriberInput,
} from '../entities/newsletter.entity';

export type NewsletterSubscriberRepositoryPort = {
  create(data: CreateNewsletterSubscriberInput): Promise<NewsletterSubscriberEntity>;
  findById(id: string): Promise<NewsletterSubscriberEntity | null>;
  findByEmail(email: string): Promise<NewsletterSubscriberEntity | null>;
  findByConfirmToken(token: string): Promise<NewsletterSubscriberEntity | null>;
  findByUnsubscribeToken(token: string): Promise<NewsletterSubscriberEntity | null>;
  list(input: {
    page: number;
    limit: number;
    status?: NewsletterStatus;
    locale?: NewsletterLocale;
    q?: string;
  }): Promise<NewsletterSubscriberListResult>;
  listActive(input: {
    skip: number;
    take: number;
    locale?: NewsletterLocale;
  }): Promise<NewsletterSubscriberEntity[]>;
  countActive(locale?: NewsletterLocale): Promise<number>;
  stats(): Promise<NewsletterStats>;
  update(id: string, data: UpdateNewsletterSubscriberInput): Promise<NewsletterSubscriberEntity>;
};

export type NewsletterCampaignRepositoryPort = {
  create(data: CreateNewsletterCampaignInput): Promise<NewsletterCampaignEntity>;
  findById(id: string): Promise<NewsletterCampaignEntity | null>;
  findRecentByBlog(
    blogId: string,
    type: NewsletterCampaignType,
  ): Promise<NewsletterCampaignEntity | null>;
  list(input: {
    page: number;
    limit: number;
    type?: NewsletterCampaignType;
    status?: NewsletterCampaignStatus;
  }): Promise<NewsletterCampaignListResult>;
  update(id: string, data: UpdateNewsletterCampaignInput): Promise<NewsletterCampaignEntity>;
  incrementCounters(
    id: string,
    delta: { sent?: number; fail?: number },
  ): Promise<NewsletterCampaignEntity>;
};
