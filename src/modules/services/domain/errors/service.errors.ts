import { AppError } from '@/shared/domain/errors/app-error';

/**
 * Service-specific domain errors for clear failure modes in use cases.
 */
export class ServiceNotFoundError extends AppError {
  constructor(message = 'Service not found') {
    super(404, message, 'SERVICE_NOT_FOUND');
    this.name = 'ServiceNotFoundError';
  }
}

export class ServiceForbiddenError extends AppError {
  constructor(message = 'You do not have permission to modify this service') {
    super(403, message, 'SERVICE_FORBIDDEN');
    this.name = 'ServiceForbiddenError';
  }
}
