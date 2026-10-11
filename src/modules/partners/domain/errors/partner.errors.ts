import { AppError } from '@/shared/domain/errors/app-error';

export class PartnerNotFoundError extends AppError {
  constructor(message = 'Partner not found') {
    super(404, message, 'PARTNER_NOT_FOUND');
    this.name = 'PartnerNotFoundError';
  }
}

export class PartnerForbiddenError extends AppError {
  constructor(message = 'You do not have permission to modify this partner') {
    super(403, message, 'PARTNER_FORBIDDEN');
    this.name = 'PartnerForbiddenError';
  }
}
