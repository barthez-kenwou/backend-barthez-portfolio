import { AppError } from '@/shared/domain/errors/app-error';

/**
 * Testimonial-specific domain errors for clear failure modes in use cases.
 */
export class TestimonialNotFoundError extends AppError {
  constructor(message = 'Testimonial not found') {
    super(404, message, 'TESTIMONIAL_NOT_FOUND');
    this.name = 'TestimonialNotFoundError';
  }
}

export class TestimonialForbiddenError extends AppError {
  constructor(message = 'You do not have permission to modify this testimonial') {
    super(403, message, 'TESTIMONIAL_FORBIDDEN');
    this.name = 'TestimonialForbiddenError';
  }
}

export class TestimonialInvalidProjectError extends AppError {
  constructor(message = 'Selected project is invalid or not available for testimonials') {
    super(400, message, 'TESTIMONIAL_INVALID_PROJECT');
    this.name = 'TestimonialInvalidProjectError';
  }
}
