/** Known EJS mail template identifiers. */
export type MailTemplateName =
  | 'otp'
  | 'welcome'
  | 'reset-password'
  | 'alert-login'
  | 'account-deleted'
  | 'account-restored'
  | 'password-changed'
  | 'role-changed'
  | 'user-invited'
  | 'db-notification-success'
  | 'db-notification-error'
  | 'newsletter-confirm'
  | 'newsletter-welcome'
  | 'newsletter-blog-alert'
  | 'newsletter-digest'
  | 'newsletter-broadcast'
  | 'newsletter-unsubscribed';

export interface MailJobPayload {
  to: string;
  subject: string;
  template: MailTemplateName;
  data: Record<string, unknown>;
  /** Correlates async mail delivery with the HTTP request that enqueued it. */
  requestId?: string;
}

export interface SendMailOptions extends MailJobPayload {
  priority?: number;
}
