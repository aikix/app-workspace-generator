/**
 * API Validation Utilities
 *
 * Request validation helpers for API routes
 */

import { ValidationError } from './errors';

export type ValidationRule = {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
};

export type ValidationSchema = Record<string, ValidationRule>;

/**
 * Validate request body against a schema
 *
 * @example
 * const body = await request.json();
 * validateBody(body, {
 *   email: { required: true, pattern: /^.+@.+\..+$/ },
 *   name: { required: true, min: 2, max: 50 }
 * });
 */
export function validateBody(
  body: Record<string, unknown>,
  schema: ValidationSchema
): void {
  const errors: Record<string, string[]> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];
    const fieldErrors: string[] = [];

    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      fieldErrors.push(`${field} is required`);
      continue;
    }

    // Skip other validations if field is not required and empty
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // String length validation
    if (typeof value === 'string') {
      if (rules.min !== undefined && value.length < rules.min) {
        fieldErrors.push(`${field} must be at least ${rules.min} characters`);
      }
      if (rules.max !== undefined && value.length > rules.max) {
        fieldErrors.push(`${field} must be at most ${rules.max} characters`);
      }
    }

    // Number range validation
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        fieldErrors.push(`${field} must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        fieldErrors.push(`${field} must be at most ${rules.max}`);
      }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string') {
      if (!rules.pattern.test(value)) {
        fieldErrors.push(`${field} format is invalid`);
      }
    }

    // Custom validation
    if (rules.custom) {
      const result = rules.custom(value);
      if (typeof result === 'string') {
        fieldErrors.push(result);
      } else if (result === false) {
        fieldErrors.push(`${field} is invalid`);
      }
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

/**
 * Validate query parameters
 *
 * @example
 * const { searchParams } = new URL(request.url);
 * validateQuery(searchParams, {
 *   page: { required: false, custom: (v) => Number(v) > 0 }
 * });
 */
export function validateQuery(
  searchParams: URLSearchParams,
  schema: ValidationSchema
): void {
  const query: Record<string, string | undefined> = {};

  for (const key of searchParams.keys()) {
    query[key] = searchParams.get(key) || undefined;
  }

  validateBody(query as Record<string, unknown>, schema);
}

/**
 * Parse and validate JSON request body
 *
 * @example
 * const body = await parseBody(request, {
 *   email: { required: true },
 *   password: { required: true, min: 8 }
 * });
 */
export async function parseBody<T = Record<string, unknown>>(
  request: Request,
  schema?: ValidationSchema
): Promise<T> {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    throw new ValidationError('Invalid JSON body', {
      body: ['Request body must be valid JSON'],
    });
  }

  if (schema) {
    validateBody(body, schema);
  }

  return body as T;
}

/**
 * Common validation patterns
 */
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  phone: /^\+?[1-9]\d{1,14}$/,
};

/**
 * Common validation rules
 */
export const rules = {
  email: {
    required: true,
    pattern: patterns.email,
  },
  password: {
    required: true,
    min: 8,
    max: 100,
  },
  url: {
    pattern: patterns.url,
  },
  uuid: {
    pattern: patterns.uuid,
  },
};
