/**
 * Security Utilities
 *
 * Comprehensive security utilities for protecting your Next.js application.
 * Includes input validation, sanitization, rate limiting, and CSRF protection.
 *
 * @module security
 */

// Export all validation utilities
export {
  ValidationSchemas,
  validateInput,
  validateOrThrow,
  validateRequest,
  FormValidation,
  validateFile,
  FileValidation,
} from './validation';

// Export all sanitization utilities
export {
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  sanitizeFilename,
  sanitizeSQL,
  sanitizeJSON,
  escapeHTML,
  sanitizeObject,
  containsXSS,
  FormSanitization,
  SecurityHeaders,
} from './sanitization';

// Export all rate limiting utilities
export {
  createRateLimiter,
  createRedisRateLimiter,
  createUserRateLimiter,
  createHeaderRateLimiter,
  createSlidingWindowRateLimiter,
  RateLimiters,
  type RateLimitConfig,
} from './rate-limit';

// Export all CSRF protection utilities
export {
  generateCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  withCSRFProtection,
  getClientCSRFToken,
  fetchWithCSRF,
  useCSRFFetch,
  CSRFTokenInput,
  withServerActionCSRF,
  verifyOrigin,
  verifyReferer,
  validateCSRFComplete,
  CSRFConfig,
} from './csrf';

/**
 * Quick start examples:
 *
 * 1. Input Validation:
 * ```ts
 * import { ValidationSchemas, validateInput } from '@/lib/security';
 *
 * const result = validateInput(ValidationSchemas.email, userInput);
 * if (!result.success) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 *
 * 2. Sanitization:
 * ```ts
 * import { sanitizeHTML, sanitizeText } from '@/lib/security';
 *
 * const safeHTML = sanitizeHTML(userInput, 'basic');
 * const plainText = sanitizeText(userInput);
 * ```
 *
 * 3. Rate Limiting:
 * ```ts
 * import { RateLimiters } from '@/lib/security';
 *
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = await RateLimiters.auth(request);
 *   if (rateLimitResult) return rateLimitResult;
 *   // Handle request...
 * }
 * ```
 *
 * 4. CSRF Protection:
 * ```ts
 * import { withCSRFProtection } from '@/lib/security';
 *
 * async function handler(request: NextRequest) {
 *   // Your logic here
 * }
 *
 * export const POST = withCSRFProtection(handler);
 * ```
 *
 * 5. Client-side CSRF:
 * ```ts
 * import { fetchWithCSRF } from '@/lib/security';
 *
 * const response = await fetchWithCSRF('/api/data', {
 *   method: 'POST',
 *   body: JSON.stringify(data),
 * });
 * ```
 */

/**
 * Security Best Practices:
 *
 * 1. Input Validation
 *    - Always validate user input on both client and server
 *    - Use Zod schemas for type-safe validation
 *    - Validate file uploads (size, type, extension)
 *
 * 2. XSS Prevention
 *    - Sanitize all user-generated content before rendering
 *    - Use appropriate sanitization level (strict, basic, rich, html)
 *    - Escape HTML entities when rendering in HTML context
 *    - Never use dangerouslySetInnerHTML with unsanitized content
 *
 * 3. CSRF Protection
 *    - Use CSRF tokens for all state-changing operations
 *    - Verify origin and referer headers
 *    - Use httpOnly cookies for token storage
 *    - Implement SameSite cookie attribute
 *
 * 4. Rate Limiting
 *    - Apply strict rate limits to auth endpoints (5 req/15min)
 *    - Use moderate limits for API endpoints (100 req/15min)
 *    - Implement sliding window for better accuracy
 *    - Consider Redis for production multi-server setups
 *
 * 5. SQL Injection Prevention
 *    - Always use parameterized queries or ORMs
 *    - Never concatenate user input into SQL queries
 *    - Use sanitizeSQL() as defense-in-depth only
 *
 * 6. File Upload Security
 *    - Validate file type, size, and extension
 *    - Sanitize filenames to prevent directory traversal
 *    - Store uploaded files outside web root
 *    - Use virus scanning for user uploads
 *
 * 7. Authentication
 *    - Use httpOnly cookies for session tokens
 *    - Implement secure password requirements
 *    - Use bcrypt/scrypt for password hashing
 *    - Implement account lockout after failed attempts
 *
 * 8. HTTPS and Headers
 *    - Always use HTTPS in production
 *    - Set security headers (HSTS, CSP, X-Frame-Options, etc.)
 *    - Implement proper CORS configuration
 *    - Use SameSite cookies
 *
 * 9. Secrets Management
 *    - Never commit secrets to git
 *    - Use environment variables for secrets
 *    - Rotate credentials regularly
 *    - Use secret management services (AWS Secrets Manager, etc.)
 *
 * 10. Dependency Security
 *     - Keep dependencies up to date
 *     - Run security audits (npm audit, Snyk)
 *     - Monitor for vulnerabilities
 *     - Use dependabot for automatic updates
 */
