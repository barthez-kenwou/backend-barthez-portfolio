import { randomBytes } from 'node:crypto';

import { envs } from '@/app/config';

const CONFIRM_TTL_MS = 48 * 60 * 60 * 1000;

export function createSecureToken(): string {
  return randomBytes(32).toString('hex');
}

export function confirmTokenExpiry(from = new Date()): Date {
  return new Date(from.getTime() + CONFIRM_TTL_MS);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function buildConfirmUrl(token: string): string {
  const base = envs.SERVER_URL.replace(/\/$/, '');
  const prefix = envs.API_PREFIX.replace(/\/$/, '') || '/api/v1';
  return `${base}${prefix}/newsletter/confirm?token=${encodeURIComponent(token)}`;
}

export function buildUnsubscribeUrl(token: string): string {
  const base = envs.SERVER_URL.replace(/\/$/, '');
  const prefix = envs.API_PREFIX.replace(/\/$/, '') || '/api/v1';
  return `${base}${prefix}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

export type NewsletterUtm = {
  campaign: string;
  content?: string;
};

/** Append standard newsletter UTM params to a URL. */
export function withNewsletterUtm(url: string, utm: NewsletterUtm): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('utm_source', 'newsletter');
    parsed.searchParams.set('utm_medium', 'email');
    parsed.searchParams.set('utm_campaign', utm.campaign);
    if (utm.content) parsed.searchParams.set('utm_content', utm.content);
    return parsed.toString();
  } catch {
    const sep = url.includes('?') ? '&' : '?';
    const content = utm.content ? `&utm_content=${encodeURIComponent(utm.content)}` : '';
    return `${url}${sep}utm_source=newsletter&utm_medium=email&utm_campaign=${encodeURIComponent(utm.campaign)}${content}`;
  }
}

export function clientBaseUrl(): string {
  return (envs.CLIENT_URL || 'https://barthez-kenwou.dev').replace(/\/$/, '');
}

export function buildBlogPostUrl(slug: string, utm?: NewsletterUtm): string {
  const url = `${clientBaseUrl()}/blog/${encodeURIComponent(slug)}`;
  return utm ? withNewsletterUtm(url, utm) : url;
}

export function buildBlogIndexUrl(utm?: NewsletterUtm): string {
  const url = `${clientBaseUrl()}/blog`;
  return utm ? withNewsletterUtm(url, utm) : url;
}

export function buildPortfolioUrl(utm?: NewsletterUtm): string {
  const url = clientBaseUrl();
  return utm ? withNewsletterUtm(url, utm) : url;
}

export function buildServicesUrl(utm?: NewsletterUtm): string {
  const url = `${clientBaseUrl()}/services`;
  return utm ? withNewsletterUtm(url, utm) : url;
}

export function buildContactUrl(utm?: NewsletterUtm): string {
  const url = `${clientBaseUrl()}/contact`;
  return utm ? withNewsletterUtm(url, utm) : url;
}

/** Flagship guide used in welcome drip. */
export const WELCOME_FLAGSHIP_SLUG = 'ci-cd-github-actions-zero-to-expert';
