import { AppError } from '@/shared/domain/errors/app-error';

/**
 * Contact Info-specific domain errors for clear failure modes in use cases.
 */
export class ContactInfoNotFoundError extends AppError {
  constructor(message = 'Contact Info not found') {
    super(404, message, 'CONTACT_INFO_NOT_FOUND');
    this.name = 'ContactInfoNotFoundError';
  }
}

export class ContactInfoForbiddenError extends AppError {
  constructor(message = 'You do not have permission to modify this contact-info') {
    super(403, message, 'CONTACT_INFO_FORBIDDEN');
    this.name = 'ContactInfoForbiddenError';
  }
}
