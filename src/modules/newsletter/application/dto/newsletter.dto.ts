import type { NewsletterLocale } from '../../domain/entities/newsletter.entity';

export type SubscribeNewsletterDto = {
  email: string;
  locale?: NewsletterLocale;
  source?: string;
};

export type ConfirmNewsletterDto = {
  token: string;
};

export type UnsubscribeNewsletterDto = {
  token: string;
};

export type ListNewsletterSubscribersDto = {
  page: number;
  limit: number;
  status?: string;
  locale?: string;
  q?: string;
};

export type BroadcastNewsletterDto = {
  actorId: string;
  subjectFr: string;
  subjectEn: string;
  previewFr?: string;
  previewEn?: string;
  headlineFr: string;
  headlineEn: string;
  bodyFr: string;
  bodyEn: string;
  ctaUrl?: string;
  ctaLabelFr?: string;
  ctaLabelEn?: string;
};

export type NotifyBlogPublishedDto = {
  blogId: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  excerptFr: string;
  excerptEn: string;
  image: string;
  category: string;
  readTime: string;
  tags: string[];
  author: string;
};
