/**
 * Builds the shared locals injected into every EJS mail template.
 * Callers only pass template-specific fields (otp, name, resetLink, …).
 */
import { config, envs } from '@/app/config';
import {
  MAIL_SOCIAL_IDS,
  MAIL_SOCIAL_LABELS,
  type MailBrandColors,
  type MailSocialLink,
} from '@/shared/constants/mail-brand.constants';

export type MailHeaderTone = 'brand' | 'success' | 'warning' | 'danger';

export type MailHeaderGradient = {
  from: string;
  mid: string;
  to: string;
  soft: string;
};

export type MailBrandLocals = {
  colors: MailBrandColors;
  logoUrl: string;
  brandName: string;
  monogram: string;
  tagline: string;
  company: string;
  address: string;
  phone: string;
  websiteLabel: string;
  privacyUrl: string;
  termsUrl: string;
  helpUrl: string;
  socials: MailSocialLink[];
  supportEmail: string;
  clientUrl: string;
  /** Technical app name (process / API). Prefer brandName in user copy. */
  appName: string;
  year: number;
  headerGradient: (tone?: MailHeaderTone) => MailHeaderGradient;
};

export function buildMailBrandLocals(
  data: Record<string, unknown> = {},
): MailBrandLocals & Record<string, unknown> {
  const brand = config.mail.brand;
  const colors = brand.colors;

  const socials: MailSocialLink[] = [];
  for (const id of MAIL_SOCIAL_IDS) {
    const url = brand.social[id];
    if (!url) continue;
    socials.push({ id, label: MAIL_SOCIAL_LABELS[id], url });
  }

  const supportEmail =
    (data.supportEmail as string | undefined)?.trim() ||
    config.mail.supportEmail ||
    envs.USER_EMAIL ||
    '';

  const clientUrl = (data.clientUrl as string | undefined)?.trim() || envs.CLIENT_URL || '';

  const headerGradient = (tone: MailHeaderTone = 'brand'): MailHeaderGradient => {
    switch (tone) {
      case 'success':
        return {
          from: colors.successDark,
          mid: colors.success,
          to: colors.success,
          soft: colors.successSoft,
        };
      case 'warning':
        return {
          from: colors.warningDark,
          mid: colors.warning,
          to: colors.warning,
          soft: colors.warningSoft,
        };
      case 'danger':
        return {
          from: colors.dangerDark,
          mid: colors.danger,
          to: colors.danger,
          soft: colors.dangerSoft,
        };
      default:
        // Site primary gradient: ink → amethyst → mid violet
        return {
          from: colors.ink,
          mid: colors.primary,
          to: colors.primaryMid,
          soft: colors.primarySoft,
        };
    }
  };

  return {
    ...data,
    appName: envs.APP_NAME,
    brandName: brand.name,
    monogram: brand.monogram,
    year: new Date().getFullYear(),
    clientUrl,
    supportEmail,
    colors,
    logoUrl: brand.logoUrl,
    tagline: brand.tagline,
    company: brand.company,
    address: brand.address,
    phone: brand.phone,
    websiteLabel: brand.websiteLabel || 'Visit barthez-kenwou.dev',
    privacyUrl: brand.privacyUrl,
    termsUrl: brand.termsUrl,
    helpUrl: brand.helpUrl,
    socials,
    headerGradient,
  };
}
