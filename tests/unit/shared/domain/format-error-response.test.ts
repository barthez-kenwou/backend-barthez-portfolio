import { describe, expect, it } from 'vitest';

import { formatErrorResponse } from '@/shared/domain/errors/format-error-response';

describe('formatErrorResponse', () => {
  it('includes requestId when provided', () => {
    const { body } = formatErrorResponse(new Error('boom'), false, 'req-abc');
    expect(body.requestId).toBe('req-abc');
    expect(body.success).toBe(false);
  });

  it('maps body-parser PayloadTooLargeError to 413', () => {
    const err = Object.assign(new Error('request entity too large'), {
      type: 'entity.too.large',
      status: 413,
      statusCode: 413,
    });
    const { statusCode, body } = formatErrorResponse(err, false);
    expect(statusCode).toBe(413);
    expect(body.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it('maps TokenExpiredError to 401', () => {
    const err = Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' });
    const { statusCode, body } = formatErrorResponse(err, false);
    expect(statusCode).toBe(401);
    expect(body.code).toBe('UNAUTHORIZED');
    expect(body.message).toBe('Access token expired');
  });

  it('maps JsonWebTokenError to 401', () => {
    const err = Object.assign(new Error('invalid token'), { name: 'JsonWebTokenError' });
    const { statusCode, body } = formatErrorResponse(err, false);
    expect(statusCode).toBe(401);
    expect(body.code).toBe('UNAUTHORIZED');
    expect(body.message).toBe('Invalid access token');
  });
});
