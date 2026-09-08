/**
 * OpenAPI info, servers, and tags for the barthez-kenwou.dev portfolio API.
 */
const info = {
  title: 'Barthez Kenwou Portfolio API',
  description: [
    'Backend for https://barthez-kenwou.dev — public portfolio content and',
    '`/barthez-admin` CMS (projects, blogs, skills, CV, contact, testimonials).',
    '',
    'Platform: RS256 JWT auth (OTP + optional TOTP), OAuth 2.0, RBAC, MinIO/S3 uploads,',
    'Redis, BullMQ, Flagsmith, audit, and operator surfaces.',
    '',
    '**Authentication:** `Authorization: Bearer <access_token>` on protected routes.',
    'Refresh tokens use an HTTP-only cookie; `/auth/refresh` also accepts `refreshToken` in JSON.',
    '',
    '**Base paths:** domain APIs under `/api/v1`. System endpoints (`/health`, `/csrf-token`,',
    '`/metrics`, CSP report URI, Bull Board) are at the application root.',
    '',
    '**Public vs admin:** most list/get endpoints are public (published filters).',
    'Mutations require verified admin permissions. Contact form, testimonial feedback, and',
    'newsletter subscribe are public POSTs (newsletter uses double opt-in).',
  ].join('\n'),
  version: '1.0.0',
  contact: {
    name: 'Barthez Kenwou',
    email: 'contact@barthez-kenwou.dev',
    url: 'https://barthez-kenwou.dev',
  },
  license: {
    name: 'UNLICENSED',
    url: 'https://barthez-kenwou.dev',
  },
};

const servers = [
  {
    url: 'http://localhost:3000',
    description: 'Local development',
  },
  {
    url: 'https://api.barthez-kenwou.dev',
    description: 'Production (when deployed)',
  },
];

const tags = [
  {
    name: 'Authentication',
    description:
      'Signup, OTP, login, refresh, password flows, current user (`/me`), sessions, and optional TOTP',
  },
  {
    name: 'OAuth',
    description:
      'Social login (redirect providers + Telegram widget), account linking and unlinking',
  },
  {
    name: 'Users',
    description:
      'Self-service profile and admin user lifecycle (invite, activate, unlock, export, GDPR delete)',
  },
  {
    name: 'Blogs',
    description: 'Bilingual portfolio blog posts (FR/EN) with publish flag',
  },
  {
    name: 'Projects',
    description: 'Portfolio case studies with featured / published / confidential flags',
  },
  {
    name: 'Services',
    description: 'Offered services and pricing (EUR source of truth)',
  },
  {
    name: 'Skills',
    description: 'Skill matrix (name, category, level, icon)',
  },
  {
    name: 'Experiences',
    description: 'Professional experiences for CV and About',
  },
  {
    name: 'Education',
    description: 'Education entries for CV',
  },
  {
    name: 'Certifications',
    description: 'Certifications for Skills page and CV',
  },
  {
    name: 'Testimonials',
    description: 'Public testimonials + feedback form with moderation',
  },
  {
    name: 'Achievements',
    description: 'Highlight counters shown on the Skills page',
  },
  {
    name: 'References',
    description: 'Professional references (PII — admin / CV aggregate)',
  },
  {
    name: 'Languages',
    description: 'Spoken languages for the CV',
  },
  {
    name: 'ContactInfos',
    description: 'Singleton public profile / contact card',
  },
  {
    name: 'ContactResponses',
    description: 'Inbound contact-form messages (public POST, admin inbox)',
  },
  {
    name: 'Newsletter',
    description:
      'Blog newsletter: double opt-in subscribe, confirm, unsubscribe, admin CRM, broadcasts, digests',
  },
  {
    name: 'CV',
    description: 'Aggregated CV payload for the public resume page / PDF',
  },
  {
    name: 'Files',
    description: 'Presigned object-storage URLs for large uploads/downloads',
  },
  {
    name: 'System',
    description: 'Health, CSRF, metrics, CSP, audit, admin dashboard counts, and Bull Board',
  },
];

module.exports = { info, servers, tags };
