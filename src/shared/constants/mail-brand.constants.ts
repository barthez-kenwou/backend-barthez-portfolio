/**
 * Default transactional-mail brand kit — aligned with barthez-kenwou.dev
 * (“Pearl & Amethyst” light theme for inbox-safe rendering).
 *
 * Override via env (`MAIL_BRAND_*`, `MAIL_SOCIAL_*`, `MAIL_FOOTER_*`) —
 * leave a value empty to hide that element in templates.
 */

export type MailBrandColors = {
  primary: string;
  primaryDark: string;
  primaryMid: string;
  primarySoft: string;
  accent: string;
  success: string;
  successDark: string;
  successSoft: string;
  warning: string;
  warningDark: string;
  warningSoft: string;
  danger: string;
  dangerDark: string;
  dangerSoft: string;
  canvas: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  footerBg: string;
  onPrimary: string;
  /** Dark ink used in header gradients (Brilliant Obscure). */
  ink: string;
  /** Spectrum accents (site CTA rim). */
  spectrum1: string;
  spectrum2: string;
  spectrum3: string;
};

export type MailSocialLink = {
  id: string;
  label: string;
  url: string;
};

/** Pearl & Amethyst — portfolio site light tokens. */
export const MAIL_BRAND_COLORS_DEFAULT: MailBrandColors = {
  primary: '#622ba1',
  primaryDark: '#4b2a78',
  primaryMid: '#814ebc',
  primarySoft: '#f2eef6',
  accent: '#22d3ee',
  success: '#059669',
  successDark: '#047857',
  successSoft: '#d1fae5',
  warning: '#d97706',
  warningDark: '#b45309',
  warningSoft: '#fef3c7',
  danger: '#d32222',
  dangerDark: '#b91c1c',
  dangerSoft: '#fee2e2',
  canvas: '#fbfafd',
  card: '#ffffff',
  text: '#1f1627',
  textMuted: '#61556d',
  border: '#e0dce5',
  footerBg: '#f9f7fb',
  onPrimary: '#ffffff',
  ink: '#241a2e',
  spectrum1: '#7c3aed',
  spectrum2: '#22d3ee',
  spectrum3: '#e879f9',
};

/** Public-facing name in email copy (not the API process name). */
export const MAIL_BRAND_NAME_DEFAULT = 'Barthez Kenwou';

export const MAIL_BRAND_MONOGRAM_DEFAULT = 'BK';

export const MAIL_SOCIAL_IDS = ['facebook', 'linkedin', 'youtube', 'github'] as const;

export type MailSocialId = (typeof MAIL_SOCIAL_IDS)[number];

export const MAIL_SOCIAL_LABELS: Record<MailSocialId, string> = {
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  github: 'GitHub',
};
