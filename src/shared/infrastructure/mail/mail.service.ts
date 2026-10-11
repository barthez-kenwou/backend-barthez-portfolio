/**
 * Mail service — SMTP send + BullMQ enqueue.
 * Prefer `queueMail` for application flows; workers call `sendMailDirect`.
 * Transactional newsletter welcome uses `sendMailDirect` immediately.
 */
import nodemailer from 'nodemailer';

import { envs } from '@/app/config';
import log from '@/shared/infrastructure/logging/logger';
import { getMailFromAddress, renderTemplate } from '@/shared/infrastructure/mail/template.service';
import { mailQueue } from '@/shared/infrastructure/queue/queue.service';
import { getRequestContext } from '@/shared/infrastructure/request-context';

import type { MailPayload, MailerPort } from './mail.port';
import type { MailJobPayload, SendMailOptions } from './mail.types';

const smtpPort = envs.SMTP_PORT;
const smtpSecure = smtpPort === 465;

const transporter = nodemailer.createTransport({
  host: envs.SMTP_HOST,
  port: smtpPort,
  secure: smtpSecure,
  // Port 587: STARTTLS. Do not ignoreTLS — that only suits MailHog locally.
  requireTLS: !smtpSecure && smtpPort === 587,
  auth: { user: envs.SMTP_USER, pass: envs.SMTP_PASS },
  pool: true,
  maxConnections: 5,
});

export const verifyMailTransport = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    log.info('SMTP transport verified', {
      host: envs.SMTP_HOST,
      port: smtpPort,
      secure: smtpSecure,
      from: envs.USER_EMAIL,
    });
    return true;
  } catch (error) {
    log.error('SMTP transport verification failed', {
      host: envs.SMTP_HOST,
      port: smtpPort,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
};

export const sendMailDirect = async (payload: MailJobPayload): Promise<void> => {
  const html = await renderTemplate(payload.template, payload.data);
  const from = getMailFromAddress();

  try {
    const info = await transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      html,
    });

    log.info('Email sent via SMTP', {
      to: payload.to,
      subject: payload.subject,
      template: payload.template,
      messageId: info.messageId,
      response: info.response,
      from,
    });
  } catch (error) {
    log.error('SMTP sendMail failed', {
      to: payload.to,
      subject: payload.subject,
      template: payload.template,
      from,
      host: envs.SMTP_HOST,
      port: smtpPort,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

export const queueMail = async (options: SendMailOptions): Promise<void> => {
  const requestId = getRequestContext()?.requestId;
  await mailQueue.add(
    'send-mail',
    { ...options, requestId },
    {
      priority: options.priority ?? 5,
    },
  );
};

/** Adapter implementing MailerPort against the SMTP + queue stack. */
export const mailerAdapter: MailerPort = {
  async send(payload: MailPayload): Promise<void> {
    await queueMail({
      to: payload.to,
      subject: payload.subject,
      template: payload.template as MailJobPayload['template'],
      data: payload.data ?? {},
    });
  },
  async verify(): Promise<void> {
    const ok = await verifyMailTransport();
    if (!ok) throw new Error('SMTP transport verification failed');
  },
};

export default queueMail;
