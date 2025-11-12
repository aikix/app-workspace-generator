/**
 * API Response Helpers
 *
 * Standardized response utilities for API routes
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a successful API response
 */
export function apiSuccess<T>(
  data: T,
  options?: {
    message?: string;
    status?: number;
    headers?: HeadersInit;
  }
): Response {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(options?.message && { message: options.message }),
  };

  return Response.json(response, {
    status: options?.status || 200,
    headers: options?.headers,
  });
}

/**
 * Create an error API response
 */
export function apiError(
  message: string,
  options?: {
    code?: string;
    details?: unknown;
    status?: number;
    headers?: HeadersInit;
  }
): Response {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      message,
      ...(options?.code ? { code: options.code } : {}),
      ...(options?.details ? { details: options.details } : {}),
    },
  };

  return Response.json(response, {
    status: options?.status || 400,
    headers: options?.headers,
  });
}

/**
 * Create a 404 Not Found response
 */
export function apiNotFound(message = 'Resource not found'): Response {
  return apiError(message, {
    code: 'NOT_FOUND',
    status: 404,
  });
}

/**
 * Create a 401 Unauthorized response
 */
export function apiUnauthorized(message = 'Unauthorized'): Response {
  return apiError(message, {
    code: 'UNAUTHORIZED',
    status: 401,
  });
}

/**
 * Create a 403 Forbidden response
 */
export function apiForbidden(message = 'Forbidden'): Response {
  return apiError(message, {
    code: 'FORBIDDEN',
    status: 403,
  });
}

/**
 * Create a 500 Internal Server Error response
 */
export function apiServerError(
  message = 'Internal server error',
  details?: unknown
): Response {
  return apiError(message, {
    code: 'INTERNAL_SERVER_ERROR',
    status: 500,
    details: process.env.NODE_ENV === 'development' ? details : undefined,
  });
}

/**
 * Create a 429 Too Many Requests response
 */
export function apiTooManyRequests(
  message = 'Too many requests',
  retryAfter?: number
): Response {
  const headers: HeadersInit = {};
  if (retryAfter) {
    headers['Retry-After'] = String(retryAfter);
  }

  return apiError(message, {
    code: 'TOO_MANY_REQUESTS',
    status: 429,
    headers,
  });
}

/**
 * Create a 400 Bad Request response with validation errors
 */
export function apiValidationError(
  message: string,
  validationErrors: Record<string, string[]>
): Response {
  return apiError(message, {
    code: 'VALIDATION_ERROR',
    status: 400,
    details: validationErrors,
  });
}

/**
 * Common CORS headers for API routes
 */
export const corsHeaders: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * Handle OPTIONS request for CORS preflight
 */
export function apiCorsPreflightResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
