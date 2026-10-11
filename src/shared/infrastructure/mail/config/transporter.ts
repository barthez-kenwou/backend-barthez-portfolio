import nodemailer from 'nodemailer';

import { envs } from '@/app/config';

/**
 * Nodemailer transport used by the legacy send_mail path.
 * Keep TLS behaviour aligned with mail.service (MailHog locally, real SMTP in prod).
 */
const smtpPort = envs.SMTP_PORT;
const smtpSecure = smtpPort === 465;
const isDevCatchAll =
  envs.SMTP_HOST === 'mailhog' || envs.SMTP_HOST === '127.0.0.1' || envs.SMTP_HOST === 'localhost';

const transporter = nodemailer.createTransport({
  host: envs.SMTP_HOST,
  port: smtpPort,
  secure: smtpSecure,
  requireTLS: !isDevCatchAll && !smtpSecure && smtpPort === 587,
  ignoreTLS: isDevCatchAll,
  auth: {
    user: envs.SMTP_USER,
    pass: envs.SMTP_PASS,
  },
});

export default transporter;
