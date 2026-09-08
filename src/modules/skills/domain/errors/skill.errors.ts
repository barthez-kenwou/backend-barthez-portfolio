import { AppError } from '@/shared/domain/errors/app-error';

/**
 * Skill-specific domain errors for clear failure modes in use cases.
 */
export class SkillNotFoundError extends AppError {
  constructor(message = 'Skill not found') {
    super(404, message, 'SKILL_NOT_FOUND');
    this.name = 'SkillNotFoundError';
  }
}

export class SkillForbiddenError extends AppError {
  constructor(message = 'You do not have permission to modify this skill') {
    super(403, message, 'SKILL_FORBIDDEN');
    this.name = 'SkillForbiddenError';
  }
}
