import { AppError } from '@/shared/domain/errors/app-error';

/**
 * Contact Response-specific domain errors for clear failure modes in use cases.
 */
export class ContactResponseNotFoundError extends AppError {
  constructor(message = 'Contact Response not found') {
    super(404, message, 'CONTACT_RESPONSE_NOT_FOUND');
    this.name = 'ContactResponseNotFoundError';
  }
}

export class ContactResponseForbiddenError extends AppError {
  constructor(message = 'You do not have permission to modify this contact-response') {
    super(403, message, 'CONTACT_RESPONSE_FORBIDDEN');
    this.name = 'ContactResponseForbiddenError';
  }
}
