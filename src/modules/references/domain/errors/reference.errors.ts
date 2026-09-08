import { AppError } from '@/shared/domain/errors/app-error';

/**
 * Reference-specific domain errors for clear failure modes in use cases.
 */
export class ReferenceNotFoundError extends AppError {
  constructor(message = 'Reference not found') {
    super(404, message, 'REFERENCE_NOT_FOUND');
    this.name = 'ReferenceNotFoundError';
  }
}

export class ReferenceForbiddenError extends AppError {
  constructor(message = 'You do not have permission to modify this reference') {
    super(403, message, 'REFERENCE_FORBIDDEN');
    this.name = 'ReferenceForbiddenError';
  }
}
