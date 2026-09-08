import { AppError } from '@/shared/domain/errors/app-error';

export class NewsletterSubscriberNotFoundError extends AppError {
  constructor(message = 'Newsletter subscriber not found') {
    super(404, message, 'NEWSLETTER_SUBSCRIBER_NOT_FOUND');
    this.name = 'NewsletterSubscriberNotFoundError';
  }
}

export class NewsletterTokenInvalidError extends AppError {
  constructor(message = 'Invalid or expired newsletter token') {
    super(400, message, 'NEWSLETTER_TOKEN_INVALID');
    this.name = 'NewsletterTokenInvalidError';
  }
}

export class NewsletterCampaignNotFoundError extends AppError {
  constructor(message = 'Newsletter campaign not found') {
    super(404, message, 'NEWSLETTER_CAMPAIGN_NOT_FOUND');
    this.name = 'NewsletterCampaignNotFoundError';
  }
}

export class NewsletterAlreadySendingError extends AppError {
  constructor(message = 'A campaign of this type is already in progress') {
    super(409, message, 'NEWSLETTER_ALREADY_SENDING');
    this.name = 'NewsletterAlreadySendingError';
  }
}
