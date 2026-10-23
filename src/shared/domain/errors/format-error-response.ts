import { isAppError } from './app-error';

/**
 * Stable JSON shape returned to API clients on failure.
 * Kept next to the formatter — not on the domain error type itself.
 */
export type ErrorResponseBody = {
  success: false;
  message: string;
  code?: string;
  details?: unknown;
  requestId?: string;
  stack?: string;
};

export type FormattedError = {
  statusCode: number;
  body: ErrorResponseBody;
};

/**
 * Map any thrown value to a consistent HTTP status + body.
 *
 * - Known `AppError` → status/code/details as thrown
 * - Validation libraries (`name === 'ValidationError'`) → 400
 * - Everything else → 500; message/stack only when `includeStack` (dev)
 *
 * Pure function: no Express types, safe to unit-test in isolation.
 */
export const formatErrorResponse = (
  error: unknown,
  includeStack = false,
  requestId?: string,
): FormattedError => {
  const requestIdField = requestId ? { requestId } : {};

  if (isAppError(error)) {
    return {
      statusCode: error.statusCode,
      body: {
        success: false,
        message: error.message,
        code: error.code,
        details: error.details,
        ...requestIdField,
        ...(includeStack ? { stack: error.stack } : {}),
      },
    };
  }

  if (error instanceof Error && error.name === 'ValidationError') {
    return {
      statusCode: 400,
      body: {
        success: false,
        message: error.message,
        code: 'VALIDATION_ERROR',
        ...requestIdField,
      },
    };
  }

  // jsonwebtoken — defense in depth if a caller forgets to map these to AppError
  if (error instanceof Error) {
    if (error.name === 'TokenExpiredError') {
      return {
        statusCode: 401,
        body: {
          success: false,
          message: 'Access token expired',
          code: 'UNAUTHORIZED',
          ...requestIdField,
        },
      };
    }
    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      return {
        statusCode: 401,
        body: {
          success: false,
          message: 'Invalid access token',
          code: 'UNAUTHORIZED',
          ...requestIdField,
        },
      };
    }
  }

  // body-parser / raw-body: PayloadTooLargeError (status 413, type entity.too.large)
  const legacyStatus =
    (error as { status?: unknown; statusCode?: unknown } | null)?.statusCode ??
    (error as { status?: unknown } | null)?.status;
  if (
    typeof legacyStatus === 'number' &&
    legacyStatus >= 400 &&
    legacyStatus < 500 &&
    error instanceof Error
  ) {
    const tooLarge =
      (error as { type?: string }).type === 'entity.too.large' || /too large/i.test(error.message);
    return {
      statusCode: legacyStatus,
      body: {
        success: false,
        message: tooLarge ? 'Request body too large' : error.message,
        code: tooLarge ? 'PAYLOAD_TOO_LARGE' : 'CLIENT_ERROR',
        ...requestIdField,
        ...(includeStack ? { stack: error.stack } : {}),
      },
    };
  }

  const message = error instanceof Error ? error.message : 'An unexpected error occurred';

  return {
    statusCode: 500,
    body: {
      success: false,
      message: includeStack ? message : 'Internal server error',
      code: 'INTERNAL_ERROR',
      ...requestIdField,
      ...(includeStack && error instanceof Error ? { stack: error.stack } : {}),
    },
  };
};
