import { AppError } from '@/shared/domain/errors/app-error';

/**
 * Certification-specific domain errors for clear failure modes in use cases.
 */
export class CertificationNotFoundError extends AppError {
  constructor(message = 'Certification not found') {
    super(404, message, 'CERTIFICATION_NOT_FOUND');
    this.name = 'CertificationNotFoundError';
  }
}

export class CertificationForbiddenError extends AppError {
  constructor(message = 'You do not have permission to modify this certification') {
    super(403, message, 'CERTIFICATION_FORBIDDEN');
    this.name = 'CertificationForbiddenError';
  }
}
