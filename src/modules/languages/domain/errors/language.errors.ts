import { AppError } from '@/shared/domain/errors/app-error';

/**
 * Language-specific domain errors for clear failure modes in use cases.
 */
export class LanguageNotFoundError extends AppError {
  constructor(message = 'Language not found') {
    super(404, message, 'LANGUAGE_NOT_FOUND');
    this.name = 'LanguageNotFoundError';
  }
}

export class LanguageForbiddenError extends AppError {
  constructor(message = 'You do not have permission to modify this language') {
    super(403, message, 'LANGUAGE_FORBIDDEN');
    this.name = 'LanguageForbiddenError';
  }
}
