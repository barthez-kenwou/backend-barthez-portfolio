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

export function buildBlogPostUrl(slug: string): string {
  const client = (envs.CLIENT_URL || 'https://barthez-kenwou.dev').replace(/\/$/, '');
  return `${client}/blog/${encodeURIComponent(slug)}`;
}

export function buildBlogIndexUrl(): string {
  const client = (envs.CLIENT_URL || 'https://barthez-kenwou.dev').replace(/\/$/, '');
  return `${client}/blog`;
}
