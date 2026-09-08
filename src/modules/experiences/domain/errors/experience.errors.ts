import { AppError } from '@/shared/domain/errors/app-error';

/**
 * Experience-specific domain errors for clear failure modes in use cases.
 */
export class ExperienceNotFoundError extends AppError {
  constructor(message = 'Experience not found') {
    super(404, message, 'EXPERIENCE_NOT_FOUND');
    this.name = 'ExperienceNotFoundError';
  }
}

export class ExperienceForbiddenError extends AppError {
  constructor(message = 'You do not have permission to modify this experience') {
    super(403, message, 'EXPERIENCE_FORBIDDEN');
    this.name = 'ExperienceForbiddenError';
  }
}
