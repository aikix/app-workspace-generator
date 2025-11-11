/**
 * API Error Handling
 *
 * Custom error classes and error handling utilities for API routes
 */

import { apiError, apiServerError, apiValidationError } from './response';

/**
 * Base API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Validation Error
 */
export class ValidationError extends ApiError {
  constructor(
    message: string,
    public validationErrors: Record<string, string[]>
  ) {
    super(message, 400, 'VALIDATION_ERROR', validationErrors);
    this.name = 'ValidationError';
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Unauthorized Error
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden Error
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

/**
 * Rate Limit Error
 */
export class RateLimitError extends ApiError {
  constructor(
    message = 'Too many requests',
    public retryAfter?: number
  ) {
    super(message, 429, 'TOO_MANY_REQUESTS');
    this.name = 'RateLimitError';
  }
}

/**
 * Handle errors in API routes
 *
 * @example
 * try {
 *   // API logic
 * } catch (error) {
 *   return handleApiError(error);
 * }
 */
export function handleApiError(error: unknown): Response {
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }

  // Handle known API errors
  if (error instanceof ValidationError) {
    return apiValidationError(error.message, error.validationErrors);
  }

  if (error instanceof ApiError) {
    return apiError(error.message, {
      code: error.code,
      status: error.statusCode,
      details: error.details,
    });
  }

  // Handle unknown errors
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred';

  return apiServerError(message, error);
}

/**
 * Async error handler wrapper for API routes
 *
 * @example
 * export const GET = withErrorHandler(async (request) => {
 *   const data = await fetchData();
 *   return apiSuccess(data);
 * });
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<Response>
): (...args: T) => Promise<Response> {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
