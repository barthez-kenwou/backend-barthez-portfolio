import { AppError } from '@/shared/domain/errors/app-error';

/**
 * Education-specific domain errors for clear failure modes in use cases.
 */
export class EducationNotFoundError extends AppError {
  constructor(message = 'Education not found') {
    super(404, message, 'EDUCATION_NOT_FOUND');
    this.name = 'EducationNotFoundError';
  }
}

export class EducationForbiddenError extends AppError {
  constructor(message = 'You do not have permission to modify this education') {
    super(403, message, 'EDUCATION_FORBIDDEN');
    this.name = 'EducationForbiddenError';
  }
}
