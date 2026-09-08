import { AppError } from '@/shared/domain/errors/app-error';

/**
 * Project-specific domain errors for clear failure modes in use cases.
 */
export class ProjectNotFoundError extends AppError {
  constructor(message = 'Project not found') {
    super(404, message, 'PROJECT_NOT_FOUND');
    this.name = 'ProjectNotFoundError';
  }
}

export class ProjectForbiddenError extends AppError {
  constructor(message = 'You do not have permission to modify this project') {
    super(403, message, 'PROJECT_FORBIDDEN');
    this.name = 'ProjectForbiddenError';
  }
}
