import { AppError } from '@/shared/domain/errors/app-error';

/**
 * Achievement-specific domain errors for clear failure modes in use cases.
 */
export class AchievementNotFoundError extends AppError {
  constructor(message = 'Achievement not found') {
    super(404, message, 'ACHIEVEMENT_NOT_FOUND');
    this.name = 'AchievementNotFoundError';
  }
}

export class AchievementForbiddenError extends AppError {
  constructor(message = 'You do not have permission to modify this achievement') {
    super(403, message, 'ACHIEVEMENT_FORBIDDEN');
    this.name = 'AchievementForbiddenError';
  }
}
