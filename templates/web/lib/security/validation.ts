/**
 * Input Validation Utilities
 *
 * Provides validation utilities using Zod for type-safe input validation.
 * Use these to validate all user inputs, API requests, and form data.
 */

import { z } from 'zod';

/**
 * Common validation schemas
 */
export const ValidationSchemas = {
  // Email validation
  email: z.string().email('Invalid email address'),

  // Password validation (min 8 chars, requires uppercase, lowercase, number, special char)
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[^A-Za-z0-9]/,
      'Password must contain at least one special character'
    ),

  // URL validation
  url: z.string().url('Invalid URL'),

  // Phone number validation (basic international format)
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),

  // UUID validation
  uuid: z.string().uuid('Invalid UUID'),

  // Alphanumeric only
  alphanumeric: z
    .string()
    .regex(/^[a-zA-Z0-9]+$/, 'Must contain only letters and numbers'),

  // Slug (URL-friendly string)
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Must be lowercase with hyphens only'
    ),

  // Positive integer
  positiveInt: z.number().int().positive('Must be a positive integer'),

  // Non-empty string
  nonEmpty: z.string().min(1, 'Cannot be empty'),

  // File size (in bytes)
  fileSize: (maxSize: number) =>
    z.number().max(maxSize, `File size must not exceed ${maxSize} bytes`),

  // Array with min/max length
  array: (minLength: number, maxLength: number) =>
    z
      .array(z.any())
      .min(minLength, `Must have at least ${minLength} items`)
      .max(maxLength, `Must have at most ${maxLength} items`),
};

/**
 * Validate input against a Zod schema
 *
 * @example
 * ```ts
 * const result = validateInput(
 *   ValidationSchemas.email,
 *   'user@example.com'
 * );
 *
 * if (result.success) {
 *   console.log('Valid:', result.data);
 * } else {
 *   console.error('Errors:', result.errors);
 * }
 * ```
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => err.message),
      };
    }
    return {
      success: false,
      errors: ['Validation failed'],
    };
  }
}

/**
 * Validate input and throw on error
 *
 * @example
 * ```ts
 * try {
 *   const email = validateOrThrow(ValidationSchemas.email, input);
 * } catch (error) {
 *   // Handle validation error
 * }
 * ```
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Create a validation middleware for API routes
 *
 * @example
 * ```ts
 * const schema = z.object({
 *   email: ValidationSchemas.email,
 *   password: ValidationSchemas.password,
 * });
 *
 * export async function POST(request: NextRequest) {
 *   const validation = await validateRequest(request, schema);
 *   if (!validation.success) {
 *     return NextResponse.json(
 *       { error: 'Validation failed', details: validation.errors },
 *       { status: 400 }
 *     );
 *   }
 *
 *   const { email, password } = validation.data;
 *   // Process validated data...
 * }
 * ```
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
  try {
    const body = await request.json();
    return validateInput(schema, body);
  } catch (error) {
    return {
      success: false,
      errors: ['Invalid JSON body'],
    };
  }
}

/**
 * Common validation patterns for forms
 */
export const FormValidation = {
  /**
   * Login form validation
   */
  login: z.object({
    email: ValidationSchemas.email,
    password: z.string().min(1, 'Password is required'),
  }),

  /**
   * Registration form validation
   */
  register: z
    .object({
      email: ValidationSchemas.email,
      password: ValidationSchemas.password,
      confirmPassword: z.string(),
      displayName: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be at most 50 characters'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),

  /**
   * Profile update validation
   */
  profile: z.object({
    displayName: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters')
      .optional(),
    bio: z
      .string()
      .max(500, 'Bio must be at most 500 characters')
      .optional(),
    website: ValidationSchemas.url.optional().or(z.literal('')),
  }),

  /**
   * Contact form validation
   */
  contact: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters'),
    email: ValidationSchemas.email,
    subject: z
      .string()
      .min(5, 'Subject must be at least 5 characters')
      .max(200, 'Subject must be at most 200 characters'),
    message: z
      .string()
      .min(10, 'Message must be at least 10 characters')
      .max(2000, 'Message must be at most 2000 characters'),
  }),
};

/**
 * Sanitize and validate file uploads
 *
 * @example
 * ```ts
 * const result = validateFile(file, {
 *   maxSize: 5 * 1024 * 1024, // 5MB
 *   allowedTypes: ['image/jpeg', 'image/png'],
 * });
 * ```
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  }
): { success: true } | { success: false; error: string } {
  const { maxSize, allowedTypes, allowedExtensions } = options;

  // Check file size
  if (maxSize && file.size > maxSize) {
    return {
      success: false,
      error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  // Check MIME type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check file extension
  if (allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        success: false,
        error: `File extension .${extension} is not allowed`,
      };
    }
  }

  return { success: true };
}

/**
 * Common file validation presets
 */
export const FileValidation = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
  pdf: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf'],
    allowedExtensions: ['pdf'],
  },
  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    allowedExtensions: ['pdf', 'doc', 'docx', 'txt'],
  },
};
