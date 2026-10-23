import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/shared/domain/errors/app-error';
import { formatErrorResponse } from '@/shared/domain/errors/format-error-response';

/**
 * Mirrors the JWT error → AppError mapping in authenticate.middleware.
 * Keeps the contract under test without booting Express + Prisma.
 */
function mapAccessTokenVerifyError(error: unknown): AppError {
  const name = error instanceof Error ? error.name : '';
  if (name === 'TokenExpiredError') {
    return AppError.unauthorized('Access token expired');
  }
  if (name === 'JsonWebTokenError' || name === 'NotBeforeError') {
    return AppError.unauthorized('Invalid access token');
  }
  throw error;
}

describe('authenticate JWT error contract', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('maps TokenExpiredError to AppError 401 then HTTP 401', () => {
    const err = Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' });
    const appErr = mapAccessTokenVerifyError(err);
    expect(appErr).toBeInstanceOf(AppError);
    expect(appErr.statusCode).toBe(401);
    expect(appErr.message).toBe('Access token expired');

    const http = formatErrorResponse(appErr, false);
    expect(http.statusCode).toBe(401);
    expect(http.body.code).toBe('UNAUTHORIZED');
  });

  it('maps JsonWebTokenError to AppError 401', () => {
    const err = Object.assign(new Error('invalid signature'), { name: 'JsonWebTokenError' });
    const appErr = mapAccessTokenVerifyError(err);
    expect(appErr.statusCode).toBe(401);
    expect(appErr.message).toBe('Invalid access token');
  });

  it('still maps raw TokenExpiredError via formatErrorResponse defense-in-depth', () => {
    const err = Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' });
    const http = formatErrorResponse(err, false);
    expect(http.statusCode).toBe(401);
    expect(http.body.message).toBe('Access token expired');
  });

  it('does not swallow unexpected errors as 401', () => {
    expect(() => mapAccessTokenVerifyError(new Error('db down'))).toThrow('db down');
  });
});
